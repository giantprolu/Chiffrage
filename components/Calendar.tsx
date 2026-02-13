"use client";

import { useCallback, useEffect, useState } from "react";
import DayCell from "./DayCell";
import EntryModal from "./EntryModal";
import MonthNav from "./MonthNav";
import type { Entry, FormationDay, CongeDay } from "@/lib/types";
import {
  fetchEntries,
  fetchFormationDays,
  fetchCongeDays,
  createEntry,
  deleteFormationDay,
  createFormationDay,
  deleteCongeDay,
  createCongeDay,
} from "@/lib/services";

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

  const fetchData = useCallback(async () => {
    const [e, f, c] = await Promise.all([
      fetchEntries(month, year),
      fetchFormationDays(month, year),
      fetchCongeDays(month, year),
    ]);
    setEntries(e);
    setFormationDays(f);
    setCongeDays(c);
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
      if (!isDayBlocked(day)) handlePaste(day);
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
    const allEntriesForMonth = await fetchEntries(m, y);
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
      await createEntry({
        date: ds,
        client: entry.client,
        ticket: entry.ticket || "",
        comment: entry.comment,
        time,
        type: entry.type,
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
        const [e, f, c] = await Promise.all([
          fetchEntries(m, y),
          fetchFormationDays(m, y),
          fetchCongeDays(m, y),
        ]);
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
    if (selectedDates.length > 0) setShowModal(true);
  };

  const handleToggleFormation = async (date: string, time?: number) => {
    const existing = formationDays.find((f) => f.date.startsWith(date));
    if (existing && time !== undefined) {
      await deleteFormationDay(date);
      await createFormationDay(date, time);
    } else if (existing) {
      await deleteFormationDay(date);
    } else {
      await createFormationDay(date, time ?? 1);
    }
    await fetchData();
    await fetchModalData();
  };

  const handleToggleConge = async (date: string, time?: number) => {
    const existing = congeDays.find((c) => c.date.startsWith(date));
    if (existing && time !== undefined) {
      await deleteCongeDay(date);
      await createCongeDay(date, time);
    } else if (existing) {
      await deleteCongeDay(date);
    } else {
      await createCongeDay(date, time ?? 1);
    }
    await fetchData();
    await fetchModalData();
  };

  return (
    <div className="animate-fade-in">
      <MonthNav
        month={month}
        year={year}
        onChange={(m, y) => { setMonth(m); setYear(y); }}
      />

      {/* Toolbar */}
      <div className="toolbar">
        <button
          className={`btn btn-sm ${mode === "select" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => {
            if (mode === "select") cancelMode();
            else { setMode("select"); setCopiedEntries([]); setSelectedDates([]); }
          }}
        >
          <i className={mode === "select" ? "pi pi-check-circle" : "pi pi-check-square"} style={{ fontSize: 12 }} />
          {mode === "select" ? `${selectedDates.length} sélectionné${selectedDates.length > 1 ? "s" : ""}` : "Sélectionner"}
        </button>

        {mode === "select" && selectedDates.length > 0 && (
          <>
            <button className="btn btn-sm btn-outline" onClick={openMultiEdit}>
              <i className="pi pi-pencil" style={{ fontSize: 12 }} /> Éditer
            </button>
            <button className="btn btn-sm btn-outline" onClick={handleCopy}>
              <i className="pi pi-copy" style={{ fontSize: 12 }} /> Copier
            </button>
          </>
        )}

        {mode === "copy" && (
          <span className="toolbar-info">
            <i className="pi pi-clipboard" style={{ fontSize: 12 }} />
            {copiedEntries.length} tâche{copiedEntries.length > 1 ? "s" : ""} copiée{copiedEntries.length > 1 ? "s" : ""} — cliquez sur un jour
          </span>
        )}

        {(mode === "select" || mode === "copy") && (
          <span className="toolbar-spacer">
            <button className="btn btn-sm btn-ghost" onClick={cancelMode}>
              <i className="pi pi-times" style={{ fontSize: 12 }} /> Annuler
            </button>
          </span>
        )}
      </div>

      {/* Day headers */}
      <div className="cal-grid" style={{ marginBottom: 4 }}>
        {DAY_LABELS.map((label, i) => (
          <div key={label} className={`cal-header-cell ${i >= 5 ? "weekend" : ""}`}>
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="cal-grid">
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
      <div className="cal-footer">
        <div className="cal-stats">
          <span className="stat-item">
            <i className="pi pi-briefcase" style={{ color: "var(--accent)", fontSize: 12 }} />
            <strong className="stat-value work">{totalWork}j</strong>
            <span className="stat-label">travail</span>
          </span>
          <span className="stat-item">
            <i className="pi pi-book" style={{ color: "var(--danger)", fontSize: 12 }} />
            <strong className="stat-value formation">{totalFormation}j</strong>
            <span className="stat-label">formation</span>
          </span>
          <span className="stat-item">
            <i className="pi pi-calendar-minus" style={{ color: "var(--orange)", fontSize: 12 }} />
            <strong className="stat-value conge">{totalConge}j</strong>
            <span className="stat-label">congé</span>
          </span>
        </div>
        <span className="stat-total">
          {totalWork + totalFormation + totalConge}j total
        </span>
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="legend-item"><span className="legend-dot green" /> Complet</span>
        <span className="legend-item"><span className="legend-dot amber" /> Incomplet</span>
        <span className="legend-item"><span className="legend-dot red" /> Formation</span>
        <span className="legend-item"><span className="legend-dot orange" /> Congé</span>
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
          onSave={() => { fetchData(); fetchModalData(); }}
          onToggleFormation={handleToggleFormation}
          onToggleConge={handleToggleConge}
        />
      )}
    </div>
  );
}
