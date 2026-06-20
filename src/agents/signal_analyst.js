// ─────────────────────────────────────────────────────────────
//  TEAM 3 — Signal Analyst
//  Vets all strategy outputs and generates final BUY/SELL/HOLD signals
// ─────────────────────────────────────────────────────────────

import { callClaude, log } from "./claude_client.js";

const SYSTEM = `You are the Chief Signal Officer of an institutional FX desk.
Your job is to receive strategy analysis from multiple strategy analysts and make the FINAL
determination on whether to issue a BUY, SELL, or HOLD signal for a currency pair.

Your vetting criteria:
1. CONFLUENCE — Do multiple strategies agree? Confluence = higher confidence
2. RISK/REWARD — Reject any signal with R:R worse than 1:1.5
3. NEWS FILTER — No signals if a high-impact event is due within 4 hours of the JST open
4. TREND ALIGNMENT — Prefer signals aligned with the D1 trend (counter-trend = lower confidence)
5. CONFLICTING SIGNALS — If strategies disagree (one says BUY, one says SELL) → HOLD
6. QUALITY OVER QUANTITY — A clear HOLD is better than a weak signal

OUTPUT FORMAT (always produce this exact structure):

## FINAL SIGNAL — [PAIR] — [DATE]

| Field | Value |
|-------|-------|
| Signal | 🟢 BUY / 🔴 SELL / ⚪ HOLD |
| Confidence | High / Medium / Low |
| Primary Strategy | [which strategy triggered] |
| Entry | [price or level] |
| Stop Loss | [price] |
| Target 1 | [price] |
| Target 2 | [price] |
| R:R Ratio | [e.g. 1:2.3] |
| Valid Until | [e.g. Tokyo close today / next 24h] |

**Signal Rationale**: [3-4 sentences explaining why this signal was issued or why HOLD]
**Risk Warnings**: [any caveats, news events, or conditions that could invalidate]
**Key Level to Watch**: [the one price that would flip your view]`;

export async function runSignalAnalyst(pair, date, strategyResults, analystOutputs) {
  log("Signal Analyst", `Generating final signal for ${pair}...`);

  const strategyText = strategyResults.map(s =>
    `### ${s.strategyName}\n${s.result}`
  ).join("\n\n");

  const newsContext = analystOutputs.find(o => o.agent === "news_analyst")?.analysis || "";
  const marketContext = analystOutputs.find(o => o.agent === "market_analyst")?.analysis || "";

  const userPrompt = `
Vet the following strategy outputs for ${pair} and issue a final trading signal for ${date}.

=== STRATEGY OUTPUTS ===
${strategyText}

=== NEWS FILTER CONTEXT ===
${newsContext}

=== MARKET BIAS CONTEXT ===
${marketContext}

Apply your vetting criteria strictly. If strategies conflict or quality is poor → HOLD.
Output in the exact table format specified in your instructions.
`;

  const result = await callClaude({
    systemPrompt: SYSTEM,
    userPrompt,
    useWebSearch: false,
    label: "SignalAnalyst",
  });

  log("Signal Analyst", `✓ Signal generated for ${pair}`);
  return { pair, date, signal: result };
}
