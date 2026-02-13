"use client";

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
    return <div className="min-h-[100px] md:min-h-[110px]" />;
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

  // Left accent color
  const accentColor: Record<DayStatus, string> = {
    weekend: "",
    formation: "border-l-red-400",
    conge: "border-l-orange-400",
    full: "border-l-emerald-400",
    incomplete: "border-l-amber-400",
    empty: "",
    normal: "",
  };

  const bgColor: Record<DayStatus, string> = {
    weekend: "bg-gray-50/50 dark:bg-slate-800/20",
    formation: "bg-white dark:bg-slate-900/60",
    conge: "bg-white dark:bg-slate-900/60",
    full: "bg-white dark:bg-slate-900/60",
    incomplete: "bg-white dark:bg-slate-900/60",
    empty: "bg-white dark:bg-slate-900/60",
    normal: "bg-white dark:bg-slate-900/60",
  };

  const accent = accentColor[status];
  const cellId = `day-cell-${day}`;

  return (
    <>
      {entries.length > 0 && (
        <Tooltip target={`#${cellId}`} position="top" mouseTrack mouseTrackTop={10}>
          <div className="text-xs space-y-1 max-w-[220px]">
            {entries.map(e => (
              <div key={e.id}>
                <strong>{e.client}</strong> ({e.time}j)
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
          bgColor[status],
          "border border-gray-100 dark:border-[#1e2d44] rounded-lg p-1.5 flex flex-col transition-all duration-100 select-none",
          accent ? `border-l-[3px] ${accent}` : "",
          "min-h-[100px] md:min-h-[110px]",
          interactive ? "cursor-pointer hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20" : "cursor-default opacity-40",
          isSelected ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-[#0b1120] shadow-md" : "",
          isToday && !isSelected ? "ring-1 ring-blue-400/60 dark:ring-blue-500/40" : "",
        ].filter(Boolean).join(" ")}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-xs font-semibold leading-none ${
            isToday
              ? "text-white bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
              : isWeekend
              ? "text-gray-300 dark:text-slate-600"
              : "text-gray-500 dark:text-slate-400"
          }`}>
            {day}
          </span>

          {!isBlocked && totalTime > 0 && (
            <span className={`text-[10px] font-bold ${
              status === "full" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            }`}>
              {totalTime}j
            </span>
          )}
        </div>

        {/* Formation badge */}
        {isFormation && (
          <span className="text-[9px] font-semibold text-red-600 dark:text-red-400 truncate leading-tight">
            <i className="pi pi-book mr-0.5" style={{ fontSize: "8px" }} />
            {formationDay.label}{formationTime < 1 ? ` ${formationTime}j` : ""}
          </span>
        )}

        {/* Congé badge */}
        {isConge && (
          <span className="text-[9px] font-semibold text-orange-600 dark:text-orange-400 truncate leading-tight">
            <i className="pi pi-calendar-minus mr-0.5" style={{ fontSize: "8px" }} />
            {congeDay.label}{congeTime < 1 ? ` ${congeTime}j` : ""}
          </span>
        )}

        {/* Entry list */}
        {(!isBlocked || isHalfConge || isHalfFormation) && entries.length > 0 && (
          <div className="flex-1 mt-1 space-y-0.5 overflow-hidden">
            {entries.slice(0, 2).map((e) => (
              <div key={e.id} className="text-[10px] leading-tight truncate text-gray-600 dark:text-slate-300">
                <span className="font-medium">{e.client}</span>
                <span className="text-gray-400 dark:text-slate-500"> {e.time}j</span>
              </div>
            ))}
            {entries.length > 2 && (
              <span className="text-[9px] text-gray-400 dark:text-slate-500">
                +{entries.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Empty state */}
        {status === "empty" && (
          <div className="flex-1 flex items-center justify-center">
            <i className="pi pi-plus text-gray-200 dark:text-slate-700 text-xs" />
          </div>
        )}

        {/* Copy mode indicator */}
        {isCopyMode && !isBlocked && totalTime < 1 && (
          <div className="mt-auto">
            <span className="text-[9px] font-medium text-blue-500 dark:text-blue-400 animate-pulse">
              <i className="pi pi-clipboard mr-0.5" style={{ fontSize: "8px" }} />
              Coller
            </span>
          </div>
        )}
      </div>
    </>
  );
}
