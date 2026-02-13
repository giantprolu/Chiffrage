"use client";

import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { ProgressBar } from "primereact/progressbar";
import { Tooltip } from "primereact/tooltip";

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
    return <div className="min-h-[110px] md:min-h-[120px]" />;
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

  const totalFilled = totalTime + congeTime + formationTime;
  const progressPercent = Math.min(totalFilled * 100, 100);

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

  // Color theme mapping
  const statusStyles: Record<DayStatus, { bg: string; border: string; accent: string }> = {
    weekend: {
      bg: "bg-gray-50 dark:bg-slate-800/30",
      border: "border-gray-100 dark:border-slate-700/50",
      accent: "",
    },
    formation: {
      bg: "bg-red-50/80 dark:bg-red-950/20",
      border: "border-red-200/80 dark:border-red-800/40",
      accent: "border-t-red-400",
    },
    conge: {
      bg: "bg-orange-50/80 dark:bg-orange-950/20",
      border: "border-orange-200/80 dark:border-orange-800/40",
      accent: "border-t-orange-400",
    },
    full: {
      bg: "bg-emerald-50/60 dark:bg-emerald-950/15",
      border: "border-emerald-200/80 dark:border-emerald-800/40",
      accent: "border-t-emerald-400",
    },
    incomplete: {
      bg: "bg-amber-50/60 dark:bg-amber-950/15",
      border: "border-amber-200/80 dark:border-amber-800/40",
      accent: "border-t-amber-400",
    },
    empty: {
      bg: "bg-white dark:bg-slate-900",
      border: "border-gray-200 dark:border-slate-700",
      accent: "",
    },
    normal: {
      bg: "bg-white dark:bg-slate-900",
      border: "border-gray-200 dark:border-slate-700",
      accent: "",
    },
  };

  const style = statusStyles[status];

  const cellId = `day-cell-${day}`;
  const tooltipContent = entries.map(e => `${e.client}: ${e.time}j — ${e.comment}`).join("\n");

  return (
    <>
      {entries.length > 0 && (
        <Tooltip target={`#${cellId}`} position="top" mouseTrack mouseTrackTop={10}>
          <div className="text-xs space-y-0.5 max-w-[200px]">
            {entries.map(e => (
              <div key={e.id}>
                <span className="font-semibold">{e.client}</span> ({e.time}j)
                <br />
                <span className="opacity-70">{e.comment}</span>
              </div>
            ))}
          </div>
        </Tooltip>
      )}
      <div
        id={cellId}
        onClick={interactive ? onClick : undefined}
        className={[
          style.bg,
          style.border,
          style.accent ? `border-t-2 ${style.accent}` : "",
          "border rounded-xl p-2 flex flex-col transition-all duration-150 select-none",
          "min-h-[110px] md:min-h-[120px]",
          interactive ? "cursor-pointer hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5" : "cursor-default opacity-50",
          isSelected ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 shadow-lg shadow-blue-500/10" : "",
          isToday && !isSelected ? "ring-2 ring-blue-400/50 ring-offset-1 dark:ring-offset-slate-900" : "",
        ].filter(Boolean).join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          {isToday ? (
            <Badge value={String(day)} severity="info" />
          ) : (
            <span className={`text-xs font-bold leading-none ${
              isWeekend ? "text-gray-300 dark:text-slate-600" : "text-gray-500 dark:text-slate-400"
            }`}>
              {day}
            </span>
          )}

          {/* Time badge only when not blocked */}
          {!isBlocked && totalTime > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              status === "full"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
            }`}>
              {totalTime}j
            </span>
          )}
        </div>

        {/* Progress bar (non-weekend, non-blocked) */}
        {!isWeekend && !isBlocked && totalTime > 0 && (
          <div className="mb-1.5">
            <ProgressBar
              value={progressPercent}
              showValue={false}
              style={{ height: "3px", borderRadius: "2px" }}
              color={status === "full" ? "#10b981" : "#f59e0b"}
            />
          </div>
        )}

        {/* Formation badge */}
        {isFormation && (
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
              <i className="pi pi-book" style={{ fontSize: "8px" }} />
              {formationDay.label}{formationTime < 1 ? ` ${formationTime}j` : ""}
            </span>
          </div>
        )}

        {/* Congé badge */}
        {isConge && (
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              <i className="pi pi-calendar-minus" style={{ fontSize: "8px" }} />
              {congeDay.label}{congeTime < 1 ? ` ${congeTime}j` : ""}
            </span>
          </div>
        )}

        {/* Entry list */}
        {(!isBlocked || isHalfConge || isHalfFormation) && entries.length > 0 && (
          <div className="flex-1 overflow-hidden space-y-0.5">
            {entries.slice(0, 2).map((e) => (
              <div
                key={e.id}
                className="text-[10px] leading-tight px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 truncate font-medium"
              >
                {e.client} — {e.time}j
              </div>
            ))}
            {entries.length > 2 && (
              <span className="text-[9px] text-gray-400 dark:text-slate-500 pl-1 font-medium">
                +{entries.length - 2} autre{entries.length - 2 > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Empty state */}
        {status === "empty" && (
          <div className="flex-1 flex items-center justify-center">
            <i className="pi pi-plus text-gray-200 dark:text-slate-700 text-sm" />
          </div>
        )}

        {/* Copy mode indicator */}
        {isCopyMode && !isBlocked && totalTime < 1 && (
          <div className="mt-auto">
            <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 animate-pulse">
              <i className="pi pi-clipboard" style={{ fontSize: "8px" }} />
              Coller
            </span>
          </div>
        )}
      </div>
    </>
  );
}
