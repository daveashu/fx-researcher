// ─────────────────────────────────────────────────────────────
//  TEAM 1 › Sub-agent 1.4 — Price Analyst
//  Fetches latest price and derives key levels from 3-year history
// ─────────────────────────────────────────────────────────────

import { callLLM, log } from "./client.js";

const SYSTEM = `You are an FX price analyst specialising in quantitative price structure.
Your job is to obtain the latest price for a currency pair and derive key structural levels
from its 3-year price history using publicly available data.

Structure your output:
1. CURRENT PRICE — Latest spot price (cite source and time)
2. YESTERDAY's OHLC — Open, High, Low, Close for the previous full trading day
3. WEEKLY CONTEXT — Current week open, last week OHLC
4. MONTHLY CONTEXT — Current month open, last month OHLC
5. 3-YEAR STRUCTURAL LEVELS — Identify from search:
   - 3-year high and 3-year low
   - Major consolidation zones / demand-supply zones
   - Key Fibonacci levels from last major swing
   - 200-day SMA estimate
6. ATR(14) ESTIMATE — Approximate daily average true range based on recent volatility
7. PRICE BIAS — Are we at the top, middle, or bottom of the 3-year range?

Use free sources: Yahoo Finance, Investing.com, TradingEconomics, or any FX data site.
Always state the source and timestamp for live price data.`;

export async function runPriceAnalyst(pair, date) {
  log("Price Analyst", `Fetching price data for ${pair}...`);

  const ticker = pair.replace("/", "");
  const userPrompt = `
Search for the latest price and historical price data for ${pair} (ticker: ${ticker}).
Date context: ${date} Tokyo morning.

Find:
1. Current spot price for ${pair} right now (search "${pair} price today" or "${ticker} live rate")
2. Yesterday's OHLC (search "${pair} OHLC yesterday" or "${ticker} daily chart")
3. 3-year high and low (search "${pair} 3 year high low" or "${ticker} historical range")
4. Current 200-day SMA estimate if available
5. Recent daily ATR or volatility measure

Return a structured markdown price report as per your instructions.
State the exact source URL and time for all live data.
`;

  const result = await callLLM({
    systemPrompt: SYSTEM,
    userPrompt,
    useWebSearch: true,
    label: "PriceAnalyst",
  });

  log("Price Analyst", `✓ ${pair} price analysis complete for ${date}, return price is ready.${result}"..." : ""}`);
  return { agent: "price_analyst", pair, date, analysis: result };
}
