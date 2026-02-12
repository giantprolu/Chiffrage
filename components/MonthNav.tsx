"use client";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface MonthNavProps {
  month: number; // 1-12
  year: number;
  onChange: (month: number, year: number) => void;
}

export default function MonthNav({ month, year, onChange }: MonthNavProps) {
  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const next = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <button
        onClick={prev}
        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
      >
        &larr;
      </button>
      <h2 className="text-xl font-semibold">
        {MONTH_NAMES[month - 1]} {year}
      </h2>
      <button
        onClick={next}
        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
      >
        &rarr;
      </button>
    </div>
  );
}
