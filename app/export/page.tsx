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
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<"month" | "custom">("month");

  const getRange = () => {
    if (mode === "custom" && from && to) {
      return { from, to };
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
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Export</h1>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("month")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "month"
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Par mois
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "custom"
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Période personnalisée
          </button>
        </div>

        {mode === "month" ? (
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Mois</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Année</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm w-24"
              />
            </div>
          </div>
        ) : (
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Du</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Au</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleExport("csv")}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
          >
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}
