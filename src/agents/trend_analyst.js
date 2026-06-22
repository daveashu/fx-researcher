// ─────────────────────────────────────────────────────────────
//  TEAM 1 › Sub-agent 1.3 — Trend Analyst
//  Checks public FX community sites for prevailing trader sentiment & trends
// ─────────────────────────────────────────────────────────────

import { callLLM, log } from "./client.js";

const SYSTEM = `You are an FX trend and sentiment analyst. Your job is to gauge the prevailing
market trend and retail/institutional sentiment for a currency pair by searching public sources.

Sources to check (search for recent content from these):
- TradingView ideas and community sentiment for the pair
- Myfxbook community outlook / positioning data
- DailyFX or FXStreet analyst forecasts
- Twitter/X FX community consensus (search "[$PAIR forecast" or "$PAIR analysis")
- COT (Commitment of Traders) data if available

Structure your output:
1. TREND DIRECTION — D1 trend: Uptrend / Downtrend / Ranging (with evidence)
2. COMMUNITY SENTIMENT — % bullish vs bearish from public sources (cite source)
3. INSTITUTIONAL POSITIONING — COT net positioning if findable; smart money bias
4. POPULAR TRADE IDEAS — What are the top 2-3 trade ideas circulating publicly?
5. CONTRARIAN FLAG — Is sentiment so one-sided it warrants a contrarian view?
6. TREND BIAS — Bull / Bear / Neutral with confidence level

Always cite the source and approximate date of any data you reference.`;

export async function runTrendAnalyst(pair, date) {
  log("Trend Analyst", `Scanning public trends for ${pair}...`);

  const userPrompt = `
Search public FX sites and communities for current trend and sentiment on ${pair} as of ${date}.

Search for:
- TradingView ${pair} community sentiment and top ideas
- ${pair} COT positioning latest data
- FXStreet or DailyFX ${pair} forecast ${date}
- Myfxbook ${pair} community outlook

Synthesise into a structured markdown trend report as per your instructions.
`;

  const result = await callLLM({
    systemPrompt: SYSTEM,
    userPrompt,
    useWebSearch: true,
    label: "TrendAnalyst",
  });

  log("Trend Analyst", `✓ ${pair} trend scan complete`);
  return { agent: "trend_analyst", pair, date, analysis: result };
}
