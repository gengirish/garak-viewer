"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function PassFailDonut({
  passed,
  failed,
}: {
  passed: number;
  failed: number;
}) {
  const total = passed + failed;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 100;

  const data = [
    { name: "Passed", value: passed },
    { name: "Failed", value: failed },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted text-sm">
        No data
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} fillOpacity={0.85} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span
          className={`text-3xl font-bold font-mono ${
            passRate >= 80
              ? "text-success"
              : passRate >= 50
              ? "text-warning"
              : "text-danger"
          }`}
        >
          {passRate}%
        </span>
        <span className="text-xs text-muted">pass rate</span>
      </div>
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="text-muted">
            Passed: <span className="text-foreground font-mono">{passed}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-danger" />
          <span className="text-muted">
            Failed: <span className="text-foreground font-mono">{failed}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
