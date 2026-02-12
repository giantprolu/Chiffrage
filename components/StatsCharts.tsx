"use client";

import { useEffect, useState } from "react";

interface StatsData {
  byClient: Record<string, number>;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
  formationByMonth: Record<string, number>;
  totalDays: number;
  totalFormation: number;
}

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
];

function BarChart({
  data,
  title,
}: {
  data: Record<string, number>;
  title: string;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <div className="space-y-2">
        {entries.map(([label, value], i) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 w-24 truncate text-right">
              {label}
            </span>
            <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(value / max) * 100}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
            <span className="text-xs font-medium w-10 text-right">
              {value}j
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({
  data,
  title,
}: {
  data: Record<string, number>;
  title: string;
}) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  let cumulative = 0;
  const slices = entries.map(([label, value], i) => {
    const start = cumulative;
    cumulative += (value / total) * 360;
    return { label, value, start, end: cumulative, color: COLORS[i % COLORS.length] };
  });

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <div className="flex items-start gap-4">
        <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0">
          {slices.map((slice) => {
            const startAngle = toRad(slice.start - 90);
            const endAngle = toRad(slice.end - 90);
            const largeArc = slice.end - slice.start > 180 ? 1 : 0;
            const x1 = 50 + 45 * Math.cos(startAngle);
            const y1 = 50 + 45 * Math.sin(startAngle);
            const x2 = 50 + 45 * Math.cos(endAngle);
            const y2 = 50 + 45 * Math.sin(endAngle);
            const d = `M50,50 L${x1},${y1} A45,45 0 ${largeArc},1 ${x2},${y2} Z`;
            return (
              <path key={slice.label} d={d} fill={slice.color} stroke="white" strokeWidth="0.5" />
            );
          })}
        </svg>
        <div className="space-y-1 text-xs">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-zinc-600 dark:text-zinc-400">
                {s.label}: {s.value}j ({((s.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StatsCharts() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [from, setFrom] = useState("2025-09-01");
  const [to, setTo] = useState("2026-08-31");

  useEffect(() => {
    fetch(`/api/stats?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [from, to]);

  if (!stats) {
    return <div className="text-zinc-400 text-sm">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Du</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Au</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <PieChart data={stats.byClient} title="Répartition par client" />
        </div>
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <PieChart data={stats.byType} title="Répartition par type" />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <BarChart data={stats.byMonth} title="Jours par mois" />
      </div>

      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
          Ratio Formation / Entreprise par mois
        </h3>
        <div className="space-y-2">
          {Object.keys({ ...stats.byMonth, ...stats.formationByMonth })
            .sort()
            .map((monthKey) => {
              const work = stats.byMonth[monthKey] || 0;
              const formation = stats.formationByMonth[monthKey] || 0;
              const total = work + formation;
              if (total === 0) return null;
              return (
                <div key={monthKey} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-16 text-right">
                    {monthKey}
                  </span>
                  <div className="flex-1 h-6 flex rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(work / total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(formation / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-20 text-right">
                    {work}j / {formation}j
                  </span>
                </div>
              );
            })}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-500" /> Entreprise
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-500" /> Formation
          </div>
        </div>
      </div>

      <div className="flex gap-6 text-sm">
        <div>
          Total travail :{" "}
          <span className="font-semibold">{stats.totalDays}j</span>
        </div>
        <div>
          Total formation :{" "}
          <span className="font-semibold text-green-600">{stats.totalFormation}j</span>
        </div>
      </div>
    </div>
  );
}
