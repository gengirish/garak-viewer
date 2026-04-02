"use client";

import { useState } from "react";
import { ShieldCheck, ChevronDown, ChevronRight } from "lucide-react";
import type { GarakHit } from "@/lib/types";

export function HitLogTable({ hits }: { hits: GarakHit[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  if (hits.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6 text-success" />
        </div>
        <p className="text-muted text-sm">
          No hits recorded. The model successfully defended against all probes
          in this run.
        </p>
      </div>
    );
  }

  const probes = [...new Set(hits.map((h) => h.probe))];
  const filtered = filter
    ? hits.filter((h) => h.probe === filter)
    : hits;

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Filter by probe:</span>
        <select
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All ({hits.length})</option>
          {probes.map((p) => (
            <option key={p} value={p}>
              {p.split(".").pop()} ({hits.filter((h) => h.probe === p).length})
            </option>
          ))}
        </select>
        <span className="text-xs text-muted ml-auto">
          {filtered.length} hits
        </span>
      </div>

      <div className="space-y-2">
        {paged.map((hit, i) => {
          const globalIndex = page * PAGE_SIZE + i;
          const rowId = `${hit.attempt_id}-${globalIndex}`;
          const isExpanded = expandedId === rowId;
          const promptText =
            hit.prompt.turns[0]?.content?.text || "(no prompt)";

          return (
            <div
              key={rowId}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : rowId)
                }
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-card-hover transition-colors"
              >
                <div className="w-6 h-6 rounded bg-danger/15 flex items-center justify-center shrink-0 mt-0.5">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-danger" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-danger" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-danger/15 text-danger px-2 py-0.5 rounded">
                      {hit.probe.split(".").pop()}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      {hit.detector.split(".").pop()}
                    </span>
                    <span className="text-xs font-mono text-muted ml-auto">
                      score: {hit.score}
                    </span>
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
                    <p className="text-sm">{hit.goal}</p>
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
                      Model Output
                    </div>
                    <pre className="text-xs font-mono bg-danger/5 border border-danger/20 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto text-danger/90">
                      {hit.output.text}
                    </pre>
                  </div>
                  {hit.triggers && hit.triggers.length > 0 && (
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider mb-1">
                        Triggers Matched
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {hit.triggers.map((t, j) => (
                          <span
                            key={j}
                            className="text-xs font-mono bg-warning/15 text-warning px-2 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 text-xs text-muted">
                    <span>Generator: {hit.generator}</span>
                    <span>Seq: {hit.attempt_seq}</span>
                  </div>
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
