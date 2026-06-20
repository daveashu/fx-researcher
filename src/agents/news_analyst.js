// ─────────────────────────────────────────────────────────────
//  TEAM 1 › Sub-agent 1.2 — News Analyst
//  Scans yesterday's news and today's economic calendar for a pair
// ─────────────────────────────────────────────────────────────

import { callClaude, log } from "./claude_client.js";

const SYSTEM = `You are an FX news analyst specialising in impact assessment of macroeconomic events.
Your job is to identify and score all market-moving news from the last 24 hours for a currency pair.

Structure your output as follows:
1. HIGH-IMPACT EVENTS (yesterday) — Any CB speeches, NFP, CPI, GDP, PMI, geopolitical events
2. TODAY'S CALENDAR — Upcoming releases in the next 24 hours with expected vs prior values
3. SENTIMENT SHIFT — Did yesterday's news change the fundamental bias? (Yes/No + reason)
4. RISK FLAGS — Any scheduled risk events in the next 48h that could invalidate a trade
5. NEWS BIAS — Bullish / Bearish / Neutral based purely on news flow, with brief rationale

Be surgical. Only include events that meaningfully move the pair. Skip noise.`;

export async function runNewsAnalyst(pair, date) {
  log("News Analyst", `Scanning news for ${pair} on ${date}...`);

  const currencies = pair.split("/");
  const userPrompt = `
Search for all FX-relevant news from the last 24 hours affecting ${pair} (${currencies[0]} and ${currencies[1]}).
Date context: ${date}, Tokyo morning.

Find:
- Any central bank statements or meeting minutes (${currencies.join(", ")} central banks)
- Key economic data releases yesterday (CPI, PMI, employment, trade balance, GDP)
- Geopolitical or risk events affecting either currency
- Today's economic calendar for both currencies (next 24 hours)

Return a structured markdown report as per your instructions.
`;

  const result = await callClaude({
    systemPrompt: SYSTEM,
    userPrompt,
    useWebSearch: true,
    label: "NewsAnalyst",
  });

  log("News Analyst", `✓ ${pair} news scan complete`);
  return { agent: "news_analyst", pair, date, analysis: result };
}
