"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import ThemeToggle from "./ThemeToggle";

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
  const [mobileOpen, setMobileOpen] = useState(false);

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
      if (res.ok) window.location.href = "/login";
    } catch {
      setDeleteLoading(false);
    }
  };

  const deleteFooter = (
    <div className="flex gap-2 justify-end">
      <Button label="Annuler" icon="pi pi-times" severity="secondary" outlined onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading} />
      <Button label={deleteLoading ? "Suppression…" : "Supprimer"} icon="pi pi-trash" severity="danger" onClick={handleDeleteAccount} disabled={deleteLoading} loading={deleteLoading} />
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-[var(--surface-border)] bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur-md">
        <div className="max-w-[76rem] mx-auto px-4 h-14 flex items-center gap-1">
          {/* Logo */}
          <button onClick={() => router.push("/")} className="flex items-center gap-2 mr-4 shrink-0 bg-transparent border-none cursor-pointer p-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <i className="pi pi-calendar-plus text-sm" />
            </div>
            <span className="font-bold text-base text-[var(--foreground)] hidden sm:inline">Chiffrage</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`nav-link ${pathname === item.path ? "active" : ""}`}
              >
                <i className={`${item.icon} text-xs`} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile burger */}
          <button className="md:hidden ml-1 nav-link p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <i className={`pi ${mobileOpen ? "pi-times" : "pi-bars"} text-base`} />
          </button>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            {username && (
              <>
                <span className="hidden lg:inline text-sm font-medium text-[var(--text-color-secondary,#64748b)] ml-2">
                  {username}
                </span>
                <Button icon="pi pi-sign-out" size="small" text rounded severity="secondary" onClick={handleLogout} tooltip="Déconnexion" tooltipOptions={{ position: "bottom" }} />
                <Button icon="pi pi-trash" size="small" text rounded severity="danger" onClick={() => setShowDeleteConfirm(true)} tooltip="Supprimer le compte" tooltipOptions={{ position: "bottom" }} />
              </>
            )}
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-gray-100 dark:border-[var(--surface-border)] px-4 py-2 flex flex-col gap-0.5 bg-white dark:bg-[var(--surface-card)]">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => { router.push(item.path); setMobileOpen(false); }}
                className={`nav-link w-full justify-start ${pathname === item.path ? "active" : ""}`}
              >
                <i className={`${item.icon} text-xs`} />
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <Dialog
        header="Supprimer le compte"
        visible={showDeleteConfirm}
        style={{ width: "400px" }}
        onHide={() => setShowDeleteConfirm(false)}
        footer={deleteFooter}
        modal
      >
        <p className="text-sm mb-2">
          Cette action est <strong className="text-red-500">irréversible</strong>.
        </p>
        <p className="text-sm text-color-secondary">
          Toutes vos données seront définitivement supprimées.
        </p>
      </Dialog>
    </>
  );
}
