"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { MenuItem } from "primereact/menuitem";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (pathname === "/login") return;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.username) setUsername(data.username);
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch {
      setDeleteLoading(false);
    }
  };

  const items: MenuItem[] = [
    {
      label: "Calendrier",
      icon: "pi pi-calendar",
      command: () => router.push("/"),
    },
    {
      label: "Stats",
      icon: "pi pi-chart-bar",
      command: () => router.push("/stats"),
    },
    {
      label: "Export",
      icon: "pi pi-download",
      command: () => router.push("/export"),
    },
    {
      label: "Import",
      icon: "pi pi-upload",
      command: () => router.push("/import"),
    },
  ];

  const start = (
    <span
      className="font-bold text-lg mr-4 cursor-pointer"
      onClick={() => router.push("/")}
    >
      Chiffrage
    </span>
  );

  const end = (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      {username && (
        <>
          <span className="text-sm text-color-secondary hidden sm:inline">
            {username}
          </span>
          <Button
            label="Déconnexion"
            icon="pi pi-sign-out"
            size="small"
            text
            severity="secondary"
            onClick={handleLogout}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            text
            severity="danger"
            onClick={() => setShowDeleteConfirm(true)}
            tooltip="Supprimer le compte"
            tooltipOptions={{ position: "bottom" }}
          />
        </>
      )}
    </div>
  );

  const deleteFooter = (
    <div className="flex gap-2 justify-end">
      <Button
        label="Annuler"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={() => setShowDeleteConfirm(false)}
        disabled={deleteLoading}
      />
      <Button
        label={deleteLoading ? "Suppression…" : "Supprimer"}
        icon="pi pi-trash"
        severity="danger"
        onClick={handleDeleteAccount}
        disabled={deleteLoading}
        loading={deleteLoading}
      />
    </div>
  );

  return (
    <>
      <Menubar
        model={items}
        start={start}
        end={end}
        className="sticky top-0 z-40 border-x-0 border-t-0 rounded-none"
      />

      <Dialog
        header="Supprimer le compte"
        visible={showDeleteConfirm}
        style={{ width: "400px" }}
        onHide={() => setShowDeleteConfirm(false)}
        footer={deleteFooter}
        modal
        closable
      >
        <div className="flex items-center gap-3">
          <i
            className="pi pi-exclamation-triangle"
            style={{ fontSize: "2rem", color: "var(--red-500)" }}
          />
          <div>
            <p className="mb-2">
              Cette action est <strong style={{ color: "var(--red-500)" }}>irréversible</strong>.
            </p>
            <p className="text-sm text-color-secondary">
              Toutes vos données seront définitivement supprimées : entrées,
              congés, formations et compte utilisateur.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
