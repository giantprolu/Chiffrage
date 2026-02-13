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
    <div className="animate-fade-in">
      <MonthNav
        month={month}
        year={year}
        onChange={(m, y) => {
          setMonth(m);
          setYear(y);
        }}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <Button
          label={mode === "select" ? `${selectedDates.length} sélectionné${selectedDates.length > 1 ? "s" : ""}` : "Sélectionner"}
          icon={mode === "select" ? "pi pi-check-circle" : "pi pi-check-square"}
          size="small"
          text={mode !== "select"}
          severity={mode === "select" ? "info" : "secondary"}
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
            <Button label="Éditer" icon="pi pi-pencil" size="small" severity="info" outlined onClick={openMultiEdit} />
            <Button label="Copier" icon="pi pi-copy" size="small" severity="help" outlined onClick={handleCopy} />
          </>
        )}

        {mode === "copy" && (
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5 ml-1">
            <i className="pi pi-clipboard text-xs" />
            {copiedEntries.length} tâche{copiedEntries.length > 1 ? "s" : ""} copiée{copiedEntries.length > 1 ? "s" : ""} — cliquez sur un jour
          </span>
        )}

        {(mode === "select" || mode === "copy") && (
          <Button label="Annuler" icon="pi pi-times" size="small" text severity="secondary" onClick={cancelMode} className="ml-auto" />
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-[11px] font-semibold py-1.5 uppercase tracking-wide ${
              i >= 5 ? "text-gray-300 dark:text-slate-600" : "text-gray-400 dark:text-slate-500"
            }`}
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
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap text-sm px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <i className="pi pi-briefcase text-blue-500 text-xs" />
            <strong className="text-blue-600 dark:text-blue-400">{totalWork}j</strong>
            <span className="text-gray-400 dark:text-slate-500 text-xs">travail</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="pi pi-book text-red-500 text-xs" />
            <strong className="text-red-600 dark:text-red-400">{totalFormation}j</strong>
            <span className="text-gray-400 dark:text-slate-500 text-xs">formation</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="pi pi-calendar-minus text-orange-500 text-xs" />
            <strong className="text-orange-600 dark:text-orange-400">{totalConge}j</strong>
            <span className="text-gray-400 dark:text-slate-500 text-xs">congé</span>
          </span>
        </div>
        <span className="text-gray-500 dark:text-slate-400 font-semibold">
          {totalWork + totalFormation + totalConge}j total
        </span>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-400 dark:text-slate-500 px-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Complet</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Incomplet</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" /> Formation</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400" /> Congé</span>
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