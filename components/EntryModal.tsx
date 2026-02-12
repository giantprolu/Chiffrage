"use client";

import { useEffect, useState } from "react";
import type { Entry, FormationDay, CongeDay } from "./DayCell";

interface EntryModalProps {
  dates: string[]; // YYYY-MM-DD[]
  allEntries: Entry[];
  formationDays: FormationDay[];
  congeDays: CongeDay[];
  onClose: () => void;
  onSave: () => void;
  onToggleConge: (date: string, time?: number) => void;
}

const TYPES = ["Evolution", "Correctif", "Formation", "Support"];

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatDateLong(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EntryModal({
  dates,
  allEntries,
  formationDays,
  congeDays,
  onClose,
  onSave,
  onToggleConge,
}: EntryModalProps) {
  const [client, setClient] = useState("");
  const [ticket, setTicket] = useState("");
  const [comment, setComment] = useState("");
  const [time, setTime] = useState<number>(0.5);
  const [type, setType] = useState("");
  const [clients, setClients] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const isMulti = dates.length > 1;
  const singleDate = dates[0];

  // For single date: check formation/conge
  const isFormation = !isMulti && formationDays.some((f) => f.date.startsWith(singleDate));
  const congeEntry = !isMulti ? congeDays.find((c) => c.date.startsWith(singleDate)) : undefined;
  const isConge = !!congeEntry;
  const congeTime = congeEntry?.time ?? 0;
  const isFullConge = isConge && congeTime >= 1;
  const isHalfConge = isConge && congeTime < 1;
  const isBlocked = isFormation || isFullConge;

  // Entries for the active date(s)
  const getEntriesForDate = (date: string) =>
    allEntries.filter((e) => e.date.startsWith(date));

  const currentEntries = isMulti ? [] : getEntriesForDate(singleDate);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(() => {});
  }, []);

  const filteredClients = clients.filter(
    (c) => c.toLowerCase().includes(client.toLowerCase()) && c !== client
  );

  // Calculate remaining time (single mode)
  const usedTime = currentEntries
    .filter((e) => !editingEntry || e.id !== editingEntry.id)
    .reduce((sum, e) => sum + e.time, 0);
  const maxTime = 1 - congeTime; // 0.5 if half-day congé, 1 otherwise
  const remainingTime = Math.round((maxTime - usedTime) * 10) / 10;
  const canAdd = remainingTime > 0 && !isBlocked;

  useEffect(() => {
    if (!isMulti && time > remainingTime && remainingTime > 0) {
      setTime(remainingTime);
    }
  }, [remainingTime, time, isMulti]);

  const resetForm = () => {
    setClient("");
    setTicket("");
    setComment("");
    setTime(0.5);
    setType("");
    setEditingEntry(null);
  };

  const startEditing = (entry: Entry) => {
    setEditingEntry(entry);
    setClient(entry.client);
    setTicket(entry.ticket || "");
    setComment(entry.comment);
    setTime(entry.time);
    setType(entry.type || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !comment) return;
    setSaving(true);

    if (editingEntry) {
      await fetch(`/api/entries/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: singleDate, client, ticket, comment, time, type: type || null }),
      });
    } else {
      // Create on all selected dates
      const targetDates = isMulti ? dates : [singleDate];
      for (const d of targetDates) {
        // Skip formation days and full congé days
        const isDateFormation = formationDays.some((f) => f.date.startsWith(d));
        const dateConge = congeDays.find((c) => c.date.startsWith(d));
        const isDateFullConge = dateConge && dateConge.time >= 1;
        if (isDateFormation || isDateFullConge) continue;

        const dateCongeTime = dateConge?.time ?? 0;
        const dateEntries = allEntries.filter((e) => e.date.startsWith(d));
        const dateUsed = dateEntries.reduce((sum, e) => sum + e.time, 0);
        const dateRemaining = Math.round((1 - dateCongeTime - dateUsed) * 10) / 10;
        if (dateRemaining <= 0) continue;

        const actualTime = Math.min(time, dateRemaining);
        await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: d, client, ticket, comment, time: actualTime, type: type || null }),
        });
      }
    }

    resetForm();
    setSaving(false);
    onSave();
  };

  const handleDelete = async (id: number) => {
    if (editingEntry?.id === id) resetForm();
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    onSave();
  };

  const handleDeleteAll = async () => {
    for (const d of dates) {
      const dateEntries = allEntries.filter((e) => e.date.startsWith(d));
      for (const entry of dateEntries) {
        await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
      }
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-700">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            {isMulti ? (
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {dates.length} jours sélectionnés
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {dates.map(formatDate).join(", ")}
                </p>
              </div>
            ) : (
              <h3 className="font-bold text-lg capitalize text-zinc-900 dark:text-zinc-100">
                {formatDateLong(singleDate)}
              </h3>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Formation/Congé status (single mode) */}
        {!isMulti && isFormation && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                Journée de formation
              </span>
            </div>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-4">
              Pas de saisie possible sur ce jour
            </p>
          </div>
        )}

        {!isMulti && isConge && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  Congé ({congeTime}j)
                </span>
              </div>
              <div className="flex gap-1.5">
                {isFullConge && (
                  <button
                    onClick={() => onToggleConge(singleDate, 0.5)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors font-medium"
                  >
                    Passer à 0.5j
                  </button>
                )}
                {isHalfConge && (
                  <button
                    onClick={() => onToggleConge(singleDate, 1)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors font-medium"
                  >
                    Passer à 1j
                  </button>
                )}
                <button
                  onClick={() => onToggleConge(singleDate)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors font-medium"
                >
                  Retirer
                </button>
              </div>
            </div>
            {isHalfConge && (
              <p className="text-xs text-orange-500 dark:text-orange-400 mt-1.5 ml-4">
                {remainingTime > 0 ? `${remainingTime}j disponible pour la saisie` : "Journée complète"}
              </p>
            )}
            {isFullConge && (
              <p className="text-xs text-orange-500 dark:text-orange-400 mt-1 ml-4">
                Pas de saisie possible (congé journée complète)
              </p>
            )}
          </div>
        )}

        {/* Congé toggle (single, not formation, not currently congé) */}
        {!isMulti && !isFormation && !isConge && (
          <div className="mx-5 mt-4">
            <div className="flex gap-2">
              <button
                onClick={() => onToggleConge(singleDate, 1)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-800/50 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-sm font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Congé 1j
              </button>
              <button
                onClick={() => onToggleConge(singleDate, 0.5)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-800/50 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-sm font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Congé 0.5j
              </button>
            </div>
          </div>
        )}

        {/* Existing entries (single mode) */}
        {!isMulti && !isBlocked && currentEntries.length > 0 && (
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Entrées existantes
            </h4>
            <div className="space-y-2">
              {currentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    editingEntry?.id === entry.id
                      ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400"
                      : "bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {entry.client}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-full shrink-0">
                        {entry.time}j
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {entry.comment}
                      {entry.ticket && <span className="text-zinc-400"> · {entry.ticket}</span>}
                    </p>
                    {entry.type && (
                      <span className="inline-block text-[10px] mt-1 px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium">
                        {entry.type}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEditing(entry)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-mode: summary + congé + delete all */}
        {isMulti && (
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Résumé des jours sélectionnés
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {dates.map((d) => {
                const de = allEntries.filter((e) => e.date.startsWith(d));
                const total = de.reduce((sum, e) => sum + e.time, 0);
                const isFmt = formationDays.some((f) => f.date.startsWith(d));
                const cng = congeDays.find((c) => c.date.startsWith(d));
                return (
                  <div key={d} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                      {formatDate(d)}
                    </span>
                    {isFmt && <span className="text-xs text-red-500 font-medium">Formation</span>}
                    {cng && <span className="text-xs text-orange-500 font-medium">Congé {cng.time < 1 ? `(${cng.time}j)` : ""}</span>}
                    {!isFmt && !cng && (
                      <span className={`text-xs font-bold ${total >= 1 ? "text-emerald-500" : total > 0 ? "text-amber-500" : "text-zinc-400"}`}>
                        {total}j
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Marquer comme congé (multi) */}
            {(() => {
              const eligibleDates = dates.filter(
                (d) =>
                  !formationDays.some((f) => f.date.startsWith(d)) &&
                  !congeDays.some((c) => c.date.startsWith(d))
              );
              const congeOnlyDates = dates.filter(
                (d) => congeDays.some((c) => c.date.startsWith(d))
              );
              return (
                <div className="mt-3 flex flex-col gap-2">
                  {eligibleDates.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          for (const d of eligibleDates) onToggleConge(d, 1);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-800/50 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-sm font-medium"
                      >
                        Congé 1j ({eligibleDates.length}j)
                      </button>
                      <button
                        onClick={() => {
                          for (const d of eligibleDates) onToggleConge(d, 0.5);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-800/50 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-sm font-medium"
                      >
                        Congé 0.5j ({eligibleDates.length}j)
                      </button>
                    </div>
                  )}
                  {congeOnlyDates.length > 0 && (
                    <button
                      onClick={() => {
                        for (const d of congeOnlyDates) onToggleConge(d);
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors text-sm font-medium"
                    >
                      Retirer congé ({congeOnlyDates.length}j)
                    </button>
                  )}
                </div>
              );
            })()}

            {dates.some((d) => allEntries.some((e) => e.date.startsWith(d))) && (
              <button
                onClick={handleDeleteAll}
                className="mt-3 w-full py-2 rounded-xl text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
              >
                Supprimer toutes les entrées des jours sélectionnés
              </button>
            )}
          </div>
        )}

        {/* Form */}
        {(isMulti || (!isBlocked && (canAdd || editingEntry)) || (isHalfConge && canAdd)) && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Form header */}
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {editingEntry ? "Modifier l'entrée" : isMulti ? "Ajouter sur tous les jours" : "Nouvelle entrée"}
              </h4>
              {editingEntry && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Annuler
                </button>
              )}
            </div>

            {/* Client */}
            <div className="relative">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Client
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => {
                  setClient(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="Unhaj, Beaumanoir, TI..."
                required
              />
              {showSuggestions && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl max-h-36 overflow-y-auto">
                  {filteredClients.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      onMouseDown={() => {
                        setClient(c);
                        setShowSuggestions(false);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ticket */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Ticket <span className="text-zinc-300 dark:text-zinc-600 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="CS0021003, 5164..."
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Commentaire
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="Description de la tâche..."
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Temps
                {!isMulti && !editingEntry && (
                  <span className="font-normal text-zinc-300 dark:text-zinc-600 ml-1">
                    (restant : {remainingTime}j)
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                {(isMulti || remainingTime >= 0.5 || (editingEntry && editingEntry.time >= 0.5)) && (
                  <button
                    type="button"
                    onClick={() => setTime(0.5)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      time === 0.5
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    0.5 jour
                  </button>
                )}
                {(isMulti || remainingTime >= 1 || (editingEntry && editingEntry.time >= 1)) && (
                  <button
                    type="button"
                    onClick={() => setTime(1)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      time === 1
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    1 jour
                  </button>
                )}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Type <span className="text-zinc-300 dark:text-zinc-600 font-normal">(optionnel)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setType("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    type === ""
                      ? "bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900 shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  Aucun
                </button>
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      type === t
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving || !client || !comment}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-all"
            >
              {saving
                ? "Enregistrement..."
                : editingEntry
                ? "Mettre à jour"
                : isMulti
                ? `Ajouter sur ${dates.length} jours`
                : "Ajouter"}
            </button>
          </form>
        )}

        {/* Full day message (single mode) */}
        {!isMulti && !isBlocked && !canAdd && !editingEntry && currentEntries.length > 0 && (
          <div className="p-5 text-center">
            <span className="text-sm text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-xl">
              Journée complète (1j)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
