"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import ThemeToggle from "./ThemeToggle";
import { fetchMe, logout, deleteAccount } from "@/lib/services";

const NAV_ITEMS = [
  { label: "Calendrier", icon: "pi pi-calendar", path: "/" },
  { label: "Stats", icon: "pi pi-chart-bar", path: "/stats" },
  { label: "Export", icon: "pi pi-download", path: "/export" },
  { label: "Import", icon: "pi pi-upload", path: "/import" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (pathname === "/login") return;
    fetchMe().then((data) => {
      if (data?.username) setUsername(data.username);
    });
  }, [pathname]);

  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const ok = await deleteAccount();
    if (ok) window.location.href = "/login";
    else setDeleteLoading(false);
  };

  const deleteFooter = (
    <div className="dialog-footer">
      <Button label="Annuler" icon="pi pi-times" severity="secondary" outlined onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading} />
      <Button label={deleteLoading ? "Suppression…" : "Supprimer"} icon="pi pi-trash" severity="danger" onClick={handleDeleteAccount} disabled={deleteLoading} loading={deleteLoading} />
    </div>
  );

  return (
    <>
      <header className="nav-header">
        <div className="nav-inner">
          <button onClick={() => router.push("/")} className="nav-logo">
            <div className="nav-logo-icon">
              <i className="pi pi-calendar-plus" style={{ fontSize: 14 }} />
            </div>
            <span className="nav-logo-text">Chiffrage</span>
          </button>

          <nav className="nav-links">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`nav-link ${pathname === item.path ? "active" : ""}`}
              >
                <i className={item.icon} style={{ fontSize: 12 }} />
                <span className="nav-link-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="nav-right">
            <ThemeToggle />
            {username && (
              <>
                <span className="nav-username">{username}</span>
                <Button icon="pi pi-sign-out" size="small" text rounded severity="secondary" onClick={handleLogout} tooltip="Déconnexion" tooltipOptions={{ position: "bottom" }} />
                <Button icon="pi pi-trash" size="small" text rounded severity="danger" onClick={() => setShowDeleteConfirm(true)} tooltip="Supprimer le compte" tooltipOptions={{ position: "bottom" }} />
              </>
            )}
          </div>
        </div>
      </header>

      <Dialog
        header="Supprimer le compte"
        visible={showDeleteConfirm}
        style={{ width: "400px" }}
        onHide={() => setShowDeleteConfirm(false)}
        footer={deleteFooter}
        modal
      >
        <p className="delete-text">
          Cette action est <strong>irréversible</strong>.
        </p>
        <p className="delete-sub">
          Toutes vos données seront définitivement supprimées.
        </p>
      </Dialog>
    </>
  );
}
