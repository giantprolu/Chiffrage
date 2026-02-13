"use client";

import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import type { StatsData } from "@/lib/types";
import { fetchStats } from "@/lib/services";

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
];

const COLORS_HOVER = [
  "#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed",
  "#db2777", "#0891b2", "#ea580c", "#65a30d", "#4f46e5",
];

const PRESETS = [
  { label: "Ce mois", getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth(), 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  { label: "3 derniers mois", getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth() - 2, 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  { label: "6 derniers mois", getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth() - 5, 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }; } },
  { label: "Cette année", getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), 0, 1), to: new Date(n.getFullYear(), 11, 31) }; } },
  { label: "Année scolaire", getValue: () => { const n = new Date(); const yr = n.getMonth() >= 8 ? n.getFullYear() : n.getFullYear() - 1; return { from: new Date(yr, 8, 1), to: new Date(yr + 1, 7, 31) }; } },
];

export default function StatsCharts() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(new Date(2025, 8, 1));
  const [toDate, setToDate] = useState<Date | null>(new Date(2026, 7, 31));

  const [activePreset, setActivePreset] = useState<string>("Année scolaire");

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const { from: f, to: t } = preset.getValue();
    setFromDate(f);
    setToDate(t);
    setActivePreset(preset.label);
  };

  const from = fromDate ? fmtDate(fromDate) : "2025-09-01";
  const to = toDate ? fmtDate(toDate) : "2026-08-31";

  useEffect(() => {
    fetchStats(from, to).then(setStats);
  }, [from, to]);

  if (!stats) {
    return <div style={{ fontSize: 14, color: "var(--muted)" }}>Chargement...</div>;
  }

  const clientEntries = Object.entries(stats.byClient).sort((a, b) => b[1] - a[1]);
  const typeEntries = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]);
  const monthKeys = Object.keys({ ...stats.byMonth, ...stats.formationByMonth }).sort();

  const pieClientData = {
    labels: clientEntries.map(([l]) => l),
    datasets: [{
      data: clientEntries.map(([, v]) => v),
      backgroundColor: clientEntries.map((_, i) => COLORS[i % COLORS.length]),
      hoverBackgroundColor: clientEntries.map((_, i) => COLORS_HOVER[i % COLORS_HOVER.length]),
    }],
  };

  const pieTypeData = {
    labels: typeEntries.map(([l]) => l),
    datasets: [{
      data: typeEntries.map(([, v]) => v),
      backgroundColor: typeEntries.map((_, i) => COLORS[i % COLORS.length]),
      hoverBackgroundColor: typeEntries.map((_, i) => COLORS_HOVER[i % COLORS_HOVER.length]),
    }],
  };

  const barMonthData = {
    labels: Object.keys(stats.byMonth).sort(),
    datasets: [{
      label: "Jours",
      data: Object.keys(stats.byMonth).sort().map((k) => stats.byMonth[k]),
      backgroundColor: "#3b82f6",
      borderRadius: 6,
    }],
  };

  const stackedData = {
    labels: monthKeys,
    datasets: [
      { label: "Entreprise", data: monthKeys.map((k) => stats.byMonth[k] || 0), backgroundColor: "#3b82f6", borderRadius: 4 },
      { label: "Formation", data: monthKeys.map((k) => stats.formationByMonth[k] || 0), backgroundColor: "#10b981", borderRadius: 4 },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { position: "right" as const, labels: { usePointStyle: true, padding: 12, font: { size: 12 } } },
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
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { font: { size: 11 } } }, x: { ticks: { font: { size: 11 } } } },
    maintainAspectRatio: false,
  };

  const stackedOptions = {
    plugins: { legend: { labels: { usePointStyle: true, font: { size: 12 } } } },
    scales: { x: { stacked: true, ticks: { font: { size: 11 } } }, y: { stacked: true, beginAtZero: true, ticks: { font: { size: 11 } } } },
    maintainAspectRatio: false,
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Date range */}
      <Card className="stats-date-card">
        <div className="stats-date-section">
          <div className="stats-presets">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`preset-chip ${activePreset === p.label ? "active" : ""}`}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="stats-date-pickers">
            <div className="form-group">
              <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Du</label>
              <Calendar value={fromDate} onChange={(e) => { setFromDate(e.value as Date | null); setActivePreset(""); }} dateFormat="dd/mm/yy" showIcon style={{ width: 170 }} />
            </div>
            <div className="form-group">
              <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Au</label>
              <Calendar value={toDate} onChange={(e) => { setToDate(e.value as Date | null); setActivePreset(""); }} dateFormat="dd/mm/yy" showIcon style={{ width: 170 }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Totals */}
      <div className="stats-grid">
        <div className="stats-card blue">
          <i className="pi pi-briefcase" style={{ color: "var(--accent)" }} />
          <div>
            <div className="stats-card-value blue">{stats.totalDays}j</div>
            <div className="stats-card-label">Travail</div>
          </div>
        </div>
        <div className="stats-card green">
          <i className="pi pi-book" style={{ color: "var(--success)" }} />
          <div>
            <div className="stats-card-value green">{stats.totalFormation}j</div>
            <div className="stats-card-label">Formation</div>
          </div>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="charts-row">
        <Card title="Répartition par client" className="chart-card">
          <div className="chart-wrap">
            <Chart type="pie" data={pieClientData} options={pieOptions} style={{ height: "100%" }} />
          </div>
        </Card>
        <Card title="Répartition par type" className="chart-card">
          <div className="chart-wrap">
            <Chart type="pie" data={pieTypeData} options={pieOptions} style={{ height: "100%" }} />
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card title="Jours par mois" className="chart-card">
        <div className="chart-wrap">
          <Chart type="bar" data={barMonthData} options={barOptions} style={{ height: "100%" }} />
        </div>
      </Card>

      {/* Stacked Bar */}
      <Card title="Ratio Formation / Entreprise par mois" className="chart-card">
        <div className="chart-wrap">
          <Chart type="bar" data={stackedData} options={stackedOptions} style={{ height: "100%" }} />
        </div>
      </Card>
    </div>
  );
}
