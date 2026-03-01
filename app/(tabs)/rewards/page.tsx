"use client";

import { useMemo } from "react";
import { RewardCard } from "@/components/RewardCard";
import { TicketList } from "@/components/TicketList";
import { PhaseLock } from "@/components/PhaseLock";
import { useZenStore } from "@/lib/store";
import { getClosestReward, getPhaseMeta, getRewardsByCategory, getUnlockedRewards } from "@/lib/selectors";
import { ZenStateData } from "@/lib/state";

export default function RewardsPage() {
  const users = useZenStore((state) => state.users);
  const team = useZenStore((state) => state.team);
  const rewardsState = useZenStore((state) => state.rewards);
  const tickets = useZenStore((state) => state.tickets);
  const settings = useZenStore((state) => state.settings);
  const teamLevel = useZenStore((state) => state.teamLevel);
  const derivedState = useMemo<ZenStateData>(
    () => ({ users, team, tasks: [], rewards: rewardsState, tickets, settings }),
    [users, team, rewardsState, tickets, settings]
  );
  const activeUser = users.find((user) => user.id === settings.activeUserId) ?? users[0];
  const phase = getPhaseMeta(teamLevel.level);
  const rewards = getUnlockedRewards(derivedState);
  const quick = getRewardsByCategory(rewards, "quick");
  const major = getRewardsByCategory(rewards, "major");
  const personalLocked = teamLevel.level < 3;
  const closestReward = getClosestReward(derivedState);

  return (
    <div className="space-y-4">
      <section className="glass-card p-5">
        <p className="section-title">Saldo</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-base-200 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-sage">Usuario activo</p>
            <p className="mt-2 text-xl font-semibold text-moss">{activeUser.coins} monedas</p>
            <p className="text-sm text-moss/70">{activeUser.name}</p>
          </div>
          <div className="rounded-[22px] bg-base-200 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-sage">Equipo</p>
            <p className="mt-2 text-xl font-semibold text-moss">{team.coins} monedas</p>
            <p className="text-sm text-moss/70">{phase.title}</p>
          </div>
        </div>
        {closestReward ? (
          <div className="mt-4 rounded-[22px] bg-gradient-to-r from-sand/80 to-base-100 p-4">
            <p className="section-title">Mas cerca</p>
            <h2 className="mt-1 text-lg font-semibold text-moss">{closestReward.reward.title}</h2>
            <p className="mt-1 text-sm text-moss/70">
              {closestReward.missing > 0
                ? `Te faltan ${closestReward.missing} monedas para desbloquearla.`
                : "Ya tienes saldo suficiente para canjearla."}
            </p>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-title">Recompensas rapidas</p>
          <h2 className="mt-1 text-lg font-semibold text-moss">Premios de uso inmediato</h2>
        </div>
        {quick.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-title">Recompensas grandes</p>
          <h2 className="mt-1 text-lg font-semibold text-moss">Planes y recompensas compartidas</h2>
        </div>
        {major.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </section>

      {personalLocked ? <PhaseLock minLevel={3} label="Recompensas personales" /> : null}

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-title">Tickets</p>
          <h2 className="mt-1 text-lg font-semibold text-moss">Pendientes por disfrutar</h2>
        </div>
        <TicketList />
      </section>
    </div>
  );
}
