"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; success: boolean } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] || null;
    if (f) {
      const ext = f.name.toLowerCase();
      if (ext.endsWith(".xlsx") || ext.endsWith(".xls") || ext.endsWith(".csv")) {
        setFile(f);
        setResult(null);
      } else {
        setResult({ message: "Format non supporté. Utilisez .xlsx, .xls ou .csv", success: false });
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (replaceExisting) {
        formData.append("replace", "true");
      }

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ message: data.error || "Erreur lors de l'import", success: false });
      } else {
        setResult({ message: data.message, success: true });
      }
    } catch {
      setResult({ message: "Erreur de connexion au serveur", success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Importer un emploi du temps
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Importez vos données depuis un fichier Excel (.xlsx) ou CSV.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 space-y-5">
        {/* Format info */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-3">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Format attendu</p>

          {/* Colonnes */}
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5">Colonnes requises :</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-blue-600 dark:text-blue-400">
                <thead>
                  <tr className="border-b border-blue-200 dark:border-blue-800/50">
                    <th className="text-left py-1 pr-3 font-semibold">Colonne</th>
                    <th className="text-left py-1 pr-3 font-semibold">Obligatoire</th>
                    <th className="text-left py-1 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 dark:divide-blue-900/50">
                  <tr>
                    <td className="py-1 pr-3 font-mono font-medium">Date</td>
                    <td className="py-1 pr-3">Oui</td>
                    <td className="py-1">Date de l&apos;entrée (JJ/MM/AAAA ou date Excel)</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 font-mono font-medium">Client</td>
                    <td className="py-1 pr-3">Oui</td>
                    <td className="py-1">Nom du client (ex : Magellan, Interne…)</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 font-mono font-medium">Ticket</td>
                    <td className="py-1 pr-3">Non</td>
                    <td className="py-1">Numéro de ticket ou référence</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 font-mono font-medium">Commentaires</td>
                    <td className="py-1 pr-3">Oui</td>
                    <td className="py-1">Description du travail effectué</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 font-mono font-medium">Temps</td>
                    <td className="py-1 pr-3">Oui</td>
                    <td className="py-1">Temps passé en fraction de journée (ex : 0.5 = demi-journée, 1 = journée)</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 font-mono font-medium">Type</td>
                    <td className="py-1 pr-3">Non</td>
                    <td className="py-1">Type d&apos;activité (ex : Dev, Réunion, Support…)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Format spécifique */}
          <div className="space-y-1.5 text-xs text-blue-600 dark:text-blue-400">
            <p>
              <strong>Excel (.xlsx) :</strong> Un onglet par mois nommé avec le nom du mois (Septembre, Octobre, Novembre…). Chaque onglet contient les colonnes ci-dessus.
            </p>
            <p>
              <strong>CSV (.csv) :</strong> Un seul fichier avec toutes les entrées. Les dates doivent être au format <span className="font-mono">JJ/MM/AAAA</span> ou <span className="font-mono">AAAA-MM-JJ</span>. Séparateur : virgule.
            </p>
          </div>

          {/* Exemple */}
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Exemple :</p>
            <div className="overflow-x-auto rounded-lg bg-blue-100/60 dark:bg-blue-900/30 p-2">
              <table className="text-[11px] font-mono text-blue-700 dark:text-blue-300 whitespace-nowrap">
                <thead>
                  <tr>
                    {["Date", "Client", "Ticket", "Commentaires", "Temps", "Type"].map((h) => (
                      <th key={h} className="text-left pr-4 pb-1 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pr-4">12/02/2026</td>
                    <td className="pr-4">Magellan</td>
                    <td className="pr-4">TK-123</td>
                    <td className="pr-4">Développement feature X</td>
                    <td className="pr-4">0.5</td>
                    <td className="pr-4">Dev</td>
                  </tr>
                  <tr>
                    <td className="pr-4">12/02/2026</td>
                    <td className="pr-4">Interne</td>
                    <td className="pr-4"></td>
                    <td className="pr-4">Réunion d&apos;équipe</td>
                    <td className="pr-4">0.25</td>
                    <td className="pr-4">Réunion</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
              : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500"
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <svg className="mx-auto h-10 w-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {file ? (
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{file.name}</span>
              ) : (
                <>Glissez un fichier ici ou <span className="text-blue-500 font-medium">parcourez</span></>
              )}
            </p>
            <p className="text-xs text-zinc-400">.xlsx, .xls ou .csv</p>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`p-3 rounded-xl border text-sm ${
              result.success
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400"
            }`}
          >
            {result.message}
          </div>
        )}

        {/* Replace option */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={replaceExisting}
            onChange={(e) => setReplaceExisting(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-500 focus:ring-blue-400"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Remplacer toutes les données existantes
          </span>
        </label>
        {replaceExisting && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-600 dark:text-amber-400">
            Toutes vos entrées actuelles seront supprimées et remplacées par le contenu du fichier.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-all"
          >
            {loading ? "Import en cours…" : "Importer"}
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium text-sm transition-all"
          >
            {result?.success ? "Continuer" : "Passer"}
          </button>
        </div>
      </div>
    </div>
  );
}
