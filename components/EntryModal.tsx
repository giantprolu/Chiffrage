"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { AutoComplete, AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import type { Entry, FormationDay, CongeDay } from "./DayCell";

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
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(() => {});
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
      await fetch(`/api/entries/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: singleDate, client, ticket, comment, time, type: type || null }),
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

  const timeOptions = [
    ...(isMulti || remainingTime >= 0.5 || (editingEntry && editingEntry.time >= 0.5)
      ? [{ label: "0.5 jour", value: 0.5 }]
      : []),
    ...(isMulti || remainingTime >= 1 || (editingEntry && editingEntry.time >= 1)
      ? [{ label: "1 jour", value: 1 }]
      : []),
  ];

  const typeOptions = [
    { label: "Aucun", value: "" },
    ...TYPES.map((t) => ({ label: t, value: t })),
  ];

  const header = isMulti
    ? `${dates.length} jours sélectionnés`
    : formatDateLong(singleDate);

  return (
    <Dialog
      header={header}
      visible={true}
      style={{ width: "500px", maxHeight: "90vh" }}
      onHide={onClose}
      modal
      closable
      className="overflow-y-auto"
    >
      {/* Multi date subtitle */}
      {isMulti && (
        <p className="text-xs text-color-secondary mb-3">
          {dates.map(formatDate).join(", ")}
        </p>
      )}

      {/* Formation status (single mode) */}
      {!isMulti && isFormation && (
        <Message
          severity="error"
          className="w-full mb-3"
          content={
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-semibold">
                Formation ({formationTime}j)
              </span>
              <div className="flex gap-1">
                {isFullFormation && (
                  <Button
                    label="Passer à 0.5j"
                    size="small"
                    severity="danger"
                    text
                    onClick={() => onToggleFormation(singleDate, 0.5)}
                  />
                )}
                {isHalfFormation && (
                  <Button
                    label="Passer à 1j"
                    size="small"
                    severity="danger"
                    text
                    onClick={() => onToggleFormation(singleDate, 1)}
                  />
                )}
                <Button
                  label="Retirer"
                  size="small"
                  severity="secondary"
                  text
                  onClick={() => onToggleFormation(singleDate)}
                />
              </div>
            </div>
          }
        />
      )}

      {!isMulti && isConge && (
        <Message
          severity="warn"
          className="w-full mb-3"
          content={
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-semibold">
                Congé ({congeTime}j)
              </span>
              <div className="flex gap-1">
                {isFullConge && (
                  <Button
                    label="Passer à 0.5j"
                    size="small"
                    severity="warning"
                    text
                    onClick={() => onToggleConge(singleDate, 0.5)}
                  />
                )}
                {isHalfConge && (
                  <Button
                    label="Passer à 1j"
                    size="small"
                    severity="warning"
                    text
                    onClick={() => onToggleConge(singleDate, 1)}
                  />
                )}
                <Button
                  label="Retirer"
                  size="small"
                  severity="danger"
                  text
                  onClick={() => onToggleConge(singleDate)}
                />
              </div>
            </div>
          }
        />
      )}

      {/* Formation + Congé toggle (single, no formation, no congé) */}
      {!isMulti && !isFormation && !isConge && (
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            <Button
              label="Formation 1j"
              icon="pi pi-book"
              size="small"
              severity="danger"
              outlined
              className="flex-1"
              onClick={() => onToggleFormation(singleDate, 1)}
            />
            <Button
              label="Formation 0.5j"
              icon="pi pi-book"
              size="small"
              severity="danger"
              outlined
              className="flex-1"
              onClick={() => onToggleFormation(singleDate, 0.5)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              label="Congé 1j"
              icon="pi pi-calendar-minus"
              size="small"
              severity="warning"
              outlined
              className="flex-1"
              onClick={() => onToggleConge(singleDate, 1)}
            />
            <Button
              label="Congé 0.5j"
              icon="pi pi-calendar-minus"
              size="small"
              severity="warning"
              outlined
              className="flex-1"
              onClick={() => onToggleConge(singleDate, 0.5)}
            />
          </div>
        </div>
      )}

      {/* Existing entries (single mode) */}
      {!isMulti && !isBlocked && currentEntries.length > 0 && (
        <>
          <Divider />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-color-secondary mb-3">
            Entrées existantes
          </h4>
          <div className="space-y-2 mb-3">
            {currentEntries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  editingEntry?.id === entry.id
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">
                      {entry.client}
                    </span>
                    <Tag value={`${entry.time}j`} severity="info" rounded style={{ fontSize: "11px" }} />
                  </div>
                  <p className="text-xs text-color-secondary truncate mt-0.5">
                    {entry.comment}
                    {entry.ticket && <span className="opacity-60"> · {entry.ticket}</span>}
                  </p>
                  {entry.type && (
                    <Tag value={entry.type} severity="secondary" style={{ fontSize: "10px", marginTop: "4px" }} />
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    text
                    severity="info"
                    onClick={() => startEditing(entry)}
                    tooltip="Modifier"
                    tooltipOptions={{ position: "top" }}
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    text
                    severity="danger"
                    onClick={() => handleDelete(entry.id)}
                    tooltip="Supprimer"
                    tooltipOptions={{ position: "top" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Multi-mode: summary + congé + delete all */}
      {isMulti && (
        <>
          <Divider />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-color-secondary mb-3">
            Résumé des jours sélectionnés
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3">
            {dates.map((d) => {
              const de = allEntries.filter((e) => e.date.startsWith(d));
              const total = de.reduce((sum, e) => sum + e.time, 0);
              const isFmt = formationDays.some((f) => f.date.startsWith(d));
              const cng = congeDays.find((c) => c.date.startsWith(d));
              return (
                <div key={d} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="font-medium capitalize">{formatDate(d)}</span>
                  {isFmt && <Tag value="Formation" severity="danger" style={{ fontSize: "11px" }} />}
                  {cng && <Tag value={`Congé${cng.time < 1 ? ` (${cng.time}j)` : ""}`} severity="warning" style={{ fontSize: "11px" }} />}
                  {!isFmt && !cng && (
                    <Tag
                      value={`${total}j`}
                      severity={total >= 1 ? "success" : total > 0 ? "warning" : "secondary"}
                      style={{ fontSize: "11px" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Multi mode actions */}
          {(() => {
            const eligibleDates = dates.filter(
              (d) =>
                !formationDays.some((f) => f.date.startsWith(d)) &&
                !congeDays.some((c) => c.date.startsWith(d))
            );
            const formationOnlyDates = dates.filter(
              (d) => formationDays.some((f) => f.date.startsWith(d))
            );
            const congeOnlyDates = dates.filter(
              (d) => congeDays.some((c) => c.date.startsWith(d))
            );
            return (
              <div className="space-y-2 mb-3">
                {eligibleDates.length > 0 && (
                  <>
                    <div className="flex gap-2">
                      <Button
                        label={`Formation 1j (${eligibleDates.length}j)`}
                        size="small"
                        severity="danger"
                        outlined
                        className="flex-1"
                        onClick={() => { for (const d of eligibleDates) onToggleFormation(d, 1); }}
                      />
                      <Button
                        label={`Formation 0.5j (${eligibleDates.length}j)`}
                        size="small"
                        severity="danger"
                        outlined
                        className="flex-1"
                        onClick={() => { for (const d of eligibleDates) onToggleFormation(d, 0.5); }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        label={`Congé 1j (${eligibleDates.length}j)`}
                        size="small"
                        severity="warning"
                        outlined
                        className="flex-1"
                        onClick={() => { for (const d of eligibleDates) onToggleConge(d, 1); }}
                      />
                      <Button
                        label={`Congé 0.5j (${eligibleDates.length}j)`}
                        size="small"
                        severity="warning"
                        outlined
                        className="flex-1"
                        onClick={() => { for (const d of eligibleDates) onToggleConge(d, 0.5); }}
                      />
                    </div>
                  </>
                )}
                {formationOnlyDates.length > 0 && (
                  <Button
                    label={`Retirer formation (${formationOnlyDates.length}j)`}
                    size="small"
                    severity="danger"
                    className="w-full"
                    onClick={() => { for (const d of formationOnlyDates) onToggleFormation(d); }}
                  />
                )}
                {congeOnlyDates.length > 0 && (
                  <Button
                    label={`Retirer congé (${congeOnlyDates.length}j)`}
                    size="small"
                    severity="warning"
                    className="w-full"
                    onClick={() => { for (const d of congeOnlyDates) onToggleConge(d); }}
                  />
                )}
              </div>
            );
          })()}

          {dates.some((d) => allEntries.some((e) => e.date.startsWith(d))) && (
            <Button
              label="Supprimer toutes les entrées des jours sélectionnés"
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              className="w-full mb-3"
              onClick={handleDeleteAll}
            />
          )}
        </>
      )}

      {/* Form */}
      {(isMulti || (!isBlocked && (canAdd || editingEntry)) || ((isHalfConge || isHalfFormation) && canAdd)) && (
        <>
          <Divider />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-color-secondary">
                {editingEntry ? "Modifier l'entrée" : isMulti ? "Ajouter sur tous les jours" : "Nouvelle entrée"}
              </h4>
              {editingEntry && (
                <Button
                  label="Annuler"
                  size="small"
                  text
                  severity="info"
                  onClick={resetForm}
                  type="button"
                />
              )}
            </div>

            {/* Client */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-color-secondary">Client</label>
              <AutoComplete
                value={client}
                suggestions={filteredClients}
                completeMethod={searchClients}
                onChange={(e) => setClient(e.value)}
                placeholder="Unhaj, Beaumanoir, TI..."
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            {/* Ticket */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-color-secondary">
                Ticket <span className="opacity-50 font-normal">(optionnel)</span>
              </label>
              <InputText
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                placeholder="CS0021003, 5164..."
                className="w-full"
              />
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-color-secondary">Commentaire</label>
              <InputText
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Description de la tâche..."
                className="w-full"
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-color-secondary">
                Temps
                {!isMulti && !editingEntry && (
                  <span className="font-normal opacity-50 ml-1">(restant : {remainingTime}j)</span>
                )}
              </label>
              {timeOptions.length > 0 && (
                <SelectButton
                  value={time}
                  onChange={(e) => setTime(e.value)}
                  options={timeOptions}
                  optionLabel="label"
                  optionValue="value"
                />
              )}
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-color-secondary">
                Type <span className="opacity-50 font-normal">(optionnel)</span>
              </label>
              <SelectButton
                value={type}
                onChange={(e) => setType(e.value)}
                options={typeOptions}
                optionLabel="label"
                optionValue="value"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              label={
                saving
                  ? "Enregistrement..."
                  : editingEntry
                  ? "Mettre à jour"
                  : isMulti
                  ? `Ajouter sur ${dates.length} jours`
                  : "Ajouter"
              }
              icon="pi pi-check"
              loading={saving}
              disabled={saving || !client || !comment}
              className="w-full"
            />
          </form>
        </>
      )}

      {/* Full day message (single mode) */}
      {!isMulti && !isBlocked && !canAdd && !editingEntry && currentEntries.length > 0 && (
        <div className="mt-4 text-center">
          <Tag value="Journée complète (1j)" severity="secondary" />
        </div>
      )}
    </Dialog>
  );
}
