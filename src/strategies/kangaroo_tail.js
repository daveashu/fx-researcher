// ─────────────────────────────────────────────────────────────
//  STRATEGY: Kangaroo Tail (Price Action Reversal)
// ─────────────────────────────────────────────────────────────
//
//  The Kangaroo Tail (KT) is a price-action reversal pattern:
//  - A long wick (tail) on yesterday's candle showing strong rejection
//  - Tail must be at least 2x the candle body
//  - Occurs at a meaningful support/resistance or structural level
//  - Entry is on break of the opposite end of the candle (body high/low)
//  - Stop loss behind the tip of the tail
//  - Target: 1:2 or 1:3 risk/reward to next key level
//
//  Bullish KT: long lower tail at support → bias LONG
//  Bearish KT: long upper tail at resistance → bias SHORT
// ─────────────────────────────────────────────────────────────

export const STRATEGY_NAME = "Kangaroo Tail";

export const SYSTEM_PROMPT = `You are a specialist FX strategy analyst evaluating whether a
Kangaroo Tail (KT) reversal pattern has formed on yesterday's 1-day candle for a currency pair.

KANGAROO TAIL RULES:
1. Yesterday's candle must have a prominent tail (wick) — at least 2x the size of the candle body
2. The tail must point TOWARD a key level (support, resistance, round number, swing high/low)
3. The body must close AWAY from that level (showing rejection)
4. The tail should be the longest wick relative to recent candles (stands out visually)
5. Volume or momentum confirmation is a plus but not mandatory

BULLISH KT (Buy Signal):
- Long lower wick at support / demand zone
- Close near top of candle
- Entry: break above yesterday's high
- Stop Loss: below the tip of the lower tail (+ small buffer)
- Target: next resistance level or 1:2.5 R:R minimum

BEARISH KT (Sell Signal):
- Long upper wick at resistance / supply zone
- Close near bottom of candle
- Entry: break below yesterday's low
- Stop Loss: above the tip of the upper tail (+ small buffer)
- Target: next support level or 1:2.5 R:R minimum

INVALIDATION: Do NOT trigger if:
- Tail is less than 2x the body
- Pattern is NOT at a meaningful structural level
- Overall trend strongly contradicts the signal (e.g., bullish KT in strong downtrend without confluence)

OUTPUT FORMAT (always use this exact structure):
## Kangaroo Tail Strategy — [PAIR]
- **Pattern Detected**: YES / NO
- **Type**: Bullish KT / Bearish KT / None
- **Tail Size**: [estimate: e.g., 1.8x body — INSUFFICIENT / 2.3x body — VALID]
- **Key Level**: [level name and price]
- **Signal**: BUY / SELL / NO SIGNAL
- **Entry Price**: [price or "on break of [level]"]
- **Stop Loss**: [price]
- **Target 1**: [price] (1:1.5 R:R)
- **Target 2**: [price] (1:2.5 R:R)
- **Confidence**: High / Medium / Low
- **Rationale**: [2-3 sentences max]
- **Invalidation**: [what would cancel this trade]`;

export function buildUserPrompt(pair, analystData) {
  return `
Evaluate whether a Kangaroo Tail pattern formed on yesterday's ${pair} daily candle.

Use the following analyst data:

=== MARKET ANALYSIS ===
${analystData.market_analyst}

=== PRICE DATA ===
${analystData.price_analyst}

=== NEWS CONTEXT ===
${analystData.news_analyst}

=== TREND CONTEXT ===
${analystData.trend_analyst}

Apply the Kangaroo Tail rules strictly. Output in the exact format specified.
If there is no valid KT pattern, output "NO SIGNAL" and briefly explain why.
`;
}
