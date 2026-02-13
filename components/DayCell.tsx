"use client";

import { Tooltip } from "primereact/tooltip";
import type { Entry, FormationDay, CongeDay } from "@/lib/types";

export type { Entry, FormationDay, CongeDay };

type DayStatus = "normal" | "weekend" | "formation" | "conge" | "incomplete" | "empty" | "full";

interface DayCellProps {
  day: number | null;
  entries: Entry[];
  isWeekend: boolean;
  formationDay: FormationDay | null;
  congeDay: CongeDay | null;
  isToday: boolean;
  isSelected: boolean;
  isCopyMode: boolean;
  onClick: () => void;
}

export default function DayCell({
  day,
  entries,
  isWeekend,
  formationDay,
  congeDay,
  isToday,
  isSelected,
  isCopyMode,
  onClick,
}: DayCellProps) {
  if (day === null) {
    return <div className="day-cell empty" />;
  }

  const totalTime = entries.reduce((sum, e) => sum + e.time, 0);
  const congeTime = congeDay?.time ?? 0;
  const formationTime = formationDay?.time ?? 0;
  const isFormation = !!formationDay;
  const isConge = !!congeDay;
  const isFullConge = isConge && congeTime >= 1;
  const isHalfConge = isConge && congeTime < 1;
  const isFullFormation = isFormation && formationTime >= 1;
  const isHalfFormation = isFormation && formationTime < 1;
  const isBlocked = isWeekend || isFullFormation || isFullConge;

  let status: DayStatus = "normal";
  if (isWeekend) status = "weekend";
  else if (isFullFormation) status = "formation";
  else if (isFullConge) status = "conge";
  else if ((isHalfFormation || isHalfConge) && totalTime + formationTime + congeTime >= 1) status = "full";
  else if (isHalfFormation) status = "formation";
  else if (isHalfConge) status = "conge";
  else if (totalTime >= 1) status = "full";
  else if (totalTime > 0) status = "incomplete";
  else status = "empty";

  const interactive = !isWeekend;

  const accentClass: Record<string, string> = {
    formation: "accent-red",
    conge: "accent-orange",
    full: "accent-green",
    incomplete: "accent-amber",
  };

  const cellClasses = [
    "day-cell",
    isWeekend ? "weekend" : "",
    accentClass[status] || "",
    isSelected ? "selected" : "",
    isToday && !isSelected ? "today" : "",
  ].filter(Boolean).join(" ");

  const cellId = `day-cell-${day}`;

  return (
    <>
      {entries.length > 0 && (
        <Tooltip target={`#${cellId}`} position="top" mouseTrack mouseTrackTop={10}>
          <div style={{ fontSize: 12, maxWidth: 220 }}>
            {entries.map(e => (
              <div key={e.id} style={{ marginBottom: 4 }}>
                <strong>{e.client}</strong> ({e.time}j)
                <br />
                <span style={{ opacity: 0.7 }}>{e.comment}</span>
              </div>
            ))}
          </div>
        </Tooltip>
      )}
      <div
        id={cellId}
        onClick={interactive ? onClick : undefined}
        className={cellClasses}
        style={!interactive ? { cursor: "default" } : undefined}
      >
        <div className="day-header">
          <span className={`day-number ${isToday ? "today-badge" : ""}`}>
            {day}
          </span>
          {!isBlocked && totalTime > 0 && (
            <span className={`day-time ${status === "full" ? "full" : "partial"}`}>
              {totalTime}j
            </span>
          )}
        </div>

        {isFormation && (
          <span className="day-badge formation">
            <i className="pi pi-book" style={{ fontSize: 8, marginRight: 2 }} />
            {formationDay.label}{formationTime < 1 ? ` ${formationTime}j` : ""}
          </span>
        )}

        {isConge && (
          <span className="day-badge conge">
            <i className="pi pi-calendar-minus" style={{ fontSize: 8, marginRight: 2 }} />
            {congeDay.label}{congeTime < 1 ? ` ${congeTime}j` : ""}
          </span>
        )}

        {(!isBlocked || isHalfConge || isHalfFormation) && entries.length > 0 && (
          <div className="day-entries">
            {entries.slice(0, 2).map((e) => (
              <div key={e.id} className="day-entry-line">
                <span className="client">{e.client}</span>
                <span className="time"> {e.time}j</span>
              </div>
            ))}
            {entries.length > 2 && (
              <span className="day-more">+{entries.length - 2}</span>
            )}
          </div>
        )}

        {status === "empty" && (
          <div className="day-empty-icon">
            <i className="pi pi-plus" />
          </div>
        )}

        {isCopyMode && !isBlocked && totalTime < 1 && (
          <div className="day-paste">
            <i className="pi pi-clipboard" style={{ fontSize: 8, marginRight: 2 }} />
            Coller
          </div>
        )}
      </div>
    </>
  );
}
