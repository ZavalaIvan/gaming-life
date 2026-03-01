"use client";

import { useMemo } from "react";
import { PhaseLock } from "@/components/PhaseLock";
import { useZenStore } from "@/lib/store";
import { formatDeadlineLabel, getChallengeBuckets, getWeeklyDuelSummary } from "@/lib/selectors";
import { ZenStateData } from "@/lib/state";

export default function ChallengesPage() {
  const users = useZenStore((state) => state.users);
  const team = useZenStore((state) => state.team);
  const tasks = useZenStore((state) => state.tasks);
  const rewards = useZenStore((state) => state.rewards);
  const tickets = useZenStore((state) => state.tickets);
  const settings = useZenStore((state) => state.settings);
  const teamLevel = useZenStore((state) => state.teamLevel);
  const derivedState = useMemo<ZenStateData>(
    () => ({ users, team, tasks, rewards, tickets, settings }),
    [users, team, tasks, rewards, tickets, settings]
  );
  const { active, expired } = useMemo(() => getChallengeBuckets(derivedState), [derivedState]);
  const duel = useMemo(() => getWeeklyDuelSummary(derivedState), [derivedState]);

  return (
    <div className="space-y-4">
      <section className="glass-card p-5">
        <p className="section-title">Retos activos</p>
        <h1 className="mt-1 text-2xl font-semibold text-moss">Ventanas con bonus</h1>
        <div className="mt-4 space-y-3">
          {active.map((task) => (
            <article key={task.id} className="rounded-[24px] bg-base-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-moss">{task.title}</h2>
                  <p className="mt-1 text-sm text-moss/70">{task.xpValue} XP de bonus al completar</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage">
                  timed
                </span>
              </div>
              <p className="mt-4 text-sm text-moss/80">{formatDeadlineLabel(task.deadline)}</p>
            </article>
          ))}
          {active.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-sage/30 p-4 text-sm text-moss/70">
              No hay retos activos ahora. Los expirados siguen visibles abajo como referencia.
            </div>
          ) : null}
        </div>
      </section>

      {teamLevel.level >= 5 ? (
        <section className="glass-card p-5">
          <p className="section-title">Duelos semanales</p>
          <h2 className="mt-1 text-lg font-semibold text-moss">Competencia ligera sin castigos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {duel.rows.map((row) => (
              <div key={row.userId} className="rounded-[22px] bg-base-200 p-4">
                <p className="text-sm font-medium text-moss">{row.name}</p>
                <p className="mt-2 text-2xl font-semibold text-sage">{row.completed}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-moss/60">tareas individuales</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-moss/70">{duel.summary}</p>
        </section>
      ) : (
        <PhaseLock minLevel={5} label="Duelos semanales" />
      )}

      <section className="glass-card p-5">
        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title px-0 text-lg font-semibold text-moss">Retos expirados</div>
          <div className="collapse-content px-0">
            <div className="space-y-3">
              {expired.map((task) => (
                <article key={task.id} className="rounded-[22px] border border-dashed border-sage/30 p-4">
                  <h3 className="font-medium text-moss">{task.title}</h3>
                  <p className="mt-1 text-sm text-moss/70">{formatDeadlineLabel(task.deadline, true)}</p>
                </article>
              ))}
              {expired.length === 0 ? (
                <p className="text-sm text-moss/70">Todavia no hay retos expirados.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
