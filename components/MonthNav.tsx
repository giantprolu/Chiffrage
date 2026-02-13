"use client";

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
        <button className="btn-icon btn-ghost sm" onClick={prev} aria-label="Mois précédent">
          <i className="pi pi-chevron-left" style={{ fontSize: 12 }} />
        </button>
        <button className="btn-icon btn-ghost sm" onClick={next} aria-label="Mois suivant">
          <i className="pi pi-chevron-right" style={{ fontSize: 12 }} />
        </button>
      </div>
      {!isCurrentMonth && (
        <button className="btn btn-ghost btn-sm" onClick={goToToday}>
          Aujourd&apos;hui
        </button>
      )}
    </div>
  );
}
