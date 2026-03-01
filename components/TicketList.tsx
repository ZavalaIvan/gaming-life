"use client";

import { useMemo } from "react";
import { useZenStore } from "@/lib/store";

export function TicketList() {
  const ticketsState = useZenStore((state) => state.tickets);
  const rewards = useZenStore((state) => state.rewards);
  const users = useZenStore((state) => state.users);
  const markTicketDone = useZenStore((state) => state.markTicketDone);
  const tickets = useMemo(
    () =>
      ticketsState
        .filter((ticket) => ticket.status === "pending")
        .sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt)),
    [ticketsState]
  );

  if (tickets.length === 0) {
    return (
      <div className="glass-card p-4 text-sm text-moss/70">
        No hay tickets pendientes. Cuando canjees una recompensa apareceran aqui.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const reward = rewards.find((item) => item.id === ticket.rewardId);
        const user = users.find((item) => item.id === ticket.redeemedBy);
        return (
          <article key={ticket.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-moss">{reward?.title ?? "Recompensa"}</h3>
                <p className="mt-1 text-sm text-moss/70">{user?.name ?? "Usuario"} la canjeo</p>
              </div>
              <button type="button" className="btn btn-sm rounded-full btn-ghost" onClick={() => markTicketDone(ticket.id)}>
                Hecho
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
