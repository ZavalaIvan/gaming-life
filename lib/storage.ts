import { createEmptyState, createSeedState, ZenStateData } from "@/lib/state";

export const STORAGE_KEY = "zenludico_state_v1";

export function loadState(): ZenStateData {
  if (typeof window === "undefined") {
    return createSeedState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    return sanitizeImportedState(JSON.parse(raw));
  } catch {
    return createSeedState();
  }
}

export function saveState(state: ZenStateData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const fresh = createEmptyState();
  saveState(fresh);
  return fresh;
}

export function restoreDemoState() {
  const fresh = createSeedState();
  saveState(fresh);
  return fresh;
}

export function exportJSON(state: ZenStateData) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `zenludico-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importJSON(raw: string) {
  const parsed = JSON.parse(raw);
  const clean = sanitizeImportedState(parsed);
  saveState(clean);
  return clean;
}

function sanitizeImportedState(value: unknown): ZenStateData {
  const fallback = createEmptyState();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<ZenStateData>;

  return {
    users: Array.isArray(candidate.users) && candidate.users.length === 2 ? candidate.users : fallback.users,
    team: candidate.team ?? fallback.team,
    tasks: Array.isArray(candidate.tasks) ? candidate.tasks : fallback.tasks,
    rewards: Array.isArray(candidate.rewards) ? candidate.rewards : fallback.rewards,
    tickets: Array.isArray(candidate.tickets) ? candidate.tickets : fallback.tickets,
    settings: {
      ...fallback.settings,
      ...(candidate.settings ?? {})
    }
  };
}
