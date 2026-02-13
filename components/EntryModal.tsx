"use client";

import { useEffect, useRef, useState } from "react";
import type { Entry, FormationDay, CongeDay } from "@/lib/types";
import { fetchClients, createEntry, updateEntry, deleteEntry } from "@/lib/services";

interface EntryModalProps {
  dates: string[];
  allEntries: Entry[];
  formationDays: FormationDay[];
  congeDays: CongeDay[];
  onClose: () => void;
  onSave: () => void;
  onToggleFormation: (date: string, time?: number) => void;
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
  onToggleFormation,
  onToggleConge,
}: EntryModalProps) {
  const [client, setClient] = useState("");
  const [ticket, setTicket] = useState("");
  const [comment, setComment] = useState("");
  const [time, setTime] = useState<number>(0.5);
  const [type, setType] = useState("");
  const [clients, setClients] = useState<string[]>([]);
  const [filteredClients, setFilteredClients] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const isMulti = dates.length > 1;
  const singleDate = dates[0];

  const formationEntry = !isMulti ? formationDays.find((f) => f.date.startsWith(singleDate)) : undefined;
  const isFormation = !!formationEntry;
  const formationTime = formationEntry?.time ?? 0;
  const isFullFormation = isFormation && formationTime >= 1;
  const isHalfFormation = isFormation && formationTime < 1;
  const congeEntry = !isMulti ? congeDays.find((c) => c.date.startsWith(singleDate)) : undefined;
  const isConge = !!congeEntry;
  const congeTime = congeEntry?.time ?? 0;
  const isFullConge = isConge && congeTime >= 1;
  const isHalfConge = isConge && congeTime < 1;
  const isBlocked = isFullFormation || isFullConge;

  const getEntriesForDate = (date: string) =>
    allEntries.filter((e) => e.date.startsWith(date));

  const currentEntries = isMulti ? [] : getEntriesForDate(singleDate);

  useEffect(() => {
    fetchClients().then(setClients);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        clientInputRef.current &&
        !clientInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClientChange = (value: string) => {
    setClient(value);
    const query = value.toLowerCase();
    if (query.length > 0) {
      setFilteredClients(
        clients.filter((c) => c.toLowerCase().includes(query) && c !== value)
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectClient = (c: string) => {
    setClient(c);
    setShowSuggestions(false);
  };

  const usedTime = currentEntries
    .filter((e) => !editingEntry || e.id !== editingEntry.id)
    .reduce((sum, e) => sum + e.time, 0);
  const maxTime = 1 - congeTime - formationTime;
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
      await updateEntry(editingEntry.id, {
        date: singleDate,
        client,
        ticket,
        comment,
        time,
        type: type || null,
      });
    } else {
      const targetDates = isMulti ? dates : [singleDate];
      for (const d of targetDates) {
        const dateFormation = formationDays.find((f) => f.date.startsWith(d));
        const isDateFullFormation = dateFormation && (dateFormation.time ?? 1) >= 1;
        const dateConge = congeDays.find((c) => c.date.startsWith(d));
        const isDateFullConge = dateConge && dateConge.time >= 1;
        if (isDateFullFormation || isDateFullConge) continue;

        const dateFormationTime = dateFormation?.time ?? 0;
        const dateCongeTime = dateConge?.time ?? 0;
        const dateEntries = allEntries.filter((e) => e.date.startsWith(d));
        const dateUsed = dateEntries.reduce((sum, e) => sum + e.time, 0);
        const dateRemaining = Math.round((1 - dateCongeTime - dateFormationTime - dateUsed) * 10) / 10;
        if (dateRemaining <= 0) continue;

        const actualTime = Math.min(time, dateRemaining);
        await createEntry({
          date: d,
          client,
          ticket,
          comment,
          time: actualTime,
          type: type || null,
        });
      }
    }

    resetForm();
    setSaving(false);
    onSave();
  };

  const handleDelete = async (id: number) => {
    if (editingEntry?.id === id) resetForm();
    await deleteEntry(id);
    onSave();
  };

  const handleDeleteAll = async () => {
    for (const d of dates) {
      const dateEntries = allEntries.filter((e) => e.date.startsWith(d));
      for (const entry of dateEntries) {
        await deleteEntry(entry.id);
      }
    }
    onSave();
  };

  const showTime05 = isMulti || remainingTime >= 0.5 || (editingEntry && editingEntry.time >= 0.5);
  const showTime1 = isMulti || remainingTime >= 1 || (editingEntry && editingEntry.time >= 1);

  const typeOptions = [{ label: "—", value: "" }, ...TYPES.map((t) => ({ label: t, value: t }))];

  const header = isMulti
    ? `${dates.length} jours sélectionnés`
    : formatDateLong(singleDate);

  const filledTime = usedTime + congeTime + formationTime;
  const progressPercent = Math.min(100, Math.round(filledTime * 100));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-header-title">{header}</div>
            {!isMulti && (
              <>
                <div className="progress-bar-wrap" style={{ marginTop: 8 }}>
                  <div
                    className={`progress-bar-fill ${progressPercent >= 100 ? "complete" : "low"}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="progress-label">
                  <span>{filledTime}j / 1j</span>
                  {remainingTime > 0 && !isBlocked && <span className="progress-remaining">{remainingTime}j disponible</span>}
                  {remainingTime <= 0 && !isBlocked && <span className="progress-complete"><i className="pi pi-check-circle" /> Complet</span>}
                </div>
              </>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="pi pi-times" style={{ fontSize: 12 }} />
          </button>
        </div>

        <div className="modal-body">
          {/* Multi date chips */}
          {isMulti && (
            <div className="quick-chips" style={{ marginBottom: 16 }}>
              {dates.map((d) => (
                <span key={d} className="tag tag-accent">{formatDate(d)}</span>
              ))}
            </div>
          )}

          {/* Formation / Congé status banners */}
          {!isMulti && isFormation && (
            <div className="status-banner formation">
              <div className="status-banner-left">
                <i className="pi pi-book" />
                <span>Formation ({formationTime}j)</span>
              </div>
              <div className="status-banner-actions">
                {isFullFormation && (
                  <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => onToggleFormation(singleDate, 0.5)}>→ 0.5j</button>
                )}
                {isHalfFormation && (
                  <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => onToggleFormation(singleDate, 1)}>→ 1j</button>
                )}
                <button className="btn-icon btn-ghost sm" onClick={() => onToggleFormation(singleDate)} title="Retirer">
                  <i className="pi pi-times" style={{ fontSize: 10 }} />
                </button>
              </div>
            </div>
          )}

          {!isMulti && isConge && (
            <div className="status-banner conge">
              <div className="status-banner-left">
                <i className="pi pi-calendar-minus" />
                <span>Congé ({congeTime}j)</span>
              </div>
              <div className="status-banner-actions">
                {isFullConge && (
                  <button className="btn btn-sm btn-ghost" style={{ color: "var(--orange)" }} onClick={() => onToggleConge(singleDate, 0.5)}>→ 0.5j</button>
                )}
                {isHalfConge && (
                  <button className="btn btn-sm btn-ghost" style={{ color: "var(--orange)" }} onClick={() => onToggleConge(singleDate, 1)}>→ 1j</button>
                )}
                <button className="btn-icon btn-ghost sm" onClick={() => onToggleConge(singleDate)} title="Retirer">
                  <i className="pi pi-times" style={{ fontSize: 10 }} />
                </button>
              </div>
            </div>
          )}

          {/* Quick action chips */}
          {!isMulti && !isFormation && !isConge && (
            <>
              <div className="section-label">Actions rapides</div>
              <div className="quick-chips">
                <button className="chip formation" onClick={() => onToggleFormation(singleDate, 1)}><i className="pi pi-book" /> Formation 1j</button>
                <button className="chip formation" onClick={() => onToggleFormation(singleDate, 0.5)}><i className="pi pi-book" /> Formation 0.5j</button>
                <button className="chip conge" onClick={() => onToggleConge(singleDate, 1)}><i className="pi pi-calendar-minus" /> Congé 1j</button>
                <button className="chip conge" onClick={() => onToggleConge(singleDate, 0.5)}><i className="pi pi-calendar-minus" /> Congé 0.5j</button>
              </div>
            </>
          )}

          {/* Existing entries */}
          {!isMulti && !isBlocked && currentEntries.length > 0 && (
            <>
              <div className="section-label">Entrées ({currentEntries.length})</div>
              {currentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`entry-card ${editingEntry?.id === entry.id ? "editing" : ""}`}
                >
                  <div className="entry-card-body">
                    <div className="entry-card-head">
                      <span className="entry-client">{entry.client}</span>
                      <span className={`entry-time-badge ${entry.time >= 1 ? "full" : "half"}`}>{entry.time}j</span>
                      {entry.type && <span className="tag tag-default">{entry.type}</span>}
                    </div>
                    <p className="entry-desc">
                      {entry.comment}
                      {entry.ticket && <span className="entry-ticket"> · {entry.ticket}</span>}
                    </p>
                  </div>
                  <div className="entry-actions">
                    <button className="btn-icon btn-ghost sm" onClick={() => startEditing(entry)} title="Modifier">
                      <i className="pi pi-pencil" style={{ fontSize: 11, color: "var(--accent)" }} />
                    </button>
                    <button className="btn-icon btn-ghost sm" onClick={() => handleDelete(entry.id)} title="Supprimer">
                      <i className="pi pi-trash" style={{ fontSize: 11, color: "var(--danger)" }} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Multi-mode summary */}
          {isMulti && (
            <>
              <hr className="divider" />
              <div className="section-label">Résumé</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 144, overflowY: "auto", marginBottom: 12 }}>
                {dates.map((d) => {
                  const de = allEntries.filter((e) => e.date.startsWith(d));
                  const total = de.reduce((sum, e) => sum + e.time, 0);
                  const isFmt = formationDays.some((f) => f.date.startsWith(d));
                  const cng = congeDays.find((c) => c.date.startsWith(d));
                  return (
                    <div key={d} className="multi-summary-row">
                      <span className="multi-summary-date">{formatDate(d)}</span>
                      <span style={{ fontSize: 12 }}>
                        {isFmt && <span className="status-formation">Formation</span>}
                        {cng && <span className="status-conge">Congé{cng.time < 1 ? ` ${cng.time}j` : ""}</span>}
                        {!isFmt && !cng && <span className={total >= 1 ? "status-full" : ""} style={total < 1 ? { color: "var(--muted)" } : undefined}>{total}j</span>}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Multi actions */}
              {(() => {
                const eligibleDates = dates.filter(
                  (d) => !formationDays.some((f) => f.date.startsWith(d)) && !congeDays.some((c) => c.date.startsWith(d))
                );
                const formationOnlyDates = dates.filter((d) => formationDays.some((f) => f.date.startsWith(d)));
                const congeOnlyDates = dates.filter((d) => congeDays.some((c) => c.date.startsWith(d)));
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {eligibleDates.length > 0 && (
                      <>
                        <button className="btn btn-sm btn-outline" style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--danger)" }} onClick={() => { for (const d of eligibleDates) onToggleFormation(d, 1); }}>Formation 1j ({eligibleDates.length})</button>
                        <button className="btn btn-sm btn-outline" style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--danger)" }} onClick={() => { for (const d of eligibleDates) onToggleFormation(d, 0.5); }}>Formation 0.5j ({eligibleDates.length})</button>
                        <button className="btn btn-sm btn-outline" style={{ borderColor: "rgba(249,115,22,0.3)", color: "var(--orange)" }} onClick={() => { for (const d of eligibleDates) onToggleConge(d, 1); }}>Congé 1j ({eligibleDates.length})</button>
                        <button className="btn btn-sm btn-outline" style={{ borderColor: "rgba(249,115,22,0.3)", color: "var(--orange)" }} onClick={() => { for (const d of eligibleDates) onToggleConge(d, 0.5); }}>Congé 0.5j ({eligibleDates.length})</button>
                      </>
                    )}
                    {formationOnlyDates.length > 0 && (
                      <button className="btn btn-sm btn-danger" onClick={() => { for (const d of formationOnlyDates) onToggleFormation(d); }}>Retirer formation ({formationOnlyDates.length})</button>
                    )}
                    {congeOnlyDates.length > 0 && (
                      <button className="btn btn-sm btn-outline" style={{ borderColor: "rgba(249,115,22,0.3)", color: "var(--orange)" }} onClick={() => { for (const d of congeOnlyDates) onToggleConge(d); }}>Retirer congé ({congeOnlyDates.length})</button>
                    )}
                  </div>
                );
              })()}

              {dates.some((d) => allEntries.some((e) => e.date.startsWith(d))) && (
                <button className="btn btn-sm btn-danger btn-full" style={{ marginBottom: 12 }} onClick={handleDeleteAll}>
                  <i className="pi pi-trash" /> Supprimer toutes les entrées
                </button>
              )}
            </>
          )}

          {/* Form */}
          {(isMulti || (!isBlocked && (canAdd || editingEntry)) || ((isHalfConge || isHalfFormation) && canAdd)) && (
            <>
              <hr className="divider" />
              <form onSubmit={handleSubmit} className="form-stack">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="section-label" style={{ margin: 0 }}>
                    {editingEntry ? "Modifier l'entrée" : isMulti ? "Ajouter sur tous les jours" : "Nouvelle entrée"}
                  </div>
                  {editingEntry && (
                    <button className="btn btn-sm btn-ghost" type="button" onClick={resetForm}>
                      <i className="pi pi-times" style={{ fontSize: 10 }} /> Annuler
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label"><i className="pi pi-user" style={{ fontSize: 10 }} /> Client</label>
                  <div className="autocomplete-wrap">
                    <input
                      ref={clientInputRef}
                      type="text"
                      value={client}
                      onChange={(e) => handleClientChange(e.target.value)}
                      onFocus={() => { if (client.length > 0 && filteredClients.length > 0) setShowSuggestions(true); }}
                      placeholder="Rechercher un client..."
                      className="c-input"
                    />
                    {showSuggestions && filteredClients.length > 0 && (
                      <div className="autocomplete-dropdown" ref={suggestionsRef}>
                        {filteredClients.map((c) => (
                          <div key={c} className="autocomplete-item" onClick={() => selectClient(c)}>
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><i className="pi pi-hashtag" style={{ fontSize: 10 }} /> Ticket <span className="opt">(optionnel)</span></label>
                  <input
                    type="text"
                    value={ticket}
                    onChange={(e) => setTicket(e.target.value)}
                    placeholder="Référence du ticket"
                    className="c-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label"><i className="pi pi-pencil" style={{ fontSize: 10 }} /> Commentaire</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Décrivez votre activité..."
                    className="c-textarea"
                    rows={2}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><i className="pi pi-clock" style={{ fontSize: 10 }} /> Durée</label>
                    <div className="pill-toggle">
                      {showTime05 && (
                        <button type="button" className={`pill-toggle-btn ${time === 0.5 ? "active" : ""}`} onClick={() => setTime(0.5)}>0.5j</button>
                      )}
                      {showTime1 && (
                        <button type="button" className={`pill-toggle-btn ${time === 1 ? "active" : ""}`} onClick={() => setTime(1)}>1j</button>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label"><i className="pi pi-tag" style={{ fontSize: 10 }} /> Type <span className="opt">(opt.)</span></label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="c-select">
                      {typeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-full ${editingEntry ? "btn-primary" : "btn-primary"}`}
                  disabled={saving || !client || !comment}
                >
                  {saving ? (
                    <><i className="pi pi-spinner spinner" /> Enregistrement...</>
                  ) : editingEntry ? (
                    <><i className="pi pi-check" /> Mettre à jour</>
                  ) : isMulti ? (
                    <><i className="pi pi-plus" /> Ajouter ({dates.length}j)</>
                  ) : (
                    <><i className="pi pi-plus" /> Ajouter l&apos;entrée</>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Full day message */}
          {!isMulti && !isBlocked && !canAdd && !editingEntry && currentEntries.length > 0 && (
            <div className="day-complete-banner">
              <i className="pi pi-check-circle" />
              <span>Journée complète</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
