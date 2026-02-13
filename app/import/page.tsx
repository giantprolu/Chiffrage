"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { importFile } from "@/lib/services";

const COLUMN_DATA = [
  { col: "Date", required: "Oui", description: "Date de l'entrée (JJ/MM/AAAA ou date Excel)" },
  { col: "Client", required: "Oui", description: "Nom du client (ex : Magellan, Interne…)" },
  { col: "Ticket", required: "Non", description: "Numéro de ticket ou référence" },
  { col: "Commentaires", required: "Oui", description: "Description du travail effectué" },
  { col: "Temps", required: "Oui", description: "Temps passé en fraction de journée (0.5 = demi-journée)" },
  { col: "Type", required: "Non", description: "Type d'activité (ex : Dev, Réunion, Support…)" },
];

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; success: boolean } | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (f: File | null) => {
    if (f) {
      setFile(f);
      setResult(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const data = await importFile(file, replaceExisting);
      setResult({ message: data.message, success: true });
    } catch (err) {
      setResult({ message: err instanceof Error ? err.message : "Erreur de connexion au serveur", success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-page animate-fade-in" style={{ paddingTop: 32 }}>
      <div className="page-header">
        <div className="page-header-icon import">
          <i className="pi pi-upload" />
        </div>
        <div>
          <div className="page-header-title">Importer un emploi du temps</div>
          <div className="page-header-subtitle">Chargez un fichier Excel ou CSV pour importer vos données</div>
        </div>
      </div>

      {/* Steps */}
      <div className="import-steps">
        <div className={`import-step ${!file ? "active" : "done"}`}>
          <div className="import-step-num">{file ? <i className="pi pi-check" style={{ fontSize: 10 }} /> : "1"}</div>
          <span>Choisir un fichier</span>
        </div>
        <div className="import-step-line" />
        <div className={`import-step ${file && !result ? "active" : result?.success ? "done" : ""}`}>
          <div className="import-step-num">{result?.success ? <i className="pi pi-check" style={{ fontSize: 10 }} /> : "2"}</div>
          <span>Configurer & importer</span>
        </div>
        <div className="import-step-line" />
        <div className={`import-step ${result?.success ? "active" : ""}`}>
          <div className="import-step-num">3</div>
          <span>Terminé</span>
        </div>
      </div>

      <div className="card card-static">
        <div className="form-stack">
          {/* Format info toggle */}
          <button className="format-toggle-btn" onClick={() => setShowFormat(!showFormat)}>
            <i className={`pi ${showFormat ? "pi-chevron-up" : "pi-chevron-down"}`} style={{ fontSize: 12 }} />
            <span>Format attendu</span>
            <div className="format-badges">
              <span className="tag tag-success">.xlsx</span>
              <span className="tag tag-accent">.csv</span>
            </div>
          </button>

          {showFormat && (
            <div className="format-details-box">
              <table className="format-table">
                <thead>
                  <tr>
                    <th>Colonne</th>
                    <th>Obligatoire</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMN_DATA.map((row) => (
                    <tr key={row.col}>
                      <td className="mono">{row.col}</td>
                      <td>{row.required}</td>
                      <td>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="format-hints">
                <p><span className="tag tag-success" style={{ marginRight: 4 }}>Excel (.xlsx)</span> Un onglet par mois nommé avec le nom du mois.</p>
                <p><span className="tag tag-accent" style={{ marginRight: 4 }}>CSV (.csv)</span> Dates au format JJ/MM/AAAA ou AAAA-MM-JJ.</p>
              </div>
            </div>
          )}

          {/* File upload dropzone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <div
            className={`upload-dropzone ${dragOver ? "dragover" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="upload-dropzone-icon">
              <i className="pi pi-cloud-upload" />
            </div>
            <div className="upload-dropzone-text">Glissez un fichier ici</div>
            <div className="upload-dropzone-hint">.xlsx, .xls ou .csv — Max 10 Mo</div>
            <div className="upload-dropzone-btn">
              <i className="pi pi-folder-open" /> Parcourir
            </div>
          </div>

          {/* Selected file info */}
          {file && (
            <div className="file-info-row">
              <div className="file-info-icon">
                <i className={`pi ${file.name.endsWith(".csv") ? "pi-file" : "pi-file-excel"}`} />
              </div>
              <div className="file-info-details">
                <span className="file-info-name">{file.name}</span>
                <span className="file-info-size">{(file.size / 1024).toFixed(1)} Ko</span>
              </div>
              <button
                className="btn-icon btn-ghost sm"
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                style={{ color: "var(--danger)" }}
              >
                <i className="pi pi-times" style={{ fontSize: 12 }} />
              </button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`result-banner ${result.success ? "success" : "error"}`}>
              <i className={`pi ${result.success ? "pi-check-circle" : "pi-times-circle"}`} />
              <span>{result.message}</span>
            </div>
          )}

          {/* Replace option */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              className="c-checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
            />
            Remplacer toutes les données existantes
          </label>

          {replaceExisting && (
            <div className="result-banner error" style={{ fontSize: "0.8rem" }}>
              <i className="pi pi-exclamation-triangle" />
              <span>Toutes vos entrées actuelles seront supprimées et remplacées par le contenu du fichier.</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary btn-full"
              disabled={!file || loading}
              onClick={handleImport}
            >
              {loading ? (
                <><i className="pi pi-spinner spinner" /> Import en cours…</>
              ) : (
                <><i className="pi pi-upload" /> Importer</>
              )}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => router.push("/")}
            >
              {result?.success ? (
                <><i className="pi pi-calendar" /> Voir le calendrier</>
              ) : (
                <><i className="pi pi-arrow-right" /> Passer</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
