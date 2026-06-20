#!/usr/bin/env node
// ═════════════════════════════════════════════════════════════
//  FX SIGNAL GENERATOR — Orchestrator
//  Manages 4 teams: Analyst → Strategy → Signal → Notification
//
//  Usage:
//    node orchestrator.js                    # all configured pairs
//    node orchestrator.js --pair USD/JPY     # single pair
//    node orchestrator.js --pairs USD/JPY,EUR/USD
// ═════════════════════════════════════════════════════════════

import "dotenv/config";
import { CONFIG } from "./src/config/settings.js";
import { log } from "./agents/claude_client.js";

// Team 1 — Analyst Team
import { runMarketAnalyst }  from "./agents/market_analyst.js";
import { runNewsAnalyst }    from "./agents/news_analyst.js";
import { runTrendAnalyst }   from "./agents/trend_analyst.js";
import { runPriceAnalyst }   from "./agents/price_analyst.js";

// Team 2 — Strategy Team
import { runStrategyAnalyst } from "./agents/strategy_analyst.js";

// Team 3 — Signal Team
import { runSignalAnalyst } from "./agents/signal_analyst.js";

// Team 4 — Notification Team
import { runNotificationAnalyst } from "./agents/notification_analyst.js";

// ─────────────────────────────────────────────────────────────
//  Parse CLI args
// ─────────────────────────────────────────────────────────────
function parsePairs() {
  const args = process.argv.slice(2);
  const pairIdx = args.indexOf("--pair");
  const pairsIdx = args.indexOf("--pairs");

  if (pairIdx !== -1 && args[pairIdx + 1]) {
    return [args[pairIdx + 1]];
  }
  if (pairsIdx !== -1 && args[pairsIdx + 1]) {
    return args[pairsIdx + 1].split(",").map(p => p.trim());
  }
  return CONFIG.pairs;
}

// ─────────────────────────────────────────────────────────────
//  Process one currency pair through all 4 teams
// ─────────────────────────────────────────────────────────────
async function processPair(pair, date) {
  log("Orchestrator", `${"─".repeat(50)}`);
  log("Orchestrator", `Processing ${pair}`);
  log("Orchestrator", `${"─".repeat(50)}`);

  // ── TEAM 1: Run all 4 analysts in parallel ────────────────
  log("Orchestrator", `[TEAM 1] Dispatching analyst sub-agents for ${pair}...`);

  const [marketResult, newsResult, trendResult, priceResult] = await Promise.all([
    runMarketAnalyst(pair, date),
    runNewsAnalyst(pair, date),
    runTrendAnalyst(pair, date),
    runPriceAnalyst(pair, date),
  ]);

  const analystOutputs = [marketResult, newsResult, trendResult, priceResult];
  log("Orchestrator", `[TEAM 1] ✓ All analyst reports received for ${pair}`);

  // ── TEAM 2: Run strategy analysts ─────────────────────────
  log("Orchestrator", `[TEAM 2] Running strategy analysts for ${pair}...`);
  const strategyResults = await runStrategyAnalyst(pair, analystOutputs);
  log("Orchestrator", `[TEAM 2] ✓ ${strategyResults.length} strategy result(s) for ${pair}`);

  // ── TEAM 3: Generate final signal ─────────────────────────
  log("Orchestrator", `[TEAM 3] Generating final signal for ${pair}...`);
  const signalResult = await runSignalAnalyst(pair, date, strategyResults, analystOutputs);
  log("Orchestrator", `[TEAM 3] ✓ Signal generated for ${pair}`);

  return { pair, analystOutputs, strategyResults, signalResult };
}

// ─────────────────────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────────────────────
async function main() {
  const date = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }); // → YYYY-MM-DD

  const pairs = parsePairs();

  console.log("\n" + "═".repeat(70));
  console.log("  FX SIGNAL GENERATOR — Daily Run");
  console.log(`  Date: ${date} | Pairs: ${pairs.join(", ")}`);
  console.log(`  Strategies: ${CONFIG.strategies.join(", ")}`);
  console.log("═".repeat(70) + "\n");

  log("Orchestrator", `Starting analysis for ${pairs.length} pair(s): ${pairs.join(", ")}`);

  const allResults = [];

  // Process pairs sequentially to avoid rate limits
  for (const pair of pairs) {
    try {
      const result = await processPair(pair, date);
      allResults.push(result);
    } catch (err) {
      log("Orchestrator", `⚠️  Error processing ${pair}: ${err.message}`);
      console.error(err);
    }
  }

  // ── TEAM 4: Send notification with all signals ─────────────
  log("Orchestrator", `[TEAM 4] Composing and delivering signal report...`);

  const allSignals = allResults.map(r => r.signalResult);
  const allAnalystOutputs = allResults.flatMap(r => r.analystOutputs);

  await runNotificationAnalyst(allSignals, allAnalystOutputs, date);

  log("Orchestrator", "✅ Daily run complete");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
