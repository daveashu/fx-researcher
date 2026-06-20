// ─────────────────────────────────────────────────────────────
//  FX Signal Generator — Configuration
//  Edit this file to set your pairs, strategies, and alerts
// ─────────────────────────────────────────────────────────────

export const CONFIG = {

  // ── Currency pairs to analyse every morning ──────────────────
  pairs: [
    "USD/JPY",
    "EUR/USD",
    "GBP/USD",
    "AUD/USD",
  ],

  // ── Strategies to run (must match a file in /strategies/) ─────
  strategies: [
    "kangaroo_tail",
    "last_kiss",
  ],

  // ── Notification settings ─────────────────────────────────────
  notification: {
    // Options: "email" | "console" | "both"
    method: "console",

    email: {
      // Uses nodemailer — set SMTP env vars in .env
      to: process.env.NOTIFY_EMAIL || "you@example.com",
      from: process.env.SMTP_FROM   || "fx-bot@example.com",
      smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
      smtpPort: parseInt(process.env.SMTP_PORT || "587"),
      smtpUser: process.env.SMTP_USER || "",
      smtpPass: process.env.SMTP_PASS || "",
    },
  },

  // ── Anthropic model ───────────────────────────────────────────
  //model: "claude-sonnet-4-6",
  //maxTokens: 4096,

  // ── Gemini model ───────────────────────────────────────────
  model: "gemini-2.5-flash-lite",
  maxTokens: 4096,

  // ── Analysis depth (passed to each analyst) ──────────────────
  analysisHorizon: "1D",        // 1-day lookback
  historicalYears: 3,           // years of price history to consider

  // ── Output ───────────────────────────────────────────────────
  outputDir: "./output",
  saveReports: false,            // save JSON + markdown reports to ./output/
};
