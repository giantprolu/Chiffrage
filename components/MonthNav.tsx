"use client";

import { Button } from "primereact/button";

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
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const next = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const goToToday = () => {
    onChange(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <Button
        icon="pi pi-chevron-left"
        onClick={prev}
        rounded
        text
        severity="secondary"
        aria-label="Mois précédent"
        className="shrink-0"
      />
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold tracking-tight">
          {MONTH_NAMES[month - 1]}{" "}
          <span className="text-color-secondary font-normal">{year}</span>
        </h2>
        {!isCurrentMonth && (
          <Button
            label="Aujourd'hui"
            icon="pi pi-home"
            size="small"
            text
            severity="info"
            onClick={goToToday}
            className="hidden sm:inline-flex"
          />
        )}
      </div>
      <Button
        icon="pi pi-chevron-right"
        onClick={next}
        rounded
        text
        severity="secondary"
        aria-label="Mois suivant"
        className="shrink-0"
      />
    </div>
  );
}
