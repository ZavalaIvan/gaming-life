"use client";

import { useEffect, useMemo } from "react";
import { useZenStore } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useZenStore((state) => state.hydrated);
  const toasts = useZenStore((state) => state.toasts);
  const clearToast = useZenStore((state) => state.clearToast);
  const latestToast = useMemo(() => toasts[toasts.length - 1] ?? null, [toasts]);

  useEffect(() => {
    useZenStore.getState().hydrate();
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  if (!hydrated) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <div className="glass-card w-full p-6 text-center">
          <p className="section-title">Zen Ludico</p>
          <h1 className="mt-2 text-2xl font-semibold text-moss">Cargando rutina</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <div className="pointer-events-none fixed inset-0 z-40 mx-auto max-w-md overflow-hidden">
        {latestToast ? (
          <div className={`reward-flash ${latestToast.tone === "coin" ? "reward-flash-coin" : latestToast.tone === "level" ? "reward-flash-level" : "reward-flash-xp"}`}>
            <div className="reward-orb reward-orb-a" />
            <div className="reward-orb reward-orb-b" />
            <div className="reward-orb reward-orb-c" />
          </div>
        ) : null}
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md flex-col gap-2 px-4">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            className={`toast-pop pointer-events-auto relative overflow-hidden rounded-[24px] border border-white/30 px-4 py-3 text-left text-sm shadow-soft ${
              toast.tone === "coin"
                ? "bg-gradient-to-r from-gold to-warning text-moss"
                : toast.tone === "level"
                  ? "bg-gradient-to-r from-sage to-success text-white"
                  : toast.tone === "streak"
                    ? "bg-gradient-to-r from-moss to-sage text-white"
                    : "bg-moss text-white"
            }`}
            onClick={() => clearToast(toast.id)}
          >
            <div className="toast-sheen" />
            <div className="relative flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold tracking-[0.16em] ${
                  toast.tone === "coin"
                    ? "coin-bounce bg-white/45 text-moss"
                    : toast.tone === "level"
                      ? "level-spin bg-white/15 text-white"
                      : toast.tone === "streak"
                        ? "streak-flicker bg-white/15 text-white"
                        : "bg-white/15 text-white"
                }`}
              >
                {toast.tone === "coin" ? "CO" : toast.tone === "level" ? "LV" : toast.tone === "streak" ? "XP" : "OK"}
              </span>
              <span className="font-medium">{toast.message}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
