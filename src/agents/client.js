// ─────────────────────────────────────────────────────────────
//  Shared AI client with realtime web search support
// ─────────────────────────────────────────────────────────────

import { CONFIG } from "../config/settings.js";

const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

async function fetchWebSearch(query, maxResults = 3) {
  const searchUrl = `https://html.duckduckgo.com/html?q=${encodeURIComponent(query)}`;
  const res = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; fx-signal-bot/1.0)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`Web search failed with status ${res.status}`);
  }

  const html = await res.text();
  const results = [];
  const linkRE = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  const snippetRE = /<a[^>]+class="result__snippet"[^>]*>(.*?)<\/a>/gi;

  let match;
  const titles = [];
  while ((match = linkRE.exec(html)) && titles.length < maxResults) {
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    const url = match[1];
    titles.push({ title, url });
  }

  let snippetMatch;
  let i = 0;
  while ((snippetMatch = snippetRE.exec(html)) && i < titles.length) {
    const snippet = snippetMatch[1].replace(/<[^>]+>/g, "").trim();
    titles[i].snippet = snippet;
    i += 1;
  }

  for (const item of titles) {
    results.push(`${item.title}${item.snippet ? `\n${item.snippet}` : ""}\n${item.url}`);
  }

  if (results.length === 0) {
    return `No realtime search results found for: ${query}`;
  }

  return results.join("\n\n");
}

/**
 * Call Google Gemini with optional realtime web search integration.
 * Returns the full text response as a string.
 */
export async function callLLM({ systemPrompt, userPrompt, useWebSearch = true, searchQuery = "", label = "" }) {
  let searchContext = "";
  if (useWebSearch) {
    const query = searchQuery || userPrompt.split("\n")[0] || "latest market news";
    try {
      const results = await fetchWebSearch(query);
      searchContext = `\n\n=== Realtime Web Search Results ===\n${results}`;
    } catch (err) {
      searchContext = `\n\n=== Realtime Web Search Results Failed ===\n${err.message}`;
    }
  }

  const url = `${GOOGLE_API_BASE}${CONFIG.model}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}${searchContext}` }],
      },
    ],
    generationConfig: {
      maxOutputTokens: CONFIG.maxTokens,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[${label}] Google API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return text;
}

/** Simple logger with timestamp */
export function log(team, msg) {
  const ts = new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour12: false });
  console.log(`[${ts} JST] [${team}] ${msg}`);
}
