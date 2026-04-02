"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { RunDetail } from "@/lib/types";
import {
  Shield,
  AlertTriangle,
  ArrowLeft,
  Download,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  Eye,
} from "lucide-react";
import { ProbeChart } from "@/components/ProbeChart";
import { PassFailDonut } from "@/components/PassFailDonut";
import { HitLogTable } from "@/components/HitLogTable";
import { AttemptViewer } from "@/components/AttemptViewer";

export default function RunDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "hits" | "attempts"
  >("overview");

  useEffect(() => {
    fetch(`/api/runs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRun(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleExportCSV() {
    if (!run) return;
    const headers = ["Probe", "Detector", "Pass Rate (%)", "Passed", "Failed", "Total"];
    const rows = run.probeBreakdown.map((row) => [
      row.probe,
      row.detector,
      row.passRate,
      row.passed,
      row.fails,
      row.total,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `garak-${run.id.slice(0, 8)}-probes.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 font-sans">
        <header className="border-b border-border px-6 py-4 flex items-center gap-3">
          <div className="h-4 w-12 bg-border rounded animate-pulse" />
          <div className="w-px h-5 bg-border mx-2" />
          <div className="h-5 w-5 bg-border rounded animate-pulse" />
          <div className="h-5 w-48 bg-border rounded animate-pulse" />
        </header>
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-border rounded w-16 mb-2" />
                <div className="h-7 bg-border rounded w-20 mb-1" />
                <div className="h-3 bg-border rounded w-24" />
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-border rounded w-16 mb-2" />
                  <div className="h-4 bg-border rounded w-40" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-10 bg-card border border-border rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 h-64 animate-pulse" />
            <div className="bg-card border border-border rounded-xl p-5 h-64 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-danger-dim/20 border border-danger/30 rounded-xl p-6 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-danger mx-auto mb-3" />
          <p className="text-danger font-medium">
            {error || "Run not found"}
          </p>
          <Link href="/" className="text-accent text-sm mt-2 inline-block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalPassed = run.probeBreakdown.reduce((s, p) => s + p.passed, 0);
  const totalFailed = run.probeBreakdown.reduce((s, p) => s + p.fails, 0);
  const overallPassRate =
    totalPassed + totalFailed > 0
      ? Math.round((totalPassed / (totalPassed + totalFailed)) * 100)
      : 100;

  const shortModel = run.targetName.split("/").pop() || run.targetName;

  return (
    <div className="flex flex-col flex-1 font-sans">
      <header className="border-b border-border px-6 py-4 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <div className="w-px h-5 bg-border mx-2" />
        <Shield className="w-5 h-5 text-accent" />
        <h1 className="text-lg font-bold tracking-tight truncate">
          {shortModel}
        </h1>
        <span className="text-xs text-muted font-mono bg-border/50 px-2 py-0.5 rounded">
          {run.targetType}
        </span>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground bg-card border border-border rounded-lg px-3 py-1.5 ml-auto transition-colors"
          title="Export probe breakdown as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top summary row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard
            label="Pass Rate"
            value={`${overallPassRate}%`}
            sub={`${totalPassed} / ${totalPassed + totalFailed}`}
            color={overallPassRate >= 80 ? "text-success" : overallPassRate >= 50 ? "text-warning" : "text-danger"}
          />
          <MetricCard
            label="Hits"
            value={run.hitCount}
            sub={run.hasHitlog ? "from hitlog" : "no hitlog"}
            color={run.hitCount > 0 ? "text-danger" : "text-success"}
          />
          <MetricCard
            label="Attempts"
            value={run.totalAttempts}
            sub="total probes"
            color="text-blue-400"
          />
          <MetricCard
            label="Probes"
            value={run.probeBreakdown.length}
            sub="probe/detector pairs"
            color="text-purple-400"
          />
          <MetricCard
            label="Garak"
            value={`v${run.garakVersion}`}
            sub={new Date(run.startTime).toLocaleDateString()}
            color="text-muted"
          />
        </div>

        {/* Run config */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted text-xs uppercase tracking-wider">
                Target
              </span>
              <div className="font-mono mt-0.5">{run.targetName}</div>
            </div>
            <div>
              <span className="text-muted text-xs uppercase tracking-wider">
                Probes
              </span>
              <div className="font-mono mt-0.5">{run.probeSpec}</div>
            </div>
            <div>
              <span className="text-muted text-xs uppercase tracking-wider">
                Run ID
              </span>
              <div className="font-mono mt-0.5 text-xs text-muted">
                {run.id}
              </div>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<Eye className="w-4 h-4" />}
            label="Overview"
          />
          <TabButton
            active={activeTab === "hits"}
            onClick={() => setActiveTab("hits")}
            icon={<Zap className="w-4 h-4" />}
            label={`Hits (${run.hitCount})`}
          />
          <TabButton
            active={activeTab === "attempts"}
            onClick={() => setActiveTab("attempts")}
            icon={<Target className="w-4 h-4" />}
            label={`Attempts (${run.totalAttempts})`}
          />
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wider">
                  Results by Probe
                </h3>
                {run.probeBreakdown.length > 0 ? (
                  <ProbeChart data={run.probeBreakdown} />
                ) : (
                  <p className="text-muted text-sm py-8 text-center">
                    No probe results available
                  </p>
                )}
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wider">
                  Overall Pass/Fail
                </h3>
                <PassFailDonut passed={totalPassed} failed={totalFailed} />
              </div>
            </div>

            {/* Probe breakdown table */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wider">
                Probe Breakdown
              </h3>
              <ProbeTable data={run.probeBreakdown} />
            </div>
          </div>
        )}

        {activeTab === "hits" && <HitLogTable hits={run.hits} />}

        {activeTab === "attempts" && (
          <AttemptViewer attempts={run.attempts} />
        )}
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{sub}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-accent/15 text-accent"
          : "text-muted hover:text-foreground hover:bg-border/30"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProbeTable({
  data,
}: {
  data: { probe: string; detector: string; passed: number; fails: number; total: number; passRate: number }[];
}) {
  const [sortKey, setSortKey] = useState<"probe" | "passRate" | "fails">(
    "passRate"
  );
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...data].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortKey === "probe") return mul * a.probe.localeCompare(b.probe);
    return mul * (a[sortKey] - b[sortKey]);
  });

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(key === "probe");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey === col ? (
      sortAsc ? (
        <ChevronUp className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3" />
      )
    ) : null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted text-xs uppercase tracking-wider border-b border-border">
            <th
              className="text-left py-2 px-3 cursor-pointer hover:text-foreground"
              onClick={() => toggleSort("probe")}
            >
              <span className="flex items-center gap-1">
                Probe <SortIcon col="probe" />
              </span>
            </th>
            <th className="text-left py-2 px-3">Detector</th>
            <th
              className="text-right py-2 px-3 cursor-pointer hover:text-foreground"
              onClick={() => toggleSort("passRate")}
            >
              <span className="flex items-center justify-end gap-1">
                Pass Rate <SortIcon col="passRate" />
              </span>
            </th>
            <th className="text-right py-2 px-3">Passed</th>
            <th
              className="text-right py-2 px-3 cursor-pointer hover:text-foreground"
              onClick={() => toggleSort("fails")}
            >
              <span className="flex items-center justify-end gap-1">
                Fails <SortIcon col="fails" />
              </span>
            </th>
            <th className="text-right py-2 px-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/50 hover:bg-card-hover transition-colors"
            >
              <td className="py-2.5 px-3 font-mono text-xs">
                {row.probe.split(".").pop()}
              </td>
              <td className="py-2.5 px-3 font-mono text-xs text-muted">
                {row.detector.split(".").pop()}
              </td>
              <td className="py-2.5 px-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        row.passRate >= 80
                          ? "bg-success"
                          : row.passRate >= 50
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                      style={{ width: `${row.passRate}%` }}
                    />
                  </div>
                  <span
                    className={`font-mono text-xs font-medium ${
                      row.passRate >= 80
                        ? "text-success"
                        : row.passRate >= 50
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {row.passRate}%
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-success">
                {row.passed}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-danger">
                {row.fails}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-muted">
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="text-muted text-sm py-6 text-center">
          No probe evaluations available for this run.
        </p>
      )}
    </div>
  );
}
