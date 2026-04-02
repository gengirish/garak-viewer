"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { RunSummary } from "@/lib/types";
import {
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  Target,
  ChevronRight,
  Search,
} from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  if (iso === "unknown") return "Unknown";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortName(name: string): string {
  const parts = name.split("/");
  return parts[parts.length - 1];
}

export default function Home() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [runsDir, setRunsDir] = useState("");

  useEffect(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (Array.isArray(data)) {
          setRuns(data);
        } else {
          setRuns(data.runs || []);
          setRunsDir(data.runsDir || "");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalRuns = runs.length;
  const totalAttempts = runs.reduce((s, r) => s + r.totalAttempts, 0);
  const totalHits = runs.reduce((s, r) => s + r.hitCount, 0);
  const uniqueModels = [...new Set(runs.map((r) => r.targetName))].length;

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        run.targetName.toLowerCase().includes(q) ||
        run.probeSpec.toLowerCase().includes(q) ||
        run.targetType.toLowerCase().includes(q) ||
        run.id.toLowerCase().includes(q)
      );
    });
  }, [runs, search]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 font-sans">
        <header className="border-b border-border px-6 py-4 flex items-center gap-3">
          <Shield className="w-7 h-7 text-accent" />
          <h1 className="text-xl font-bold tracking-tight">Garak Report Viewer</h1>
        </header>
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-border rounded w-24 mb-3" />
                <div className="h-8 bg-border rounded w-16" />
              </div>
            ))}
          </div>
          <div>
            <div className="h-6 bg-border rounded w-32 mb-3 animate-pulse" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl px-5 py-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-border" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-border rounded w-48" />
                      <div className="h-3 bg-border rounded w-72" />
                    </div>
                    <div className="h-4 bg-border rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-danger-dim/20 border border-danger/30 rounded-xl p-6 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-danger mx-auto mb-3" />
          <p className="text-danger font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 font-sans">
      <header className="border-b border-border px-6 py-4 flex items-center gap-3">
        <Shield className="w-7 h-7 text-accent" />
        <h1 className="text-xl font-bold tracking-tight">
          Garak Report Viewer
        </h1>
        {runsDir && (
          <span
            className="text-xs text-muted font-mono ml-auto truncate max-w-xs"
            title={runsDir}
          >
            {runsDir}
          </span>
        )}
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Activity className="w-5 h-5" />}
            label="Total Runs"
            value={totalRuns}
            color="text-accent"
          />
          <SummaryCard
            icon={<Target className="w-5 h-5" />}
            label="Models Tested"
            value={uniqueModels}
            color="text-blue-400"
          />
          <SummaryCard
            icon={<Shield className="w-5 h-5" />}
            label="Total Attempts"
            value={totalAttempts.toLocaleString()}
            color="text-purple-400"
          />
          <SummaryCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Total Hits"
            value={totalHits.toLocaleString()}
            color="text-danger"
          />
        </div>

        {/* Run List */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-semibold">Scan Runs</h2>
            <div className="relative ml-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by model, probe, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted w-72 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
          <div className="space-y-2">
            {filteredRuns.map((run) => (
              <Link
                key={run.id}
                href={`/run/${run.id}`}
                className="group flex items-center gap-4 bg-card hover:bg-card-hover border border-border rounded-xl px-5 py-4 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    run.hitCount > 0
                      ? "bg-danger/15 text-danger"
                      : "bg-success/15 text-success"
                  }`}
                >
                  {run.hitCount > 0 ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {shortName(run.targetName)}
                    </span>
                    <span className="text-xs text-muted font-mono bg-border/50 px-2 py-0.5 rounded">
                      {run.targetType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(run.startTime)}
                    </span>
                    <span>
                      Probes:{" "}
                      <span className="text-foreground">{run.probeSpec}</span>
                    </span>
                    <span>{formatBytes(run.fileSize)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-mono">
                      {run.totalAttempts}{" "}
                      <span className="text-muted text-xs">attempts</span>
                    </div>
                    {run.hitCount > 0 && (
                      <div className="text-xs text-danger font-medium">
                        {run.hitCount} hits
                      </div>
                    )}
                    {run.hitCount === 0 && run.totalAttempts > 0 && (
                      <div className="text-xs text-success font-medium">
                        No hits
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          {filteredRuns.length === 0 && search && (
            <p className="text-muted text-sm text-center py-8">
              No runs matching &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <span className="text-xs text-muted uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
    </div>
  );
}
