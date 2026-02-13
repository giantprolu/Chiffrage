"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { importFile } from "@/lib/services";

const COLUMNS = [
  { field: "col", header: "Colonne", style: { fontFamily: "monospace", fontWeight: 600 } },
  { field: "required", header: "Obligatoire" },
  { field: "description", header: "Description" },
];

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
  const fileUploadRef = useRef<FileUpload>(null);
  const router = useRouter();

  const handleSelect = (e: FileUploadHandlerEvent) => {
    const f = e.files?.[0] || null;
    if (f) {
      setFile(f);
      setResult(null);
    }
  };

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
    <div className="import-page animate-fade-in">
      <div className="import-header">
        <div className="import-icon-wrap">
          <i className="pi pi-upload" />
        </div>
        <div>
          <h1 className="import-title">Importer un emploi du temps</h1>
          <p className="import-subtitle">Chargez un fichier Excel ou CSV pour importer vos données</p>
        </div>
      </div>

      {/* Steps */}
      <div className="import-steps">
        <div className={`import-step ${!file ? "active" : "done"}`}>
          <div className="import-step-num">{file ? <i className="pi pi-check" /> : "1"}</div>
          <span>Choisir un fichier</span>
        </div>
        <div className="import-step-line" />
        <div className={`import-step ${file && !result ? "active" : result?.success ? "done" : ""}`}>
          <div className="import-step-num">{result?.success ? <i className="pi pi-check" /> : "2"}</div>
          <span>Configurer & importer</span>
        </div>
        <div className="import-step-line" />
        <div className={`import-step ${result?.success ? "active" : ""}`}>
          <div className="import-step-num">3</div>
          <span>Terminé</span>
        </div>
      </div>

      <Card className="import-card">
        <div className="import-stack">
          {/* Format info toggle */}
          <button className="format-toggle" onClick={() => setShowFormat(!showFormat)}>
            <i className={`pi ${showFormat ? "pi-chevron-up" : "pi-chevron-down"}`} />
            <span>Format attendu</span>
            <div className="format-badges">
              <Tag value=".xlsx" severity="success" />
              <Tag value=".csv" severity="info" />
            </div>
          </button>

          {showFormat && (
            <div className="format-details">
              <DataTable
                value={COLUMN_DATA}
                size="small"
                stripedRows
                className="format-table"
              >
                {COLUMNS.map((col) => (
                  <Column
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    style={col.style}
                  />
                ))}
              </DataTable>

              <div className="format-hints">
                <p>
                  <Tag value="Excel (.xlsx)" severity="success" style={{ marginRight: "0.25rem" }} />
                  Un onglet par mois nommé avec le nom du mois.
                </p>
                <p>
                  <Tag value="CSV (.csv)" severity="info" style={{ marginRight: "0.25rem" }} />
                  Dates au format JJ/MM/AAAA ou AAAA-MM-JJ.
                </p>
              </div>
            </div>
          )}

          {/* File upload */}
          <FileUpload
            ref={fileUploadRef}
            mode="advanced"
            accept=".xlsx,.xls,.csv"
            maxFileSize={10000000}
            customUpload
            uploadHandler={handleSelect}
            auto
            chooseLabel="Parcourir"
            chooseOptions={{ icon: "pi pi-folder-open", className: "p-button-outlined" }}
            emptyTemplate={
              <div className="upload-zone">
                <div className="upload-zone-icon">
                  <i className="pi pi-cloud-upload" />
                </div>
                <p className="upload-zone-text">Glissez un fichier ici</p>
                <p className="upload-zone-hint">.xlsx, .xls ou .csv — Max 10 Mo</p>
              </div>
            }
          />

          {file && (
            <div className="import-file-info">
              <div className="import-file-icon">
                <i className={`pi ${file.name.endsWith(".csv") ? "pi-file" : "pi-file-excel"}`} />
              </div>
              <div className="import-file-details">
                <span className="import-file-name">{file.name}</span>
                <span className="import-file-size">{(file.size / 1024).toFixed(1)} Ko</span>
              </div>
              <Button
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                size="small"
                onClick={() => {
                  setFile(null);
                  fileUploadRef.current?.clear();
                }}
              />
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`import-result ${result.success ? "success" : "error"}`}>
              <i className={`pi ${result.success ? "pi-check-circle" : "pi-times-circle"}`} />
              <span>{result.message}</span>
            </div>
          )}

          {/* Replace option */}
          <div className="import-option">
            <Checkbox
              inputId="replace"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.checked ?? false)}
            />
            <label htmlFor="replace">
              Remplacer toutes les données existantes
            </label>
          </div>

          {replaceExisting && (
            <Message
              severity="warn"
              text="Toutes vos entrées actuelles seront supprimées et remplacées par le contenu du fichier."
            />
          )}

          {/* Actions */}
          <div className="import-actions">
            <Button
              label={loading ? "Import en cours…" : "Importer"}
              icon="pi pi-upload"
              loading={loading}
              disabled={!file || loading}
              onClick={handleImport}
              className="import-main-btn"
            />
            <Button
              label={result?.success ? "Voir le calendrier" : "Passer"}
              icon={result?.success ? "pi pi-calendar" : "pi pi-arrow-right"}
              severity="secondary"
              outlined
              onClick={() => router.push("/")}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
