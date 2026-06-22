// ─────────────────────────────────────────────────────────────
//  TEAM 2 — Strategy Analyst
//  Runs all configured strategies against analyst team data
// ─────────────────────────────────────────────────────────────

import { callLLM, log } from "./client.js";
import { CONFIG } from "../config/settings.js";

// Dynamically import strategy modules
async function loadStrategies() {
  const strategyModules = {};
  for (const name of CONFIG.strategies) {
    try {
      const mod = await import(`../strategies/${name}.js`);
      strategyModules[name] = mod;
    } catch (e) {
      log("Strategy Analyst", `⚠️  Could not load strategy '${name}': ${e.message}`);
    }
  }
  return strategyModules;
}

export async function runStrategyAnalyst(pair, analystOutputs) {
  log("Strategy Analyst", `Running strategies for ${pair}...`);

  const strategies = await loadStrategies();

  // Build a combined analyst data object for strategies to consume
  const analystData = {
    market_analyst: analystOutputs.find(o => o.agent === "market_analyst")?.analysis || "Not available",
    news_analyst:   analystOutputs.find(o => o.agent === "news_analyst")?.analysis   || "Not available",
    trend_analyst:  analystOutputs.find(o => o.agent === "trend_analyst")?.analysis  || "Not available",
    price_analyst:  analystOutputs.find(o => o.agent === "price_analyst")?.analysis  || "Not available",
  };

  const strategyResults = [];

  for (const [name, mod] of Object.entries(strategies)) {
    log("Strategy Analyst", `  → Evaluating ${mod.STRATEGY_NAME} on ${pair}...`);

    const result = await callLLM({
      systemPrompt: mod.SYSTEM_PROMPT,
      userPrompt: mod.buildUserPrompt(pair, analystData),
      useWebSearch: false,   // strategy runs on analyst data only, no extra search
      label: `Strategy:${name}`,
    });

    strategyResults.push({
      strategy: name,
      strategyName: mod.STRATEGY_NAME,
      pair,
      result,
    });

    log("Strategy Analyst", `  ✓ ${mod.STRATEGY_NAME} complete`);
  }

  return strategyResults;
}
