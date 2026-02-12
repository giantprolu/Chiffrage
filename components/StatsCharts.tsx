"use client";

import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

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
    <div className="space-y-6">
      {/* Date range selector */}
      <Card className="shadow-none border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-color-secondary">Du</label>
            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value as Date | null)}
              dateFormat="dd/mm/yy"
              showIcon
              className="w-44"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-color-secondary">Au</label>
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

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Répartition par client" className="shadow-none border">
          <div style={{ height: "300px" }}>
            <Chart type="pie" data={pieClientData} options={pieOptions} style={{ height: "100%" }} />
          </div>
        </Card>
        <Card title="Répartition par type" className="shadow-none border">
          <div style={{ height: "300px" }}>
            <Chart type="pie" data={pieTypeData} options={pieOptions} style={{ height: "100%" }} />
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card title="Jours par mois" className="shadow-none border">
        <div style={{ height: "300px" }}>
          <Chart type="bar" data={barMonthData} options={barOptions} style={{ height: "100%" }} />
        </div>
      </Card>

      {/* Stacked Bar */}
      <Card title="Ratio Formation / Entreprise par mois" className="shadow-none border">
        <div style={{ height: "300px" }}>
          <Chart type="bar" data={stackedData} options={stackedOptions} style={{ height: "100%" }} />
        </div>
      </Card>

      {/* Totals */}
      <div className="flex gap-4">
        <Tag
          value={`Total travail : ${stats.totalDays}j`}
          severity="info"
          icon="pi pi-briefcase"
          style={{ fontSize: "14px", padding: "8px 16px" }}
        />
        <Tag
          value={`Total formation : ${stats.totalFormation}j`}
          severity="success"
          icon="pi pi-book"
          style={{ fontSize: "14px", padding: "8px 16px" }}
        />
      </div>
    </div>
  );
}
