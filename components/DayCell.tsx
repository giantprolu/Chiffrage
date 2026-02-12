"use client";

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
    return <div className="h-[120px]" />;
  }

  const totalTime = entries.reduce((sum, e) => sum + e.time, 0);
  const congeTime = congeDay?.time ?? 0;
  const isFormation = !!formationDay;
  const isConge = !!congeDay;
  const isFullConge = isConge && congeTime >= 1;
  const isHalfConge = isConge && congeTime < 1;
  const isBlocked = isWeekend || isFormation || isFullConge;

  // Determine status
  let status: DayStatus = "normal";
  if (isWeekend) status = "weekend";
  else if (isFormation) status = "formation";
  else if (isFullConge) status = "conge";
  else if (isHalfConge && totalTime + congeTime >= 1) status = "full";
  else if (isHalfConge) status = "conge";
  else if (totalTime >= 1) status = "full";
  else if (totalTime > 0) status = "incomplete";
  else status = "empty";

  // Background by status
  const bgMap: Record<DayStatus, string> = {
    weekend: "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800",
    formation: "bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800/50",
    conge: "bg-orange-50/80 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50",
    full: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40",
    incomplete: "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",
    empty: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
    normal: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
  };

  const bg = bgMap[status];

  // Ring for selection / today
  let ringClass = "";
  if (isSelected) ringClass = "ring-2 ring-blue-500 ring-offset-1";
  else if (isToday) ringClass = "ring-2 ring-blue-400/60";

  // Cursor
  const interactive = !isWeekend;
  const cursorClass = interactive ? "cursor-pointer" : "cursor-default";
  const hoverClass = interactive ? "hover:shadow-md hover:scale-[1.01]" : "opacity-60";

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`${bg} ${ringClass} ${cursorClass} ${hoverClass} h-[120px] border rounded-xl p-2 flex flex-col transition-all duration-150 select-none`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-xs font-semibold leading-none ${
            isToday
              ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              : isWeekend
              ? "text-zinc-300 dark:text-zinc-600"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {day}
        </span>

        {/* Status badge */}
        {status === "full" && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full">
            {totalTime}j
          </span>
        )}
        {status === "incomplete" && (
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full">
            {totalTime}j
          </span>
        )}
      </div>

      {/* Formation badge */}
      {isFormation && (
        <div className="flex items-center gap-1 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-[10px] font-semibold text-red-700 dark:text-red-300 truncate">
            {formationDay.label}
          </span>
        </div>
      )}

      {/* Congé badge */}
      {isConge && (
        <div className="flex items-center gap-1 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
          <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-300 truncate">
            {congeDay.label}{congeTime < 1 ? ` (${congeTime}j)` : ""}
          </span>
        </div>
      )}

      {/* Entry list */}
      {(!isBlocked || isHalfConge) && (
        <div className="flex-1 overflow-hidden space-y-0.5">
          {entries.slice(0, 3).map((e) => (
            <div
              key={e.id}
              className="text-[10px] truncate px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
            >
              {e.client} — {e.time}j
            </div>
          ))}
          {entries.length > 3 && (
            <div className="text-[9px] text-zinc-400 pl-1">
              +{entries.length - 3} autre{entries.length - 3 > 1 ? "s" : ""}
            </div>
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
          <span className="text-[9px] font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
            Cliquer pour coller
          </span>
        </div>
      )}
    </div>
  );
}
