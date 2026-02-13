"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Avatar } from "primereact/avatar";
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

  const navItems: { label: string; icon: string; path: string }[] = [
    { label: "Calendrier", icon: "pi pi-calendar", path: "/" },
    { label: "Stats", icon: "pi pi-chart-bar", path: "/stats" },
    { label: "Export", icon: "pi pi-download", path: "/export" },
    { label: "Import", icon: "pi pi-upload", path: "/import" },
  ];

  const items: MenuItem[] = navItems.map((item) => ({
    label: item.label,
    icon: item.icon,
    command: () => router.push(item.path),
    className: pathname === item.path ? "p-menuitem-active" : "",
  }));

  const start = (
    <div
      className="flex items-center gap-2.5 mr-4 cursor-pointer select-none"
      onClick={() => router.push("/")}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white">
        <i className="pi pi-calendar-plus text-sm" />
      </div>
      <span className="font-bold text-lg tracking-tight hidden sm:inline">
        Chiffrage
      </span>
    </div>
  );

  const end = (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
      {username && (
        <>
          <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800">
            <Avatar
              label={username.charAt(0).toUpperCase()}
              size="normal"
              shape="circle"
              style={{
                width: "1.75rem",
                height: "1.75rem",
                fontSize: "0.75rem",
                backgroundColor: "var(--primary-color)",
                color: "white",
              }}
            />
            <span className="text-sm font-medium text-color">
              {username}
            </span>
          </div>
          <Button
            icon="pi pi-sign-out"
            size="small"
            text
            rounded
            severity="secondary"
            onClick={handleLogout}
            tooltip="Déconnexion"
            tooltipOptions={{ position: "bottom" }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            text
            rounded
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
        label={deleteLoading ? "Suppression…" : "Supprimer définitivement"}
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
        className="sticky top-0 z-40 border-x-0 border-t-0 rounded-none backdrop-blur-sm"
        style={{ borderBottom: "1px solid var(--surface-border, #e2e8f0)" }}
      />

      <Dialog
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-exclamation-triangle text-red-500" />
            <span>Supprimer le compte</span>
          </div>
        }
        visible={showDeleteConfirm}
        style={{ width: "440px" }}
        onHide={() => setShowDeleteConfirm(false)}
        footer={deleteFooter}
        modal
        closable
      >
        <div className="py-2">
          <p className="mb-3 text-sm">
            Cette action est <strong className="text-red-500">irréversible</strong>.
          </p>
          <p className="text-sm text-color-secondary leading-relaxed">
            Toutes vos données seront définitivement supprimées : entrées,
            congés, formations et compte utilisateur.
          </p>
        </div>
      </Dialog>
    </>
  );
}
