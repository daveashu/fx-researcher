# FX Signal Generator

A multi-agent FX trading signal system that runs every weekday morning at 08:00 JST.

## Architecture

```
Orchestrator
├── TEAM 1 — Analyst Team (runs in parallel)
│   ├── 1.1 Market Analyst    — Macro + technical 1D analysis
│   ├── 1.2 News Analyst      — Yesterday's news + today's calendar
│   ├── 1.3 Trend Analyst     — TradingView / COT / community sentiment
│   └── 1.4 Price Analyst     — Live price + 3-year structural levels
│
├── TEAM 2 — Strategy Analyst
│   ├── Kangaroo Tail strategy evaluation
│   └── Last Kiss strategy evaluation
│
├── TEAM 3 — Signal Analyst
│   └── Vets all strategy outputs → final BUY / SELL / HOLD
│
└── TEAM 4 — Notification Analyst
    └── Formats report → console + optional email
```

## Setup

### 1. Install dependencies
```bash
cd fx-signal-generator
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Configure pairs and strategies
Edit `config/settings.js`:
```js
pairs: ["USD/JPY", "EUR/USD", "GBP/USD", "AUD/USD"],
strategies: ["kangaroo_tail", "last_kiss"],
notification: { method: "console" }  // or "email" or "both"
```

## Usage

### Run once (all configured pairs)
```bash
node orchestrator.js
```

### Run for a specific pair
```bash
node orchestrator.js --pair USD/JPY
```

### Run for multiple specific pairs
```bash
node orchestrator.js --pairs USD/JPY,EUR/USD
```

### Run daily scheduler (keeps running, triggers at 08:00 JST weekdays)
```bash
node scheduler.js
```

### Or use system cron (recommended for production)
```bash
crontab -e
# Add:
0 23 * * 0-4 cd /path/to/fx-signal-generator && node orchestrator.js >> ./output/cron.log 2>&1
```

## Output

Reports are saved to `./output/`:
- `fx-signals-YYYY-MM-DD.md` — Human-readable markdown report
- `fx-signals-YYYY-MM-DD.json` — Machine-readable JSON

## Adding New Strategies

1. Create `/strategies/your_strategy.js`
2. Export `STRATEGY_NAME`, `SYSTEM_PROMPT`, and `buildUserPrompt(pair, analystData)`
3. Add the strategy name to `CONFIG.strategies` in `config/settings.js`

See `strategies/kangaroo_tail.js` as a template.

## Email Notifications

Set `notification.method = "email"` in `config/settings.js`, then add SMTP env vars to `.env`.
For Gmail, use an App Password (not your account password): 
https://myaccount.google.com/apppasswords

## Notes

- The system uses web search on all analyst agents (Teams 1) — requires internet access
- Strategy and signal analysts run offline on analyst output (no extra web calls)
- All 4 analyst sub-agents run in parallel per pair to minimise total runtime
- Multiple pairs are processed sequentially to respect API rate limits
- Estimated runtime: ~3-5 minutes per pair (depending on web search speed)
