"use client";

import { useCallback, useEffect, useState } from "react";
import DayCell, { Entry, FormationDay, CongeDay } from "./DayCell";
import EntryModal from "./EntryModal";
import MonthNav from "./MonthNav";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type Mode = "normal" | "copy" | "select";

export default function Calendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [formationDays, setFormationDays] = useState<FormationDay[]>([]);
  const [congeDays, setCongeDays] = useState<CongeDay[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [copiedEntries, setCopiedEntries] = useState<Entry[]>([]);
  const [mode, setMode] = useState<Mode>("normal");

  const fetchData = useCallback(() => {
    fetch(`/api/entries?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});

    fetch(`/api/formation-days?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then(setFormationDays)
      .catch(() => {});

    fetch(`/api/conge-days?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then(setCongeDays)
      .catch(() => {});
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  // Monday=0, Sunday=6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dateStr = (day: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getEntriesForDay = (day: number) =>
    entries.filter((e) => e.date.startsWith(dateStr(day)));

  const getFormationDay = (day: number) =>
    formationDays.find((f) => f.date.startsWith(dateStr(day))) || null;

  const getCongeDay = (day: number) =>
    congeDays.find((c) => c.date.startsWith(dateStr(day))) || null;

  const isWeekend = (day: number) => {
    const d = new Date(year, month - 1, day);
    return d.getDay() === 0 || d.getDay() === 6;
  };

  const isToday = (day: number) =>
    day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

  const isDayBlocked = (day: number) => {
    const conge = getCongeDay(day);
    return isWeekend(day) || !!getFormationDay(day) || (!!conge && conge.time >= 1);
  };

  // Month totals
  const totalWork = entries.reduce((sum, e) => sum + e.time, 0);
  const totalFormation = formationDays.length;
  const totalConge = congeDays.reduce((sum, c) => sum + (c.time ?? 1), 0);

  // --- Handlers ---

  const handleDayClick = (day: number) => {
    const ds = dateStr(day);

    if (mode === "copy") {
      // Paste on click
      if (!isDayBlocked(day)) {
        handlePaste(day);
      }
      return;
    }

    if (mode === "select") {
      // Toggle selection
      setSelectedDates((prev) =>
        prev.includes(ds) ? prev.filter((d) => d !== ds) : [...prev, ds]
      );
      return;
    }

    // Normal mode: open modal for this day
    setSelectedDates([ds]);
    setShowModal(true);
  };

  const handleCopy = async () => {
    if (selectedDates.length === 0) return;
    const firstDate = selectedDates[0];
    // Fetch entries for the specific date (may be from another month)
    const [y, m, d] = firstDate.split("-").map(Number);
    const res = await fetch(`/api/entries?month=${m}&year=${y}`);
    const allEntriesForMonth: Entry[] = await res.json();
    const dayEntries = allEntriesForMonth.filter((e) => e.date.startsWith(firstDate));
    if (dayEntries.length === 0) return;
    setCopiedEntries(dayEntries);
    setMode("copy");
    setSelectedDates([]);
  };

  const handlePaste = async (day: number) => {
    const ds = dateStr(day);
    const conge = getCongeDay(day);
    const congeTime = conge?.time ?? 0;
    const existingTime = getEntriesForDay(day).reduce((sum, e) => sum + e.time, 0);
    let remaining = Math.round((1 - congeTime - existingTime) * 10) / 10;

    for (const entry of copiedEntries) {
      if (remaining <= 0) break;
      const time = Math.min(entry.time, remaining);
      await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: ds,
          client: entry.client,
          ticket: entry.ticket,
          comment: entry.comment,
          time,
          type: entry.type,
        }),
      });
      remaining = Math.round((remaining - time) * 10) / 10;
    }
    fetchData();
  };

  const cancelMode = () => {
    setMode("normal");
    setCopiedEntries([]);
    setSelectedDates([]);
  };

  // Collect all unique months from selectedDates + current month for modal data
  const [modalEntries, setModalEntries] = useState<Entry[]>([]);
  const [modalFormation, setModalFormation] = useState<FormationDay[]>([]);
  const [modalConge, setModalConge] = useState<CongeDay[]>([]);

  const fetchModalData = useCallback(async () => {
    // Get unique year-month combos from selectedDates
    const months = new Set<string>();
    months.add(`${year}-${month}`);
    for (const d of selectedDates) {
      const [y, m] = d.split("-").map(Number);
      months.add(`${y}-${m}`);
    }

    const allEntries: Entry[] = [];
    const allFormation: FormationDay[] = [];
    const allConge: CongeDay[] = [];

    await Promise.all(
      Array.from(months).map(async (ym) => {
        const [y, m] = ym.split("-").map(Number);
        const [eRes, fRes, cRes] = await Promise.all([
          fetch(`/api/entries?month=${m}&year=${y}`),
          fetch(`/api/formation-days?month=${m}&year=${y}`),
          fetch(`/api/conge-days?month=${m}&year=${y}`),
        ]);
        const e = await eRes.json();
        const f = await fRes.json();
        const c = await cRes.json();
        allEntries.push(...e);
        allFormation.push(...f);
        allConge.push(...c);
      })
    );

    setModalEntries(allEntries);
    setModalFormation(allFormation);
    setModalConge(allConge);
  }, [selectedDates, year, month]);

  useEffect(() => {
    if (showModal && selectedDates.length > 0) {
      fetchModalData();
    }
  }, [showModal, fetchModalData, selectedDates]);

  const openMultiEdit = () => {
    if (selectedDates.length > 0) {
      setShowModal(true);
    }
  };

  return (
    <div>
      <MonthNav
        month={month}
        year={year}
        onChange={(m, y) => {
          setMonth(m);
          setYear(y);
        }}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Select mode toggle */}
        <button
          onClick={() => {
            if (mode === "select") {
              cancelMode();
            } else {
              setMode("select");
              setCopiedEntries([]);
              setSelectedDates([]);
            }
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "select"
              ? "bg-blue-500 text-white shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          {mode === "select" ? `${selectedDates.length} jour${selectedDates.length > 1 ? "s" : ""} sélectionné${selectedDates.length > 1 ? "s" : ""}` : "Sélectionner"}
        </button>

        {/* Multi-select actions */}
        {mode === "select" && selectedDates.length > 0 && (
          <>
            <button
              onClick={openMultiEdit}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition-all"
            >
              Éditer
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm transition-all"
            >
              Copier
            </button>
          </>
        )}

        {/* Copy mode banner */}
        {mode === "copy" && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {copiedEntries.length} tâche{copiedEntries.length > 1 ? "s" : ""} copiée{copiedEntries.length > 1 ? "s" : ""} — cliquez sur un jour pour coller
            </span>
            <button
              onClick={cancelMode}
              className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-300 dark:hover:bg-indigo-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Cancel any mode */}
        {(mode === "select" || mode === "copy") && (
          <button
            onClick={cancelMode}
            className="px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            ✕ Annuler
          </button>
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 py-1.5 uppercase tracking-wider"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <DayCell
            key={i}
            day={day}
            entries={day ? getEntriesForDay(day) : []}
            isWeekend={day ? isWeekend(day) : false}
            formationDay={day ? getFormationDay(day) : null}
            congeDay={day ? getCongeDay(day) : null}
            isToday={day ? isToday(day) : false}
            isSelected={day ? selectedDates.includes(dateStr(day)) : false}
            isCopyMode={mode === "copy"}
            onClick={() => day && handleDayClick(day)}
          />
        ))}
      </div>

      {/* Footer stats */}
      <div className="mt-5 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-400" />
          <span className="text-zinc-600 dark:text-zinc-400">
            Travail : <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalWork}j</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="text-zinc-600 dark:text-zinc-400">
            Formation : <span className="font-bold text-red-600 dark:text-red-400">{totalFormation}j</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-400" />
          <span className="text-zinc-600 dark:text-zinc-400">
            Congé : <span className="font-bold text-orange-600 dark:text-orange-400">{totalConge}j</span>
          </span>
        </div>
        <div className="ml-auto text-zinc-500 dark:text-zinc-400">
          Total : <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalWork + totalFormation + totalConge}j</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[11px] text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20" />
          Complet
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-950/20" />
          Incomplet
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-red-300 bg-red-50 dark:bg-red-950/20" />
          Formation
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-orange-300 bg-orange-50 dark:bg-orange-950/20" />
          Congé
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDates.length > 0 && (
        <EntryModal
          dates={selectedDates}
          allEntries={modalEntries}
          formationDays={modalFormation}
          congeDays={modalConge}
          onClose={() => {
            setShowModal(false);
            if (mode !== "select") setSelectedDates([]);
          }}
          onSave={() => {
            fetchData();
            fetchModalData();
          }}
          onToggleConge={async (date: string, time?: number) => {
            const existing = congeDays.find((c) => c.date.startsWith(date));
            if (existing && time !== undefined) {
              // Update congé time (e.g. switch from 1j to 0.5j)
              await fetch(`/api/conge-days?date=${date}`, { method: "DELETE" });
              await fetch("/api/conge-days", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, time }),
              });
            } else if (existing) {
              // Remove congé
              await fetch(`/api/conge-days?date=${date}`, { method: "DELETE" });
            } else {
              // Add congé
              await fetch("/api/conge-days", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, time: time ?? 1 }),
              });
            }
            await fetchData();
            await fetchModalData();
          }}
        />
      )}
    </div>
  );
}
