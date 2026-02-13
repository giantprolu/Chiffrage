"use client";

import { Button } from "primereact/button";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface MonthNavProps {
  month: number;
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
    <div className="month-nav">
      <h2 className="month-title">
        {MONTH_NAMES[month - 1]}{" "}
        <span className="month-year">{year}</span>
      </h2>
      <div className="month-arrows">
        <Button icon="pi pi-chevron-left" onClick={prev} text size="small" severity="secondary" rounded aria-label="Mois précédent" />
        <Button icon="pi pi-chevron-right" onClick={next} text size="small" severity="secondary" rounded aria-label="Mois suivant" />
      </div>
      {!isCurrentMonth && (
        <Button label="Aujourd'hui" size="small" text severity="info" onClick={goToToday} />
      )}
    </div>
  );
}
