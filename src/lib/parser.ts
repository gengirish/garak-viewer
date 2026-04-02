import * as fs from "fs";
import * as path from "path";
import type {
  GarakRunConfig,
  GarakAttempt,
  GarakEval,
  GarakHit,
  RunSummary,
  RunDetail,
  ProbeBreakdown,
} from "./types";

const GARAK_RUNS_DIR =
  process.env.GARAK_RUNS_DIR ||
  path.join(
    process.env.USERPROFILE || process.env.HOME || "",
    ".local",
    "share",
    "garak",
    "garak_runs"
  );

interface ReportEntry {
  entry_type: string;
  [key: string]: unknown;
}

function parseJsonl<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());
  const results: T[] = [];
  for (const line of lines) {
    try {
      results.push(JSON.parse(line) as T);
    } catch {
      // skip malformed lines
    }
  }
  return results;
}

function extractRunId(filename: string): string {
  const match = filename.match(/garak\.([a-f0-9-]+)\.report\.jsonl/);
  if (match) return match[1];
  return filename.replace(".report.jsonl", "");
}

export function listRuns(): RunSummary[] {
  const files = fs.readdirSync(GARAK_RUNS_DIR);
  const reportFiles = files.filter((f) => f.endsWith(".report.jsonl"));

  return reportFiles.map((filename) => {
    const filePath = path.join(GARAK_RUNS_DIR, filename);
    const stats = fs.statSync(filePath);
    const runId = extractRunId(filename);

    const hitlogFile = filename.replace(".report.jsonl", ".hitlog.jsonl");
    const hasHitlog = files.includes(hitlogFile);

    let hitCount = 0;
    if (hasHitlog) {
      const hitlogPath = path.join(GARAK_RUNS_DIR, hitlogFile);
      const hitContent = fs.readFileSync(hitlogPath, "utf-8");
      hitCount = hitContent.split("\n").filter((l) => l.trim()).length;
    }

    const firstLine = fs.readFileSync(filePath, "utf-8").split("\n")[0];
    let config: Partial<GarakRunConfig> = {};
    try {
      config = JSON.parse(firstLine);
    } catch {
      // skip
    }

    const entries = parseJsonl<ReportEntry>(filePath);
    const attempts = entries.filter((e) => e.entry_type === "attempt");
    const evals = entries.filter((e) => e.entry_type === "eval");

    return {
      id: runId,
      filename,
      targetType: (config["plugins.target_type"] as string) || "unknown",
      targetName: (config["plugins.target_name"] as string) || "unknown",
      probeSpec: (config["plugins.probe_spec"] as string) || "unknown",
      startTime: (config["transient.starttime_iso"] as string) || "unknown",
      garakVersion: (config["_config.version"] as string) || "unknown",
      totalAttempts: attempts.length,
      totalEvals: evals.length,
      hasHitlog,
      hitCount,
      fileSize: stats.size,
    };
  }).sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export function getRunDetail(runId: string): RunDetail | null {
  const files = fs.readdirSync(GARAK_RUNS_DIR);
  const reportFile = files.find(
    (f) => f.includes(runId) && f.endsWith(".report.jsonl")
  );
  if (!reportFile) return null;

  const reportPath = path.join(GARAK_RUNS_DIR, reportFile);
  const entries = parseJsonl<ReportEntry>(reportPath);

  const config = entries.find(
    (e) => e.entry_type === "start_run setup"
  ) as Partial<GarakRunConfig> | undefined;

  const attempts = entries.filter(
    (e) => e.entry_type === "attempt"
  ) as unknown as GarakAttempt[];

  const evals = entries.filter(
    (e) => e.entry_type === "eval"
  ) as unknown as GarakEval[];

  const hitlogFile = reportFile.replace(".report.jsonl", ".hitlog.jsonl");
  const hasHitlog = files.includes(hitlogFile);
  let hits: GarakHit[] = [];
  if (hasHitlog) {
    const hitlogPath = path.join(GARAK_RUNS_DIR, hitlogFile);
    hits = parseJsonl<GarakHit>(hitlogPath);
  }

  const probeBreakdown: ProbeBreakdown[] = evals.map((ev) => ({
    probe: ev.probe,
    detector: ev.detector,
    passed: ev.passed,
    fails: ev.fails,
    total: ev.total_evaluated,
    passRate:
      ev.total_evaluated > 0
        ? Math.round((ev.passed / ev.total_evaluated) * 100)
        : 0,
  }));

  // If no eval entries, compute from detector_results in attempts
  if (probeBreakdown.length === 0 && attempts.length > 0) {
    const grouped = new Map<string, { passed: number; fails: number; total: number }>();
    for (const att of attempts) {
      for (const [detector, scores] of Object.entries(att.detector_results)) {
        const key = `${att.probe_classname}|||${detector}`;
        if (!grouped.has(key)) {
          grouped.set(key, { passed: 0, fails: 0, total: 0 });
        }
        const g = grouped.get(key)!;
        for (const s of scores) {
          g.total++;
          if (s > 0.5) g.fails++;
          else g.passed++;
        }
      }
    }
    for (const [key, stats] of grouped) {
      const [probe, detector] = key.split("|||");
      probeBreakdown.push({
        probe,
        detector,
        ...stats,
        passRate: stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0,
      });
    }
  }

  const stats = fs.statSync(reportPath);

  return {
    id: runId,
    filename: reportFile,
    targetType: (config?.["plugins.target_type"] as string) || "unknown",
    targetName: (config?.["plugins.target_name"] as string) || "unknown",
    probeSpec: (config?.["plugins.probe_spec"] as string) || "unknown",
    startTime: (config?.["transient.starttime_iso"] as string) || "unknown",
    garakVersion: (config?.["_config.version"] as string) || "unknown",
    totalAttempts: attempts.length,
    totalEvals: evals.length,
    hasHitlog,
    hitCount: hits.length,
    fileSize: stats.size,
    evals,
    attempts,
    hits,
    probeBreakdown,
  };
}
