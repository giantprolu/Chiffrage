"use client";

import { useState } from "react";
import { SelectButton } from "primereact/selectbutton";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const modeOptions = [
  { label: "Par mois", value: "month" },
  { label: "Période personnalisée", value: "custom" },
];

const monthOptions = MONTH_NAMES.map((name, i) => ({
  label: name,
  value: i + 1,
}));

export default function ExportPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [mode, setMode] = useState<"month" | "custom">("month");

  const getRange = () => {
    if (mode === "custom" && fromDate && toDate) {
      const fmtDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return { from: fmtDate(fromDate), to: fmtDate(toDate) };
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
    <div className="export-page animate-fade-in">
      <div className="export-header">
        <div className="export-icon-wrap">
          <i className="pi pi-download" />
        </div>
        <div>
          <h1 className="export-title">Export des données</h1>
          <p className="export-subtitle">Téléchargez vos données de chiffrage au format CSV ou Excel</p>
        </div>
      </div>

      <Card className="export-card">
        <div className="export-stack">
          <div className="export-mode-section">
            <label className="form-label"><i className="pi pi-sliders-h" style={{ fontSize: 10 }} /> Mode de sélection</label>
            <SelectButton
              value={mode}
              onChange={(e) => setMode(e.value)}
              options={modeOptions}
              optionLabel="label"
              optionValue="value"
              className="export-mode-toggle"
            />
          </div>

          {mode === "month" ? (
            <div className="export-period-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Mois</label>
                <Dropdown
                  value={month}
                  onChange={(e) => setMonth(e.value)}
                  options={monthOptions}
                  optionLabel="label"
                  optionValue="value"
                  className="w-full"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Année</label>
                <InputNumber
                  value={year}
                  onValueChange={(e) => setYear(e.value ?? now.getFullYear())}
                  useGrouping={false}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="export-period-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Du</label>
                <Calendar
                  value={fromDate}
                  onChange={(e) => setFromDate(e.value as Date | null)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-full"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label"><i className="pi pi-calendar" style={{ fontSize: 10 }} /> Au</label>
                <Calendar
                  value={toDate}
                  onChange={(e) => setToDate(e.value as Date | null)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="export-buttons">
            <button className="export-btn csv" onClick={() => handleExport("csv")}>
              <div className="export-btn-icon csv">
                <i className="pi pi-file" />
              </div>
              <div className="export-btn-text">
                <span className="export-btn-label">Export CSV</span>
                <span className="export-btn-desc">Fichier tableur simple</span>
              </div>
            </button>
            <button className="export-btn excel" onClick={() => handleExport("excel")}>
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
      </Card>
    </div>
  );
}
