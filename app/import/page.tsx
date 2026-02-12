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
import { Divider } from "primereact/divider";

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
        <h1 className="text-xl font-bold">Importer un emploi du temps</h1>
        <p className="text-sm text-color-secondary mt-1">
          Importez vos données depuis un fichier Excel (.xlsx) ou CSV.
        </p>
      </div>

      <Card className="shadow-sm">
        <div className="space-y-5">
          {/* Format info */}
          <Message
            severity="info"
            className="w-full"
            content={
              <div className="space-y-3 w-full">
                <p className="text-sm font-semibold">Format attendu</p>

                <DataTable
                  value={COLUMN_DATA}
                  size="small"
                  className="text-xs"
                  stripedRows
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

                <Divider />

                <div className="space-y-1 text-xs">
                  <p>
                    <Tag value="Excel (.xlsx)" severity="success" className="mr-1" />
                    Un onglet par mois nommé avec le nom du mois. Chaque onglet contient les colonnes ci-dessus.
                  </p>
                  <p>
                    <Tag value="CSV (.csv)" severity="info" className="mr-1" />
                    Un seul fichier avec toutes les entrées. Dates au format JJ/MM/AAAA ou AAAA-MM-JJ.
                  </p>
                </div>
              </div>
            }
          />

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
            chooseOptions={{ icon: "pi pi-upload", className: "p-button-outlined" }}
            emptyTemplate={
              <div className="flex flex-col items-center text-color-secondary p-4">
                <i className="pi pi-cloud-upload text-4xl mb-2" />
                <p className="text-sm">Glissez un fichier ici</p>
                <p className="text-xs opacity-60">.xlsx, .xls ou .csv</p>
              </div>
            }
          />

          {file && (
            <div className="flex items-center gap-2">
              <i className="pi pi-file text-color-secondary" />
              <span className="text-sm font-medium">{file.name}</span>
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
            <Message
              severity={result.success ? "success" : "error"}
              text={result.message}
              className="w-full"
            />
          )}

          {/* Replace option */}
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="replace"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.checked ?? false)}
            />
            <label htmlFor="replace" className="text-sm text-color-secondary cursor-pointer">
              Remplacer toutes les données existantes
            </label>
          </div>

          {replaceExisting && (
            <Message
              severity="warn"
              text="Toutes vos entrées actuelles seront supprimées et remplacées par le contenu du fichier."
              className="w-full"
            />
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              label={loading ? "Import en cours…" : "Importer"}
              icon="pi pi-upload"
              loading={loading}
              disabled={!file || loading}
              onClick={handleImport}
              className="flex-1"
            />
            <Button
              label={result?.success ? "Continuer" : "Passer"}
              icon="pi pi-arrow-right"
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
