"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import type { GarakAttempt } from "@/lib/types";

export function AttemptViewer({ attempts }: { attempts: GarakAttempt[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [probeFilter, setProbeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pass" | "fail">(
    "all"
  );
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const probes = useMemo(
    () => [...new Set(attempts.map((a) => a.probe_classname))],
    [attempts]
  );

  const filtered = useMemo(() => {
    let result = attempts;
    if (probeFilter) {
      result = result.filter((a) => a.probe_classname === probeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((a) => {
        const hasDetectorResults = Object.keys(a.detector_results).length > 0;
        if (!hasDetectorResults) return statusFilter === "pass";
        const anyFail = Object.values(a.detector_results).some((scores) =>
          scores.some((s) => s > 0.5)
        );
        return statusFilter === "fail" ? anyFail : !anyFail;
      });
    }
    return result;
  }, [attempts, probeFilter, statusFilter]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function getStatus(att: GarakAttempt): "pass" | "fail" | "none" {
    const hasDetectorResults = Object.keys(att.detector_results).length > 0;
    if (!hasDetectorResults) return "none";
    const anyFail = Object.values(att.detector_results).some((scores) =>
      scores.some((s) => s > 0.5)
    );
    return anyFail ? "fail" : "pass";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground"
          value={probeFilter}
          onChange={(e) => {
            setProbeFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All probes ({attempts.length})</option>
          {probes.map((p) => (
            <option key={p} value={p}>
              {p.split(".").pop()} (
              {attempts.filter((a) => a.probe_classname === p).length})
            </option>
          ))}
        </select>

        <div className="flex gap-1 bg-card border border-border rounded-lg p-0.5">
          {(["all", "pass", "fail"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(0);
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === s
                  ? s === "fail"
                    ? "bg-danger/15 text-danger"
                    : s === "pass"
                    ? "bg-success/15 text-success"
                    : "bg-border text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted ml-auto">
          {filtered.length} results
        </span>
      </div>

      <div className="space-y-2">
        {paged.map((att) => {
          const isExpanded = expandedId === att.uuid;
          const status = getStatus(att);
          const promptText =
            att.prompt.turns[0]?.content?.text || "(no prompt)";
          const outputText = att.outputs[0]?.text || "(no output)";

          return (
            <div
              key={att.uuid}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : att.uuid)
                }
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-card-hover transition-colors"
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    status === "fail"
                      ? "bg-danger/15"
                      : status === "pass"
                      ? "bg-success/15"
                      : "bg-border"
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown
                      className={`w-3.5 h-3.5 ${
                        status === "fail" ? "text-danger" : "text-success"
                      }`}
                    />
                  ) : (
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${
                        status === "fail" ? "text-danger" : "text-success"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-border/50 text-foreground px-2 py-0.5 rounded">
                      {att.probe_classname.split(".").pop()}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      seq {att.seq}
                    </span>
                    {status === "fail" && (
                      <XCircle className="w-3.5 h-3.5 text-danger ml-auto" />
                    )}
                    {status === "pass" && (
                      <CheckCircle className="w-3.5 h-3.5 text-success ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted truncate">{promptText}</p>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border p-4 space-y-3 bg-background/50">
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-1">
                      Goal
                    </div>
                    <p className="text-sm">{att.goal}</p>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-1">
                      Prompt
                    </div>
                    <pre className="text-xs font-mono bg-card rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto border border-border">
                      {promptText}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-1">
                      Output
                    </div>
                    <pre
                      className={`text-xs font-mono rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto border ${
                        status === "fail"
                          ? "bg-danger/5 border-danger/20 text-danger/90"
                          : "bg-card border-border"
                      }`}
                    >
                      {outputText}
                    </pre>
                  </div>
                  {Object.keys(att.detector_results).length > 0 && (
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider mb-1">
                        Detector Results
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(att.detector_results).map(
                          ([det, scores]) => (
                            <div
                              key={det}
                              className="text-xs font-mono bg-card border border-border rounded-lg px-2.5 py-1.5"
                            >
                              <span className="text-muted">
                                {det.split(".").pop()}:
                              </span>{" "}
                              {scores.map((s, j) => (
                                <span
                                  key={j}
                                  className={
                                    s > 0.5 ? "text-danger" : "text-success"
                                  }
                                >
                                  {s.toFixed(1)}
                                  {j < scores.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs rounded-lg bg-card border border-border text-muted hover:text-foreground disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-muted font-mono">
            {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1}
            className="px-3 py-1.5 text-xs rounded-lg bg-card border border-border text-muted hover:text-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
