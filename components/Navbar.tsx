"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
                <button
                  className="btn-icon btn-ghost sm"
                  onClick={handleLogout}
                  title="Déconnexion"
                >
                  <i className="pi pi-sign-out" style={{ fontSize: 12 }} />
                </button>
                <button
                  className="btn-icon btn-ghost sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Supprimer le compte"
                  style={{ color: "var(--danger)" }}
                >
                  <i className="pi pi-trash" style={{ fontSize: 12 }} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setShowDeleteConfirm(false)}>
          <div className="modal-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-header-title">Supprimer le compte</div>
              </div>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}>
                <i className="pi pi-times" style={{ fontSize: 12 }} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.9rem", marginBottom: 8 }}>
                Cette action est <strong>irréversible</strong>.
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Toutes vos données seront définitivement supprimées.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  <i className="pi pi-times" /> Annuler
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <><i className="pi pi-spinner spinner" /> Suppression…</>
                  ) : (
                    <><i className="pi pi-trash" /> Supprimer</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
