"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";
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

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

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
    const formation = getFormationDay(day);
    return isWeekend(day) || (!!formation && (formation.time ?? 1) >= 1) || (!!conge && conge.time >= 1);
  };

  const totalWork = entries.reduce((sum, e) => sum + e.time, 0);
  const totalFormation = formationDays.reduce((sum, f) => sum + (f.time ?? 1), 0);
  const totalConge = congeDays.reduce((sum, c) => sum + (c.time ?? 1), 0);

  const handleDayClick = (day: number) => {
    const ds = dateStr(day);

    if (mode === "copy") {
      if (!isDayBlocked(day)) {
        handlePaste(day);
      }
      return;
    }

    if (mode === "select") {
      setSelectedDates((prev) =>
        prev.includes(ds) ? prev.filter((d) => d !== ds) : [...prev, ds]
      );
      return;
    }

    setSelectedDates([ds]);
    setShowModal(true);
  };

  const handleCopy = async () => {
    if (selectedDates.length === 0) return;
    const firstDate = selectedDates[0];
    const [y, m] = firstDate.split("-").map(Number);
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
    const formation = getFormationDay(day);
    const congeTime = conge?.time ?? 0;
    const fmtTime = formation?.time ?? 0;
    const existingTime = getEntriesForDay(day).reduce((sum, e) => sum + e.time, 0);
    let remaining = Math.round((1 - congeTime - fmtTime - existingTime) * 10) / 10;

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

  const [modalEntries, setModalEntries] = useState<Entry[]>([]);
  const [modalFormation, setModalFormation] = useState<FormationDay[]>([]);
  const [modalConge, setModalConge] = useState<CongeDay[]>([]);

  const fetchModalData = useCallback(async () => {
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
    <div className="animate-fade-in-up">
      <MonthNav
        month={month}
        year={year}
        onChange={(m, y) => {
          setMonth(m);
          setYear(y);
        }}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
        <Button
          label={mode === "select" ? `${selectedDates.length} sélectionné${selectedDates.length > 1 ? "s" : ""}` : "Sélectionner"}
          icon={mode === "select" ? "pi pi-check-circle" : "pi pi-check-square"}
          size="small"
          severity={mode === "select" ? "info" : "secondary"}
          outlined={mode !== "select"}
          onClick={() => {
            if (mode === "select") {
              cancelMode();
            } else {
              setMode("select");
              setCopiedEntries([]);
              setSelectedDates([]);
            }
          }}
        />

        {mode === "select" && selectedDates.length > 0 && (
          <>
            <Button
              label="Éditer"
              icon="pi pi-pencil"
              size="small"
              onClick={openMultiEdit}
            />
            <Button
              label="Copier"
              icon="pi pi-copy"
              size="small"
              severity="help"
              onClick={handleCopy}
            />
          </>
        )}

        {mode === "copy" && (
          <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
            <i className="pi pi-clipboard text-blue-500 text-sm" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              {copiedEntries.length} tâche{copiedEntries.length > 1 ? "s" : ""} — cliquez pour coller
            </span>
          </div>
        )}

        {(mode === "select" || mode === "copy") && (
          <Button
            label="Annuler"
            icon="pi pi-times"
            size="small"
            text
            severity="secondary"
            onClick={cancelMode}
            className="ml-auto"
          />
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-bold text-gray-400 dark:text-slate-500 py-2 uppercase tracking-widest"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
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
      <div className="mt-5 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <i className="pi pi-briefcase text-blue-500 text-xs" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{totalWork}j</span>
            <span className="text-xs text-blue-500/70">travail</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20">
            <i className="pi pi-book text-red-500 text-xs" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-300">{totalFormation}j</span>
            <span className="text-xs text-red-500/70">formation</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <i className="pi pi-calendar-minus text-orange-500 text-xs" />
            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{totalConge}j</span>
            <span className="text-xs text-orange-500/70">congé</span>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700/50">
            <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{totalWork + totalFormation + totalConge}j</span>
            <span className="text-xs text-gray-500/70">total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-5 text-[11px] text-gray-400 dark:text-slate-500 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-t-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40" />
          Complet
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-t-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40" />
          Incomplet
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-t-2 border-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40" />
          Formation
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-t-2 border-orange-400 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40" />
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
          onToggleFormation={async (date: string, time?: number) => {
            const existing = formationDays.find((f) => f.date.startsWith(date));
            if (existing && time !== undefined) {
              await fetch(`/api/formation-days?date=${date}`, { method: "DELETE" });
              await fetch("/api/formation-days", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, time }),
              });
            } else if (existing) {
              await fetch(`/api/formation-days?date=${date}`, { method: "DELETE" });
            } else {
              await fetch("/api/formation-days", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, time: time ?? 1 }),
              });
            }
            await fetchData();
            await fetchModalData();
          }}
          onToggleConge={async (date: string, time?: number) => {
            const existing = congeDays.find((c) => c.date.startsWith(date));
            if (existing && time !== undefined) {
              await fetch(`/api/conge-days?date=${date}`, { method: "DELETE" });
              await fetch("/api/conge-days", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, time }),
              });
            } else if (existing) {
              await fetch(`/api/conge-days?date=${date}`, { method: "DELETE" });
            } else {
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