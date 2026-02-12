import StatsCharts from "@/components/StatsCharts";

export default function StatsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Statistiques</h1>
      <StatsCharts />
    </div>
  );
}
