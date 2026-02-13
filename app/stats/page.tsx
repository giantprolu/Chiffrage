import StatsCharts from "@/components/StatsCharts";

export default function StatsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-icon">
          <i className="pi pi-chart-bar" />
        </div>
        <div>
          <h1>Statistiques</h1>
          <p className="page-subtitle">Visualisez la répartition de votre activité</p>
        </div>
      </div>
      <StatsCharts />
    </div>
  );
}
