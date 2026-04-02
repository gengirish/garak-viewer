# Garak Report Viewer

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Local Next.js dashboard for exploring **garak** LLM security scan outputs. The app reads `*.report.jsonl` (and optional `*.hitlog.jsonl`) from a configured garak runs directory, lists runs, and surfaces per-run metrics, charts, probe breakdown, hits, and attempts.

---

## Overview

**Garak Report Viewer** is a visual front end for [garak](https://github.com/NVIDIA/garak)—NVIDIA’s open-source **LLM vulnerability scanner** and probe harness. Garak runs safety and security probes against language models and writes structured JSON Lines artifacts for each run.

This project turns those artifacts into an interactive dashboard: scan summaries at a glance, drill-down per run, and tables for probes, hits, and individual attempts—without leaving your machine.

---

## Screenshots

_Add screenshots here (e.g. dashboard, run detail with charts, hit log, attempt viewer) once you capture them._

---

## Features

- **Run list dashboard** — Summary stats across discovered runs (run count, models, attempts, hits).
- **Per-run detail** — Pass/fail donut chart and probe pass-rate bar chart for quick signal.
- **Sortable probe breakdown** — Table of probes with rates and counts; sort by the columns you care about.
- **Hit log viewer** — Filter hits and expand rows for full context.
- **Attempt viewer** — Paginated attempts with pass/fail filtering for deep inspection.
- **Dark NVIDIA-themed UI** — Dark shell with NVIDIA green accent (`#76b900`).
- **Automatic detection** — Scans the configured directory for standard garak output filenames.

---

## Quick Start

```bash
cd garak-viewer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

### `GARAK_RUNS_DIR`

The app loads run data from a single directory on disk.

| Platform | Default (when `GARAK_RUNS_DIR` is unset) |
|----------|----------------------------------------|
| **Linux / macOS** | `~/.local/share/garak/garak_runs` (i.e. `$HOME/.local/share/garak/garak_runs`) |
| **Windows** | `%USERPROFILE%\.local\share\garak\garak_runs` |

Override the path when starting the dev server:

**Linux / macOS**

```bash
GARAK_RUNS_DIR=/path/to/your/garak_runs npm run dev
```

**Windows (PowerShell)**

```powershell
$env:GARAK_RUNS_DIR = "C:\path\to\your\garak_runs"; npm run dev
```

**Windows (cmd)**

```cmd
set GARAK_RUNS_DIR=C:\path\to\your\garak_runs && npm run dev
```

### Expected files

Place garak outputs in that directory using the usual naming:

- **Report:** `garak.<uuid>.report.jsonl`
- **Hit log (optional):** `garak.<uuid>.hitlog.jsonl`

The viewer pairs hit logs to runs by matching the same `<uuid>` as the report file.

---

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19** |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** |
| Charts | **Recharts** |
| Icons | **Lucide React** |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── runs/
│   │       ├── route.ts          # List runs + summaries
│   │       └── [id]/route.ts     # Single run detail
│   ├── run/
│   │   └── [id]/page.tsx         # Per-run dashboard page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Run list home
├── components/
│   ├── AttemptViewer.tsx
│   ├── HitLogTable.tsx
│   ├── PassFailDonut.tsx
│   └── ProbeChart.tsx
└── lib/
    ├── parser.ts                 # JSONL parsing, filesystem scan
    └── types.ts                  # Shared TypeScript models
```

---

## License

MIT
