#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  FX Signal Generator — Daily Scheduler
//  Runs the orchestrator every weekday at 08:00 JST
//
//  Usage: node scheduler.js   (keep this process running)
//  Or use the crontab alternative below instead.
// ─────────────────────────────────────────────────────────────

import "dotenv/config";
import cron from "node-cron";
import { execSync } from "child_process";
import { log } from "./src/agents/client.js";

// 08:00 JST = 23:00 UTC (previous day)
// Cron syntax: minute hour * * day-of-week (0-4 = Mon-Fri)
// "0 23 * * 0-4" = 23:00 UTC Sunday-Thursday (= 08:00 JST Mon-Fri)

const CRON_SCHEDULE = "0 23 * * 0-4";  // Mon-Fri 08:00 JST

log("Scheduler", `FX Signal Generator scheduler started`);
log("Scheduler", `Will run every weekday at 08:00 JST (${CRON_SCHEDULE} UTC)`);
log("Scheduler", `Press Ctrl+C to stop`);

cron.schedule(CRON_SCHEDULE, () => {
  log("Scheduler", "⏰ Triggering daily FX signal run...");
  try {
    execSync("node orchestrator.js", { stdio: "inherit", cwd: process.cwd() });
    log("Scheduler", "✅ Daily run completed successfully");
  } catch (err) {
    log("Scheduler", `❌ Daily run failed: ${err.message}`);
  }
}, {
  timezone: "UTC"
});

// Also allow a manual trigger with: kill -USR1 <PID>
// For testing, run: node orchestrator.js directly

/*
  ─────────────────────────────────────────────────────────────
  ALTERNATIVE: Use system crontab instead of this scheduler
  ─────────────────────────────────────────────────────────────
  Run: crontab -e
  Add this line (adjust path to your install):

  0 23 * * 1-5 cd /path/to/fx-signal-generator && node orchestrator.js >> ./output/cron.log 2>&1

  This runs at 23:00 UTC Mon-Fri = 08:00 JST Tue-Sat (next day JST)
  For exactly Mon-Fri 08:00 JST use: 0 23 * * 0-4
  ─────────────────────────────────────────────────────────────
*/
