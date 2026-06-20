// ─────────────────────────────────────────────────────────────
//  TEAM 1 › Sub-agent 1.1 — Market Analyst
//  Deep 1-day macro & technical market analysis for a currency pair
// ─────────────────────────────────────────────────────────────

import { callClaude, log } from "./claude_client.js";

const SYSTEM = `You are a senior FX market analyst at a top-tier institutional desk.
Your job is to produce a concise but comprehensive 1-day market analysis for a given currency pair.

Cover ALL of the following in your analysis:
1. MACRO CONTEXT — Central bank stance, interest rate differential, recent economic data releases
2. TECHNICAL PICTURE — Key support/resistance levels, trend direction on D1 chart, EMA alignment
3. MARKET SENTIMENT — Risk-on/off environment, positioning bias, volatility regime (ATR context)
4. KEY LEVELS — Pivot point, today's S1/R1, last week's high/low, psychological round numbers
5. YESTERDAY'S PRICE ACTION — Open, high, low, close; candle body/wick structure; what it tells us
6. BIAS FOR TODAY — Bullish / Bearish / Neutral with conviction level (High / Medium / Low)

Be precise. Use numbers. No filler sentences. Output structured markdown.`;

export async function runMarketAnalyst(pair, date) {
  log("Market Analyst", `Analysing ${pair} for ${date}...`);

  const userPrompt = `
Perform a full 1-day market analysis for ${pair} as of ${date} (Tokyo open, ~08:00 JST).
Search the web for the latest price action, macro news, and key levels.
Return a structured markdown report covering all 6 sections in your system prompt.
Be specific — include actual price levels and percentage figures where possible.
`;

  const result = await callClaude({
    systemPrompt: SYSTEM,
    userPrompt,
    useWebSearch: true,
    label: "MarketAnalyst",
  });

  log("Market Analyst", `✓ ${pair} analysis complete`);
  return { agent: "market_analyst", pair, date, analysis: result };
}
