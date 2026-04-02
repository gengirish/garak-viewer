"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ProbeBreakdown } from "@/lib/types";

export function ProbeChart({ data }: { data: ProbeBreakdown[] }) {
  const chartData = data.map((d) => {
    const probeShort = d.probe.split(".").pop() || d.probe;
    const detectorShort = d.detector.split(".").pop() || d.detector;
    const hasDuplicateProbe =
      data.filter(
        (other) => (other.probe.split(".").pop() || other.probe) === probeShort
      ).length > 1;
    return {
      name: hasDuplicateProbe ? `${probeShort} (${detectorShort})` : probeShort,
      passRate: d.passRate,
      passed: d.passed,
      fails: d.fails,
      total: d.total,
      detector: detectorShort,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
          axisLine={{ stroke: "#27272a" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={180}
          tick={{ fill: "#e4e4e7", fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#18181f",
            border: "1px solid #27272a",
            borderRadius: 8,
            fontSize: 12,
            color: "#e4e4e7",
          }}
          formatter={(value, _name, props) => {
            const p = (props as { payload: { passed: number; fails: number; total: number; detector: string } }).payload;
            return [`${value}% (${p.passed}/${p.total}) — ${p.detector}`, "Pass Rate"];
          }}
          labelFormatter={(label) => `${label}`}
        />
        <Bar dataKey="passRate" radius={[0, 4, 4, 0]} barSize={20}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.passRate >= 80
                  ? "#22c55e"
                  : entry.passRate >= 50
                  ? "#f59e0b"
                  : "#ef4444"
              }
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
