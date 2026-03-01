"use client";

import { useMemo } from "react";
import { Reward } from "@/lib/state";
import { useZenStore } from "@/lib/store";

export function RewardCard({ reward }: { reward: Reward }) {
  const redeemReward = useZenStore((state) => state.redeemReward);
  const activeUserId = useZenStore((state) => state.settings.activeUserId);
  const users = useZenStore((state) => state.users);
  const teamCoins = useZenStore((state) => state.team.coins);
  const activeUserCoins = useMemo(
    () => users.find((user) => user.id === activeUserId)?.coins ?? 0,
    [users, activeUserId]
  );
  const available = reward.scope === "team" ? teamCoins : activeUserCoins;
  const disabled = available < reward.costCoins;
  const missing = Math.max(0, reward.costCoins - available);
  const progress = Math.min(100, (available / Math.max(reward.costCoins, 1)) * 100);

  return (
    <article className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-title">{reward.scope === "team" ? "Compartida" : "Personal"}</p>
          <h3 className="mt-1 text-lg font-semibold text-moss">{reward.title}</h3>
          <p className="mt-2 text-sm text-moss/70">{reward.description}</p>
        </div>
        <span className="rounded-full bg-base-200 px-3 py-2 text-sm font-semibold text-sage">
          {reward.costCoins} c
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-2 rounded-full bg-base-300">
          <div className="h-2 rounded-full bg-gradient-to-r from-gold to-accent transition-all duration-700" style={{ width: `${Math.max(8, progress)}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-moss/70">
            {disabled ? `Te faltan ${missing} monedas` : `Disponible: ${available} monedas`}
          </p>
        <button
          type="button"
          className={`btn btn-sm rounded-full ${disabled ? "btn-disabled" : "btn-primary"}`}
          disabled={disabled}
          onClick={() => redeemReward(reward.id)}
        >
          Canjear
        </button>
        </div>
      </div>
    </article>
  );
}
