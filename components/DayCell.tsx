"use client";

import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";

export interface Entry {
  id: number;
  date: string;
  client: string;
  ticket: string | null;
  comment: string;
  time: number;
  type: string | null;
}

export interface FormationDay {
  id: number;
  date: string;
  label: string;
  time: number;
}

export interface CongeDay {
  id: number;
  date: string;
  label: string;
  time: number;
}

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
    return <div style={{ height: "120px" }} />;
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

  const bgMap: Record<DayStatus, string> = {
    weekend: "bg-zinc-50 dark:bg-zinc-800/40",
    formation: "bg-red-50/80 dark:bg-red-950/30",
    conge: "bg-orange-50/80 dark:bg-orange-950/30",
    full: "bg-emerald-50/60 dark:bg-emerald-950/20",
    incomplete: "bg-amber-50/60 dark:bg-amber-950/20",
    empty: "bg-white dark:bg-zinc-900",
    normal: "bg-white dark:bg-zinc-900",
  };

  const borderMap: Record<DayStatus, string> = {
    weekend: "border-zinc-100 dark:border-zinc-800",
    formation: "border-red-200 dark:border-red-800/50",
    conge: "border-orange-200 dark:border-orange-800/50",
    full: "border-emerald-200 dark:border-emerald-800/40",
    incomplete: "border-amber-200 dark:border-amber-800/40",
    empty: "border-zinc-200 dark:border-zinc-700",
    normal: "border-zinc-200 dark:border-zinc-700",
  };

  const interactive = !isWeekend;

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`${bgMap[status]} ${borderMap[status]} border rounded-xl p-2 flex flex-col transition-all duration-150 select-none ${
        interactive ? "cursor-pointer hover:shadow-md hover:scale-[1.01]" : "cursor-default opacity-60"
      } ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : isToday ? "ring-2 ring-blue-400/60" : ""}`}
      style={{ height: "120px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        {isToday ? (
          <Badge value={String(day)} severity="info" />
        ) : (
          <span className={`text-xs font-semibold leading-none ${
            isWeekend ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
          }`}>
            {day}
          </span>
        )}

        {status === "full" && (
          <Tag value={`${totalTime}j`} severity="success" rounded style={{ fontSize: "10px", padding: "2px 6px" }} />
        )}
        {status === "incomplete" && (
          <Tag value={`${totalTime}j`} severity="warning" rounded style={{ fontSize: "10px", padding: "2px 6px" }} />
        )}
      </div>

      {/* Formation badge */}
      {isFormation && (
        <Tag
          value={`${formationDay.label}${formationTime < 1 ? ` (${formationTime}j)` : ""}`}
          severity="danger"
          style={{ fontSize: "10px", padding: "2px 6px", marginBottom: "4px" }}
        />
      )}

      {/* Congé badge */}
      {isConge && (
        <Tag
          value={`${congeDay.label}${congeTime < 1 ? ` (${congeTime}j)` : ""}`}
          severity="warning"
          style={{ fontSize: "10px", padding: "2px 6px", marginBottom: "4px" }}
        />
      )}

      {/* Entry list */}
      {(!isBlocked || isHalfConge || isHalfFormation) && (
        <div className="flex-1 overflow-hidden space-y-0.5">
          {entries.slice(0, 3).map((e) => (
            <Tag
              key={e.id}
              value={`${e.client} — ${e.time}j`}
              severity="info"
              style={{ fontSize: "10px", padding: "2px 6px", display: "block", textAlign: "left" }}
            />
          ))}
          {entries.length > 3 && (
            <span className="text-[9px] text-zinc-400 pl-1">
              +{entries.length - 3} autre{entries.length - 3 > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {status === "empty" && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-zinc-200 dark:text-zinc-700 text-lg">—</span>
        </div>
      )}

      {/* Copy mode indicator */}
      {isCopyMode && !isBlocked && totalTime < 1 && (
        <div className="mt-auto">
          <Tag
            value="Cliquer pour coller"
            severity="info"
            style={{ fontSize: "9px", padding: "2px 6px" }}
          />
        </div>
      )}
    </div>
  );
}
