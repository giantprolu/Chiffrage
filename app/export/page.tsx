"use client";

import { useState } from "react";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function ExportPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mode, setMode] = useState<"month" | "custom">("month");

  const getRange = () => {
    if (mode === "custom" && fromDate && toDate) {
      return { from: fromDate, to: toDate };
    }
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    return { from: start, to: end };
  };

  const handleExport = (format: "csv" | "excel") => {
    const range = getRange();
    if (format === "csv") {
      window.open(
        `/api/entries/export?format=csv&from=${range.from}&to=${range.to}`,
        "_blank"
      );
    } else {
      fetch(`/api/entries/export?format=excel&from=${range.from}&to=${range.to}`)
        .then((r) => r.json())
        .then(async (entries) => {
          const XLSX = await import("xlsx");
          const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
          const rows = entries.map(
            (e: { date: string; client: string; ticket: string | null; comment: string; time: number; type: string | null }) => {
              const d = new Date(e.date);
              return {
                Date: d.toLocaleDateString("fr-FR"),
                Jour: days[d.getDay()],
                Client: e.client,
                Ticket: e.ticket || "",
                Commentaires: e.comment,
                Temps: e.time,
                Type: e.type || "",
              };
            }
          );
          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Chiffrage");
          XLSX.writeFile(wb, `chiffrage_${range.from}_${range.to}.xlsx`);
        })
        .catch((err) => console.error("Export error:", err));
    }
  };

  return (
    <div className="export-page animate-fade-in" style={{ paddingTop: 32 }}>
      <div className="page-header">
        <div className="page-header-icon export">
          <i className="pi pi-download" />
        </div>
        <div>
          <div className="page-header-title">Export des données</div>
          <div className="page-header-subtitle">Téléchargez vos données de chiffrage au format CSV ou Excel</div>
        </div>
      </div>

      <div className="card card-static" style={{ marginBottom: 20 }}>
        <div className="form-stack">
          <div className="form-group">
            <label className="form-label"><i className="pi pi-sliders-h" style={{ fontSize: 10 }} /> Mode de sélection</label>
            <div className="pill-toggle">
              <button className={`pill-toggle-btn ${mode === "month" ? "active" : ""}`} onClick={() => setMode("month")}>Par mois</button>
              <button className={`pill-toggle-btn ${mode === "custom" ? "active" : ""}`} onClick={() => setMode("custom")}>Période personnalisée</button>
            </div>
          </div>

          {mode === "month" ? (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Mois</label>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="c-select">
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Année</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || now.getFullYear())}
                  className="c-input"
                />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Du</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="c-date"
                />
              </div>
              <div className="form-group">
                <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Au</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="c-date"
                />
              </div>
            </div>
          )}

          <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport("csv")}>
              <div className="export-btn-icon csv">
                <i className="pi pi-file" />
              </div>
              <div className="export-btn-text">
                <span className="export-btn-label">Export CSV</span>
                <span className="export-btn-desc">Fichier tableur simple</span>
              </div>
            </button>
            <button className="export-btn" onClick={() => handleExport("excel")}>
              <div className="export-btn-icon excel">
                <i className="pi pi-file-excel" />
              </div>
              <div className="export-btn-text">
                <span className="export-btn-label">Export Excel</span>
                <span className="export-btn-desc">Fichier .xlsx formaté</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
