"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { AutoComplete, AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
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
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

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

  const searchClients = (event: AutoCompleteCompleteEvent) => {
    const query = event.query.toLowerCase();
    setFilteredClients(
      clients.filter((c) => c.toLowerCase().includes(query) && c !== client)
    );
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

  const timeOptions = [
    ...(isMulti || remainingTime >= 0.5 || (editingEntry && editingEntry.time >= 0.5)
      ? [{ label: "0.5j", value: 0.5 }]
      : []),
    ...(isMulti || remainingTime >= 1 || (editingEntry && editingEntry.time >= 1)
      ? [{ label: "1j", value: 1 }]
      : []),
  ];

  const typeOptions = [
    { label: "—", value: "" },
    ...TYPES.map((t) => ({ label: t, value: t })),
  ];

  const header = isMulti
    ? `${dates.length} jours sélectionnés`
    : formatDateLong(singleDate);

  const filledTime = usedTime + congeTime + formationTime;

  const progressPercent = Math.min(100, Math.round(filledTime * 100));

  return (
    <Dialog
      header={
        <div className="modal-header-custom">
          <div className="modal-header-title">{header}</div>
          {!isMulti && (
            <div className="modal-progress-section">
              <div className="modal-progress-bar">
                <div
                  className={`modal-progress-fill ${progressPercent >= 100 ? "complete" : progressPercent >= 50 ? "half" : ""}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="modal-progress-label">
                <span>{filledTime}j / 1j</span>
                {remainingTime > 0 && !isBlocked && <span className="modal-remaining">{remainingTime}j disponible</span>}
                {remainingTime <= 0 && !isBlocked && <span className="modal-complete-label"><i className="pi pi-check-circle" /> Complet</span>}
              </div>
            </div>
          )}
        </div>
      }
      visible={true}
      className="entry-dialog"
      style={{ width: "520px", maxHeight: "85vh" }}
      onHide={onClose}
      modal
    >
      {/* Multi date subtitle */}
      {isMulti && (
        <div className="multi-dates-chips">
          {dates.map((d) => (
            <span key={d} className="date-chip">{formatDate(d)}</span>
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
              <Button label="→ 0.5j" size="small" severity="danger" text onClick={() => onToggleFormation(singleDate, 0.5)} />
            )}
            {isHalfFormation && (
              <Button label="→ 1j" size="small" severity="danger" text onClick={() => onToggleFormation(singleDate, 1)} />
            )}
            <Button icon="pi pi-times" size="small" severity="secondary" text rounded onClick={() => onToggleFormation(singleDate)} tooltip="Retirer" tooltipOptions={{ position: "top" }} />
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
              <Button label="→ 0.5j" size="small" severity="warning" text onClick={() => onToggleConge(singleDate, 0.5)} />
            )}
            {isHalfConge && (
              <Button label="→ 1j" size="small" severity="warning" text onClick={() => onToggleConge(singleDate, 1)} />
            )}
            <Button icon="pi pi-times" size="small" severity="secondary" text rounded onClick={() => onToggleConge(singleDate)} tooltip="Retirer" tooltipOptions={{ position: "top" }} />
          </div>
        </div>
      )}

      {/* Quick action chips */}
      {!isMulti && !isFormation && !isConge && (
        <div className="quick-actions">
          <span className="quick-actions-label">Actions rapides</span>
          <div className="quick-actions-chips">
            <button className="action-chip formation" onClick={() => onToggleFormation(singleDate, 1)}><i className="pi pi-book" /> Formation 1j</button>
            <button className="action-chip formation" onClick={() => onToggleFormation(singleDate, 0.5)}><i className="pi pi-book" /> Formation 0.5j</button>
            <button className="action-chip conge" onClick={() => onToggleConge(singleDate, 1)}><i className="pi pi-calendar-minus" /> Congé 1j</button>
            <button className="action-chip conge" onClick={() => onToggleConge(singleDate, 0.5)}><i className="pi pi-calendar-minus" /> Congé 0.5j</button>
          </div>
        </div>
      )}

      {/* Existing entries */}
      {!isMulti && !isBlocked && currentEntries.length > 0 && (
        <>
          <div className="entries-section">
            <div className="entries-section-header">
              <span className="modal-section-title" style={{ marginBottom: 0 }}>
                Entrées ({currentEntries.length})
              </span>
            </div>
            <div className="entries-list">
              {currentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`entry-card ${editingEntry?.id === entry.id ? "editing" : ""}`}
                >
                  <div className="entry-card-body">
                    <div className="entry-card-head">
                      <span className="entry-client">{entry.client}</span>
                      <span className={`entry-time-badge ${entry.time >= 1 ? "full" : "half"}`}>{entry.time}j</span>
                      {entry.type && <Tag value={entry.type} severity="secondary" style={{ fontSize: 9, padding: "2px 8px" }} />}
                    </div>
                    <p className="entry-desc">
                      {entry.comment}
                      {entry.ticket && <span className="entry-ticket"> · {entry.ticket}</span>}
                    </p>
                  </div>
                  <div className="entry-actions">
                    <Button icon="pi pi-pencil" size="small" text rounded severity="info" onClick={() => startEditing(entry)} tooltip="Modifier" tooltipOptions={{ position: "top" }} />
                    <Button icon="pi pi-trash" size="small" text rounded severity="danger" onClick={() => handleDelete(entry.id)} tooltip="Supprimer" tooltipOptions={{ position: "top" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Multi-mode summary */}
      {isMulti && (
        <>
          <Divider />
          <div className="modal-section-title">Résumé</div>
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
              <div className="toggle-row">
                {eligibleDates.length > 0 && (
                  <>
                    <Button label={`Formation 1j (${eligibleDates.length})`} size="small" severity="danger" outlined onClick={() => { for (const d of eligibleDates) onToggleFormation(d, 1); }} />
                    <Button label={`Formation 0.5j (${eligibleDates.length})`} size="small" severity="danger" outlined onClick={() => { for (const d of eligibleDates) onToggleFormation(d, 0.5); }} />
                    <Button label={`Congé 1j (${eligibleDates.length})`} size="small" severity="warning" outlined onClick={() => { for (const d of eligibleDates) onToggleConge(d, 1); }} />
                    <Button label={`Congé 0.5j (${eligibleDates.length})`} size="small" severity="warning" outlined onClick={() => { for (const d of eligibleDates) onToggleConge(d, 0.5); }} />
                  </>
                )}
                {formationOnlyDates.length > 0 && (
                  <Button label={`Retirer formation (${formationOnlyDates.length})`} size="small" severity="danger" onClick={() => { for (const d of formationOnlyDates) onToggleFormation(d); }} />
                )}
                {congeOnlyDates.length > 0 && (
                  <Button label={`Retirer congé (${congeOnlyDates.length})`} size="small" severity="warning" onClick={() => { for (const d of congeOnlyDates) onToggleConge(d); }} />
                )}
              </div>
            );
          })()}

          {dates.some((d) => allEntries.some((e) => e.date.startsWith(d))) && (
            <Button label="Supprimer toutes les entrées" icon="pi pi-trash" severity="danger" size="small" outlined style={{ width: "100%", marginBottom: 12 }} onClick={handleDeleteAll} />
          )}
        </>
      )}

      {/* Form */}
      {(isMulti || (!isBlocked && (canAdd || editingEntry)) || ((isHalfConge || isHalfFormation) && canAdd)) && (
        <>
          <Divider />
          <form onSubmit={handleSubmit} className="entry-form">
            <div className="entry-form-header">
              <span className="modal-section-title" style={{ marginBottom: 0 }}>
                {editingEntry ? "Modifier l'entrée" : isMulti ? "Ajouter sur tous les jours" : "Nouvelle entrée"}
              </span>
              {editingEntry && (
                <Button label="Annuler" size="small" text severity="secondary" onClick={resetForm} type="button" icon="pi pi-times" />
              )}
            </div>

            <div className="form-group">
              <label className="form-label"><i className="pi pi-user" style={{ fontSize: 10 }} /> Client</label>
              <AutoComplete value={client} suggestions={filteredClients} completeMethod={searchClients} onChange={(e) => setClient(e.value)} placeholder="Rechercher un client..." className="w-full" inputClassName="w-full" />
            </div>

            <div className="form-group">
              <label className="form-label"><i className="pi pi-hashtag" style={{ fontSize: 10 }} /> Ticket <span className="opt">(optionnel)</span></label>
              <InputText value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="Référence du ticket" className="w-full" />
            </div>

            <div className="form-group">
              <label className="form-label"><i className="pi pi-pencil" style={{ fontSize: 10 }} /> Commentaire</label>
              <InputTextarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Décrivez votre activité..." className="w-full" rows={2} autoResize />
            </div>

            <div className="form-row-inline">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label"><i className="pi pi-clock" style={{ fontSize: 10 }} /> Durée</label>
                {timeOptions.length > 0 && (
                  <SelectButton value={time} onChange={(e) => setTime(e.value)} options={timeOptions} optionLabel="label" optionValue="value" className="time-select" />
                )}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label"><i className="pi pi-tag" style={{ fontSize: 10 }} /> Type <span className="opt">(optionnel)</span></label>
                <SelectButton value={type} onChange={(e) => setType(e.value)} options={typeOptions} optionLabel="label" optionValue="value" className="type-select" />
              </div>
            </div>

            <Button
              type="submit"
              label={saving ? "Enregistrement..." : editingEntry ? "Mettre à jour" : isMulti ? `Ajouter (${dates.length}j)` : "Ajouter l'entrée"}
              icon={editingEntry ? "pi pi-check" : "pi pi-plus"}
              loading={saving}
              disabled={saving || !client || !comment}
              className="submit-btn"
              severity={editingEntry ? "info" : undefined}
            />
          </form>
        </>
      )}

      {/* Full day */}
      {!isMulti && !isBlocked && !canAdd && !editingEntry && currentEntries.length > 0 && (
        <div className="day-complete-banner">
          <i className="pi pi-check-circle" />
          <span>Journée complète</span>
        </div>
      )}
    </Dialog>
  );
}
