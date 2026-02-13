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
  { label: "Par mois", value: "month", icon: "pi pi-calendar" },
  { label: "Période personnalisée", value: "custom", icon: "pi pi-calendar-plus" },
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
    <div className="page-container" style={{ maxWidth: "40rem" }}>
      <h1 className="text-lg font-bold mb-4">Export</h1>

      <Card className="shadow-sm animate-fade-in" style={{ borderRadius: "0.75rem" }}>
        <div className="space-y-5">
          <SelectButton
            value={mode}
            onChange={(e) => setMode(e.value)}
            options={modeOptions}
            optionLabel="label"
            optionValue="value"
          />

          {mode === "month" ? (
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-color-secondary">Mois</label>
                <Dropdown
                  value={month}
                  onChange={(e) => setMonth(e.value)}
                  options={monthOptions}
                  optionLabel="label"
                  optionValue="value"
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-color-secondary">Année</label>
                <InputNumber
                  value={year}
                  onValueChange={(e) => setYear(e.value ?? now.getFullYear())}
                  useGrouping={false}
                  className="w-28"
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-color-secondary">Du</label>
                <Calendar
                  value={fromDate}
                  onChange={(e) => setFromDate(e.value as Date | null)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-color-secondary">Au</label>
                <Calendar
                  value={toDate}
                  onChange={(e) => setToDate(e.value as Date | null)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-48"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <Button
              label="Export CSV"
              icon="pi pi-file"
              severity="info"
              onClick={() => handleExport("csv")}
              className="flex-1"
            />
            <Button
              label="Export Excel"
              icon="pi pi-file-excel"
              severity="success"
              onClick={() => handleExport("excel")}
              className="flex-1"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
