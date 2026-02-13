"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { AutoComplete, AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { ProgressBar } from "primereact/progressbar";
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

  const progressValue = isMulti ? 0 : Math.min((usedTime + congeTime + formationTime) * 100, 100);
  const progressColor = progressValue >= 100 ? "#10b981" : progressValue > 0 ? "#f59e0b" : "#e2e8f0";

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500 text-white shrink-0">
            <i className={isMulti ? "pi pi-calendar-plus" : "pi pi-calendar"} />
          </div>
          <div>
            <div className="text-base font-bold capitalize">{header}</div>
            {!isMulti && (
              <div className="text-xs text-color-secondary font-normal mt-0.5">
                {usedTime + congeTime + formationTime}j / 1j rempli
              </div>
            )}
          </div>
        </div>
      }
      visible={true}
      style={{ width: "520px", maxHeight: "90vh" }}
      onHide={onClose}
      modal
      closable
      className="overflow-y-auto"
    >
      {/* Progress bar (single mode) */}
      {!isMulti && (
        <div className="mb-4">
          <ProgressBar
            value={progressValue}
            showValue={false}
            style={{ height: "6px", borderRadius: "3px" }}
            color={progressColor}
          />
        </div>
      )}
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-color-secondary mb-3 flex items-center gap-2">
            <i className="pi pi-list text-xs" />
            Entrées existantes ({currentEntries.length})
          </h4>
          <div className="space-y-2 mb-3">
            {currentEntries.map((entry) => (
              <div
                key={entry.id}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  editingEntry?.id === entry.id
                    ? "border-blue-400 bg-blue-50/80 dark:bg-blue-900/20 shadow-sm"
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold truncate">
                      {entry.client}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      entry.time >= 1
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    }`}>
                      {entry.time}j
                    </span>
                  </div>
                  <p className="text-xs text-color-secondary truncate">
                    {entry.comment}
                    {entry.ticket && <span className="opacity-50"> · {entry.ticket}</span>}
                  </p>
                  {entry.type && (
                    <Tag value={entry.type} severity="secondary" style={{ fontSize: "10px", marginTop: "4px" }} />
                  )}
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    text
                    rounded
                    severity="info"
                    onClick={() => startEditing(entry)}
                    tooltip="Modifier"
                    tooltipOptions={{ position: "top" }}
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    text
                    rounded
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-color-secondary mb-3 flex items-center gap-2">
            <i className="pi pi-list text-xs" />
            Résumé des jours sélectionnés
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3">
            {dates.map((d) => {
              const de = allEntries.filter((e) => e.date.startsWith(d));
              const total = de.reduce((sum, e) => sum + e.time, 0);
              const isFmt = formationDays.some((f) => f.date.startsWith(d));
              const cng = congeDays.find((c) => c.date.startsWith(d));
              return (
                <div key={d} className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                  <span className="font-medium capitalize">{formatDate(d)}</span>
                  <div className="flex items-center gap-1.5">
                    {isFmt && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Formation</span>
                    )}
                    {cng && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                        Congé{cng.time < 1 ? ` ${cng.time}j` : ""}
                      </span>
                    )}
                    {!isFmt && !cng && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        total >= 1
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : total > 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          : "bg-gray-100 text-gray-500 dark:bg-slate-700/50 dark:text-slate-400"
                      }`}>
                        {total}j
                      </span>
                    )}
                  </div>
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-color-secondary flex items-center gap-2">
                <i className={editingEntry ? "pi pi-pencil" : "pi pi-plus-circle"} style={{ fontSize: "12px" }} />
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-color-secondary">
                <i className="pi pi-building mr-1" style={{ fontSize: "11px" }} />
                Client
              </label>
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-color-secondary">
                <i className="pi pi-ticket mr-1" style={{ fontSize: "11px" }} />
                Ticket <span className="opacity-40 font-normal">(optionnel)</span>
              </label>
              <InputText
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                placeholder="CS0021003, 5164..."
                className="w-full"
              />
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-color-secondary">
                <i className="pi pi-align-left mr-1" style={{ fontSize: "11px" }} />
                Commentaire
              </label>
              <InputTextarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Description de la tâche..."
                className="w-full"
                rows={2}
                autoResize
              />
            </div>

            {/* Time + Type row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-color-secondary">
                  <i className="pi pi-clock mr-1" style={{ fontSize: "11px" }} />
                  Temps
                  {!isMulti && !editingEntry && (
                    <span className="font-normal opacity-40 ml-1">({remainingTime}j dispo)</span>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-color-secondary">
                  <i className="pi pi-tag mr-1" style={{ fontSize: "11px" }} />
                  Type <span className="opacity-40 font-normal">(opt.)</span>
                </label>
                <SelectButton
                  value={type}
                  onChange={(e) => setType(e.value)}
                  options={typeOptions}
                  optionLabel="label"
                  optionValue="value"
                />
              </div>
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
              icon={editingEntry ? "pi pi-check" : "pi pi-plus"}
              loading={saving}
              disabled={saving || !client || !comment}
              className="w-full"
              severity={editingEntry ? "info" : undefined}
            />
          </form>
        </>
      )}

      {/* Full day message (single mode) */}
      {!isMulti && !isBlocked && !canAdd && !editingEntry && currentEntries.length > 0 && (
        <div className="mt-4 text-center py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
          <i className="pi pi-check-circle text-emerald-500 mr-2" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Journée complète</span>
        </div>
      )}
    </Dialog>
  );
}
