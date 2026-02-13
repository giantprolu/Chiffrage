import type { Entry, FormationDay, CongeDay, StatsData } from "./types";

// ===== Entries =====
export async function fetchEntries(month: number, year: number): Promise<Entry[]> {
  const res = await fetch(`/api/entries?month=${month}&year=${year}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createEntry(data: {
  date: string;
  client: string;
  ticket: string;
  comment: string;
  time: number;
  type: string | null;
}): Promise<void> {
  await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateEntry(
  id: number,
  data: { date: string; client: string; ticket: string; comment: string; time: number; type: string | null }
): Promise<void> {
  await fetch(`/api/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteEntry(id: number): Promise<void> {
  await fetch(`/api/entries/${id}`, { method: "DELETE" });
}

// ===== Formation Days =====
export async function fetchFormationDays(month: number, year: number): Promise<FormationDay[]> {
  const res = await fetch(`/api/formation-days?month=${month}&year=${year}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createFormationDay(date: string, time: number): Promise<void> {
  await fetch("/api/formation-days", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, time }),
  });
}

export async function deleteFormationDay(date: string): Promise<void> {
  await fetch(`/api/formation-days?date=${date}`, { method: "DELETE" });
}

// ===== Conge Days =====
export async function fetchCongeDays(month: number, year: number): Promise<CongeDay[]> {
  const res = await fetch(`/api/conge-days?month=${month}&year=${year}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createCongeDay(date: string, time: number): Promise<void> {
  await fetch("/api/conge-days", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, time }),
  });
}

export async function deleteCongeDay(date: string): Promise<void> {
  await fetch(`/api/conge-days?date=${date}`, { method: "DELETE" });
}

// ===== Clients =====
export async function fetchClients(): Promise<string[]> {
  const res = await fetch("/api/clients");
  if (!res.ok) return [];
  return res.json();
}

// ===== Stats =====
export async function fetchStats(from: string, to: string): Promise<StatsData | null> {
  const res = await fetch(`/api/stats?from=${from}&to=${to}`);
  if (!res.ok) return null;
  return res.json();
}

// ===== Auth =====
export async function fetchMe(): Promise<{ username: string } | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function register(username: string, password: string) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function deleteAccount(): Promise<boolean> {
  const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
  return res.ok;
}

// ===== Import =====
export async function importFile(
  file: File,
  replace: boolean
): Promise<{ message: string; success: boolean }> {
  const formData = new FormData();
  formData.append("file", file);
  if (replace) formData.append("replace", "true");
  const res = await fetch("/api/import", { method: "POST", body: formData });
  const data = await res.json();
  return { message: data.message || data.error || "Erreur", success: res.ok };
}
