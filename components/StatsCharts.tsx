"use client";

import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";

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

const COLORS_HOVER = [
  "#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed",
  "#db2777", "#0891b2", "#ea580c", "#65a30d", "#4f46e5",
];

export default function StatsCharts() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(new Date(2025, 8, 1));
  const [toDate, setToDate] = useState<Date | null>(new Date(2026, 7, 31));

  const from = fromDate
    ? `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`
    : "2025-09-01";
  const to = toDate
    ? `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`
    : "2026-08-31";

  useEffect(() => {
    fetch(`/api/stats?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [from, to]);

  if (!stats) {
    return <div className="text-color-secondary text-sm">Chargement...</div>;
  }

  const clientEntries = Object.entries(stats.byClient).sort((a, b) => b[1] - a[1]);
  const typeEntries = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]);
  const monthKeys = Object.keys({ ...stats.byMonth, ...stats.formationByMonth }).sort();

  const pieClientData = {
    labels: clientEntries.map(([l]) => l),
    datasets: [
      {
        data: clientEntries.map(([, v]) => v),
        backgroundColor: clientEntries.map((_, i) => COLORS[i % COLORS.length]),
        hoverBackgroundColor: clientEntries.map((_, i) => COLORS_HOVER[i % COLORS_HOVER.length]),
      },
    ],
  };

  const pieTypeData = {
    labels: typeEntries.map(([l]) => l),
    datasets: [
      {
        data: typeEntries.map(([, v]) => v),
        backgroundColor: typeEntries.map((_, i) => COLORS[i % COLORS.length]),
        hoverBackgroundColor: typeEntries.map((_, i) => COLORS_HOVER[i % COLORS_HOVER.length]),
      },
    ],
  };

  const barMonthData = {
    labels: Object.keys(stats.byMonth).sort(),
    datasets: [
      {
        label: "Jours",
        data: Object.keys(stats.byMonth)
          .sort()
          .map((k) => stats.byMonth[k]),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
    ],
  };

  const stackedData = {
    labels: monthKeys,
    datasets: [
      {
        label: "Entreprise",
        data: monthKeys.map((k) => stats.byMonth[k] || 0),
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
      {
        label: "Formation",
        data: monthKeys.map((k) => stats.formationByMonth[k] || 0),
        backgroundColor: "#10b981",
        borderRadius: 4,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: "right" as const,
        labels: { usePointStyle: true, padding: 12, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: number; dataset: { data: number[] } }) => {
            const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = ((ctx.raw / total) * 100).toFixed(1);
            return `${ctx.label}: ${ctx.raw}j (${pct}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  const barOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 11 } } },
      x: { ticks: { font: { size: 11 } } },
    },
    maintainAspectRatio: false,
  };

  const stackedOptions = {
    plugins: {
      legend: {
        labels: { usePointStyle: true, font: { size: 12 } },
      },
    },
    scales: {
      x: { stacked: true, ticks: { font: { size: 11 } } },
      y: { stacked: true, beginAtZero: true, ticks: { font: { size: 11 } } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Date range selector */}
      <Card className="shadow-sm" style={{ borderRadius: "0.75rem" }}>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-color-secondary">
              <i className="pi pi-calendar mr-1" style={{ fontSize: "11px" }} />
              Du
            </label>
            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value as Date | null)}
              dateFormat="dd/mm/yy"
              showIcon
              className="w-44"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-color-secondary">
              <i className="pi pi-calendar mr-1" style={{ fontSize: "11px" }} />
              Au
            </label>
            <Calendar
              value={toDate}
              onChange={(e) => setToDate(e.value as Date | null)}
              dateFormat="dd/mm/yy"
              showIcon
              className="w-44"
            />
          </div>
        </div>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 text-white shrink-0">
            <i className="pi pi-briefcase" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">{stats.totalDays}j</div>
            <div className="text-xs text-blue-500/70 font-medium">Travail</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500 text-white shrink-0">
            <i className="pi pi-book" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{stats.totalFormation}j</div>
            <div className="text-xs text-emerald-500/70 font-medium">Formation</div>
          </div>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Répartition par client" className="shadow-sm" style={{ borderRadius: "0.75rem" }}>
          <div style={{ height: "300px" }}>
            <Chart type="pie" data={pieClientData} options={pieOptions} style={{ height: "100%" }} />
          </div>
        </Card>
        <Card title="Répartition par type" className="shadow-sm" style={{ borderRadius: "0.75rem" }}>
          <div style={{ height: "300px" }}>
            <Chart type="pie" data={pieTypeData} options={pieOptions} style={{ height: "100%" }} />
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card title="Jours par mois" className="shadow-sm" style={{ borderRadius: "0.75rem" }}>
        <div style={{ height: "300px" }}>
          <Chart type="bar" data={barMonthData} options={barOptions} style={{ height: "100%" }} />
        </div>
      </Card>

      {/* Stacked Bar */}
      <Card title="Ratio Formation / Entreprise par mois" className="shadow-sm" style={{ borderRadius: "0.75rem" }}>
        <div style={{ height: "300px" }}>
          <Chart type="bar" data={stackedData} options={stackedOptions} style={{ height: "100%" }} />
        </div>
      </Card>
    </div>
  );
}
