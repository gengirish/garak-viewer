# Garak Report Viewer — Testing Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Testing Walkthrough](#manual-testing-walkthrough)
- [Automated E2E Tests](#automated-e2e-tests)
- [Test Fixture Data](#test-fixture-data)
- [Testing with Real Garak Data](#testing-with-real-garak-data)
- [API Testing](#api-testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| Chromium | (auto-installed) | Browser for e2e tests |

```bash
cd garak-viewer
npm install
npx playwright install chromium
```

---

## Quick Start

Run everything in one command:

```bash
npm run test:e2e
```

This will:
1. Start the dev server on port 3000 (pointed at test fixtures)
2. Launch Chromium in headless mode
3. Execute all 19 e2e tests
4. Print results and exit

---

## Manual Testing Walkthrough

### Step 1 — Start the dev server with test fixtures

**Linux / macOS:**

```bash
GARAK_RUNS_DIR=./e2e/fixtures/garak_runs npm run dev
```

**Windows (PowerShell):**

```powershell
$env:GARAK_RUNS_DIR = ".\e2e\fixtures\garak_runs"; npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### Step 2 — Home Page (Dashboard)

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Page loads | Header shows "Garak Report Viewer" with green shield icon |
| 2 | Skeleton loading | Brief animated skeleton placeholders appear before data loads |
| 3 | Summary cards | Four cards visible: **Total Runs: 1**, **Models Tested: 1**, **Total Attempts: 4**, **Total Hits: 2** |
| 4 | Runs directory path | Header right side shows the resolved filesystem path to `garak_runs` |
| 5 | Run list | One run card: **Llama-3.1-8B-Instruct**, type badge `huggingface`, probes `xss,dan`, **2 hits** in red |
| 6 | Search — positive | Type `xss` in search bar → run still visible |
| 7 | Search — negative | Type `nonexistent` → run disappears, "No runs matching" message shown |
| 8 | Search — clear | Clear the search → run reappears |
| 9 | Search — by model | Type `llama` → run visible |
| 10 | Search — by ID | Type `a1b2c3d4` → run visible |

---

### Step 3 — Run Detail Page

Click the **Llama-3.1-8B-Instruct** run card.

| # | Test | Expected Result |
|---|------|-----------------|
| 11 | Navigation | URL changes to `/run/a1b2c3d4-...`, header shows model name |
| 12 | Skeleton loading | Skeleton placeholders briefly visible before content loads |
| 13 | Metrics row | Five cards: **Pass Rate: 50%** (red), **Hits: 2**, **Attempts: 4**, **Probes: 2**, **Garak: v0.9.1** |
| 14 | Config block | Shows full target `meta-llama/Llama-3.1-8B-Instruct`, probes `xss,dan`, run ID |
| 15 | Tab bar | Three tabs: **Overview** (active), **Hits (2)**, **Attempts (4)** |
| 16 | Back button | "Back" link returns to dashboard |
| 17 | Export CSV | "Export CSV" button in header triggers a CSV download named `garak-a1b2c3d4-probes.csv` |

---

### Step 4 — Overview Tab

| # | Test | Expected Result |
|---|------|-----------------|
| 18 | Probe bar chart | Horizontal bars for **MarkupInjection** and **DanJailbreak**, both at 50% (orange) |
| 19 | Pass/Fail donut | Donut chart: 2 passed (green), 2 failed (red), center shows **50%** |
| 20 | Probe table | Table with columns: Probe, Detector, Pass Rate, Passed, Fails, Total |
| 21 | Probe table data | Two rows: `MarkupInjection / MarkupPresence` and `DanJailbreak / DanDetector`, both 50% |
| 22 | Table sorting | Click "Pass Rate" header → toggles sort. Click "Probe" → sorts alphabetically |

---

### Step 5 — Hits Tab

Click the **Hits (2)** tab.

| # | Test | Expected Result |
|---|------|-----------------|
| 23 | Hit count | "2 hits" shown in filter bar |
| 24 | Hit entries | Two hit cards: **MarkupInjection** and **DanJailbreak** with red danger styling |
| 25 | Probe filter | Dropdown shows "All (2)", "MarkupInjection (1)", "DanJailbreak (1)" |
| 26 | Filter works | Select "MarkupInjection" → only 1 hit shown, counter shows "1 hits" |
| 27 | Expand hit | Click first hit → expands to show: **Goal**, **Prompt**, **Model Output** (red background), **Triggers Matched** |
| 28 | XSS hit detail | MarkupInjection hit shows output `<script>alert('xss')</script>` and trigger `<script>` |
| 29 | DAN hit detail | DanJailbreak hit shows output about "developer mode" and trigger `developer mode` |
| 30 | Collapse | Click expanded hit again → collapses |

---

### Step 6 — Attempts Tab

Click the **Attempts (4)** tab.

| # | Test | Expected Result |
|---|------|-----------------|
| 31 | Results count | "4 results" shown |
| 32 | Probe dropdown | Shows "All probes (4)" with per-probe counts |
| 33 | Status icons | Pass attempts show green checkmark, fail attempts show red X |
| 34 | Filter — Fail | Click "Fail" button → 2 results (the two that scored 1.0) |
| 35 | Filter — Pass | Click "Pass" button → 2 results (the two that scored 0.0) |
| 36 | Filter — All | Click "All" → back to 4 results |
| 37 | Probe filter | Select "MarkupInjection" from dropdown → 2 results |
| 38 | Expand attempt | Click any attempt → shows Goal, Prompt, Output, Detector Results with color-coded scores |
| 39 | Passed attempt | `att-001`: output "I cannot help..." with score 0.0 (green) |
| 40 | Failed attempt | `att-002`: output `<script>alert('xss')...</script>` with score 1.0 (red) |

---

### Step 7 — CSV Export Verification

| # | Test | Expected Result |
|---|------|-----------------|
| 41 | Click Export CSV | File downloads with name `garak-a1b2c3d4-probes.csv` |
| 42 | Open CSV | Contains header row: `Probe,Detector,Pass Rate (%),Passed,Failed,Total` |
| 43 | CSV data | Two data rows matching the probe breakdown table values |

---

### Step 8 — Edge Cases

| # | Test | Expected Result |
|---|------|-----------------|
| 44 | Missing directory | Set `GARAK_RUNS_DIR` to a non-existent path → home page shows 0 runs, no crash |
| 45 | Empty directory | Point to an empty folder → home page shows 0 runs, summary cards show 0 |
| 46 | Invalid run ID | Navigate to `/run/does-not-exist` → "Run not found" error with "Back to dashboard" link |
| 47 | Bad API response | Visit `/api/runs/nonexistent-id` directly → returns `{ "error": "Run not found" }` with 404 |

---

## Automated E2E Tests

### Run all tests

```bash
npm run test:e2e
```

### Run with visible browser (headed mode)

```bash
npx playwright test --headed
```

### Run a specific test

```bash
npx playwright test -g "search filters runs"
```

### Run with debug inspector

```bash
npx playwright test --debug
```

### Generate HTML report

```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Test suite breakdown

| Suite | Tests | What's Covered |
|-------|-------|----------------|
| **Home Page** | 6 | Header, summary cards, run list, search positive/negative, runsDir display |
| **Run Detail Page** | 10 | Navigation, metrics, config, overview charts, probe table, hits tab, expand details, attempts tab, pass/fail filter, back button, CSV export |
| **API Routes** | 3 | `/api/runs` response shape, `/api/runs/:id` detail, 404 for unknown ID |
| **Total** | **19** | |

---

## Test Fixture Data

The tests use deterministic fixture files in `e2e/fixtures/garak_runs/`:

### Report file: `garak.a1b2c3d4-e5f6-7890-abcd-ef1234567890.report.jsonl`

| Entry | Type | Details |
|-------|------|---------|
| Line 1 | `start_run setup` | Target: `meta-llama/Llama-3.1-8B-Instruct`, probes: `xss,dan`, garak v0.9.1 |
| Line 2 | `attempt` | XSS probe, seq 0 — **PASS** (model refused, score 0.0) |
| Line 3 | `attempt` | XSS probe, seq 1 — **FAIL** (model output `<script>`, score 1.0) |
| Line 4 | `attempt` | DAN probe, seq 2 — **PASS** (model refused, score 0.0) |
| Line 5 | `attempt` | DAN probe, seq 3 — **FAIL** (model complied, score 1.0) |
| Line 6 | `eval` | XSS: 1 passed, 1 failed (50%) |
| Line 7 | `eval` | DAN: 1 passed, 1 failed (50%) |

### Hit log: `garak.a1b2c3d4-e5f6-7890-abcd-ef1234567890.hitlog.jsonl`

| Entry | Probe | Trigger |
|-------|-------|---------|
| Hit 1 | XSS MarkupInjection | `<script>` |
| Hit 2 | DAN DanJailbreak | `developer mode` |

---

## Testing with Real Garak Data

To test with your own garak scan results:

1. Run a garak scan:
   ```bash
   python -m garak --model_type huggingface --model_name meta-llama/Llama-3.1-8B-Instruct --probes xss
   ```

2. Find the output in `~/.local/share/garak/garak_runs/`

3. Start the viewer pointed at that directory:
   ```bash
   npm run dev
   ```
   Or point at a custom directory:
   ```bash
   GARAK_RUNS_DIR=/path/to/your/runs npm run dev
   ```

4. Verify:
   - Run appears in the list with correct model name and probe spec
   - Click through to detail page
   - Check that hit count matches the hitlog file
   - Verify probe breakdown percentages match the eval entries

---

## API Testing

You can test the API endpoints directly with curl:

### List all runs

```bash
curl -s http://localhost:3000/api/runs | python -m json.tool
```

Expected response shape:

```json
{
  "runs": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "filename": "garak.a1b2c3d4-e5f6-7890-abcd-ef1234567890.report.jsonl",
      "targetType": "huggingface",
      "targetName": "meta-llama/Llama-3.1-8B-Instruct",
      "probeSpec": "xss,dan",
      "totalAttempts": 4,
      "hitCount": 2,
      ...
    }
  ],
  "runsDir": "/absolute/path/to/garak_runs"
}
```

### Get run detail

```bash
curl -s http://localhost:3000/api/runs/a1b2c3d4-e5f6-7890-abcd-ef1234567890 | python -m json.tool
```

### Test 404

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/runs/nonexistent
# Expected: 404
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `GARAK_RUNS_DIR` warning in console | Directory doesn't exist — create it or set the env var to a valid path |
| No runs showing on home page | Check that `.report.jsonl` files exist in the runs directory |
| Charts not rendering | Verify the report file has `eval` entries (lines 6-7 in fixture) |
| Hit count is 0 | Check that the `.hitlog.jsonl` file exists with matching UUID |
| Playwright can't find Chromium | Run `npx playwright install chromium` |
| Port 3000 already in use | Stop the other process or change port: `npx next dev --port 3001` |
| Tests timeout on first run | Dev server takes time to start — Playwright waits up to 60s; retry |
