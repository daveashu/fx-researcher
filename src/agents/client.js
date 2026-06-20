// ─────────────────────────────────────────────────────────────
//  Shared Google Gemini API client with optional web search placeholder
// ─────────────────────────────────────────────────────────────

import { CONFIG } from "../config/settings.js";

const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

/**
 * Call Google Gemini with optional web search placeholder.
 * Returns the full text response as a string.
 * If useWebSearch is true, the Gemini tool configuration for search can be added here.
 */
export async function callClaude({ systemPrompt, userPrompt, useWebSearch = true, label = "" }) {
  const url = `${GOOGLE_API_BASE}${CONFIG.model}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
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
