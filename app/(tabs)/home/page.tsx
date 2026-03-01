"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskCard } from "@/components/TaskCard";
import { useZenStore } from "@/lib/store";
import {
  getActorSnapshot,
  getClosestReward,
  getDailyMissionProgress,
  getDailyFocusTasks,
  getPhaseUnlockHint,
  getPhaseMeta,
  getPendingTicketsCount,
  getTodayRecap,
  getWeeklyTeamGoal,
  getXpToNextLevel
} from "@/lib/selectors";
import { ZenStateData } from "@/lib/state";

export default function HomePage() {
  const activeUserId = useZenStore((state) => state.settings.activeUserId);
  const users = useZenStore((state) => state.users);
  const team = useZenStore((state) => state.team);
  const tasks = useZenStore((state) => state.tasks);
  const rewards = useZenStore((state) => state.rewards);
  const tickets = useZenStore((state) => state.tickets);
  const settings = useZenStore((state) => state.settings);
  const completeTask = useZenStore((state) => state.completeTask);
  const dismissOnboarding = useZenStore((state) => state.dismissOnboarding);
  const derivedState = useMemo<ZenStateData>(
    () => ({ users, team, tasks, rewards, tickets, settings }),
    [users, team, tasks, rewards, tickets, settings]
  );
  const focusTasks = useMemo(() => getDailyFocusTasks(derivedState), [derivedState]);
  const teamSnapshot = useMemo(() => getActorSnapshot(team), [team]);
  const phase = useMemo(() => getPhaseMeta(teamSnapshot.level), [teamSnapshot.level]);
  const pendingTickets = useMemo(() => getPendingTicketsCount(derivedState), [derivedState]);
  const mission = useMemo(() => getDailyMissionProgress(derivedState), [derivedState]);
  const unlockHint = useMemo(() => getPhaseUnlockHint(teamSnapshot.level), [teamSnapshot.level]);
  const xpToNext = useMemo(() => getXpToNextLevel(team), [team]);
  const recap = useMemo(() => getTodayRecap(derivedState), [derivedState]);
  const weeklyGoal = useMemo(() => getWeeklyTeamGoal(derivedState), [derivedState]);
  const closestReward = useMemo(() => getClosestReward(derivedState), [derivedState]);
  const showOnboarding = !settings.onboardingDone;

  return (
    <div className="space-y-4">
      {showOnboarding ? (
        <section className="glass-card border border-accent/40 bg-gradient-to-r from-sand/70 to-white/90 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-title">Inicio rapido</p>
              <h2 className="mt-1 text-lg font-semibold text-moss">Tu loop diario en menos de 60 segundos</h2>
              <p className="mt-2 text-sm text-moss/70">
                1. Completa 3 a 5 tareas.
                <br />
                2. Mantiene la racha y sube el XP del equipo.
                <br />
                3. Cambia XP por monedas y monedas por premios.
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={dismissOnboarding}>
              Listo
            </button>
          </div>
        </section>
      ) : null}

      <section className="glass-card p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="section-title">Fase actual</p>
            <h1 className="mt-1 text-2xl font-semibold text-moss">{phase.title}</h1>
            <p className="mt-1 text-sm text-moss/70">{phase.description}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-sage">{unlockHint}</p>
          </div>
          <div className="rounded-full bg-base-200 px-3 py-2 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-sage">Racha</p>
            <p className="text-xl font-semibold text-moss">{teamSnapshot.streak} dias</p>
          </div>
        </div>
        <div className="rounded-[24px] bg-gradient-to-r from-sage to-moss p-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">Equipo</p>
              <h2 className="text-2xl font-semibold">Nivel {teamSnapshot.level}</h2>
              <p className="mt-1 text-sm text-white/75">Te faltan {xpToNext} XP para subir</p>
            </div>
            <div className="rounded-full bg-white/15 px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">Monedas</p>
              <p className="text-lg font-semibold">{team.coins}</p>
            </div>
          </div>
          <ProgressBar
            current={teamSnapshot.levelXp}
            max={teamSnapshot.nextLevelXp}
            label={`${teamSnapshot.levelXp} / ${teamSnapshot.nextLevelXp} XP`}
            tone="light"
          />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-[22px] bg-base-100/80 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-moss">Usuario activo</p>
            <p className="text-xs text-moss/70">{activeUserId === "ivan" ? "Ivan" : "Aurora"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-moss">{pendingTickets} tickets pendientes</p>
            <p className="text-xs text-moss/70">Recompensas listas para usar</p>
          </div>
        </div>
        <div className="mt-4 rounded-[22px] border border-sage/10 bg-base-100/90 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-title">Mision diaria</p>
              <h3 className="mt-1 text-lg font-semibold text-moss">
                Hoy llevas {mission.completed}/{mission.total} tareas
              </h3>
            </div>
            <div className="rounded-full bg-base-200 px-3 py-2 text-sm font-semibold text-sage">
              {mission.remaining} restantes
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar current={mission.completed} max={Math.max(1, mission.total)} label="Progreso del dia" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-base-100/90 p-4">
            <p className="section-title">Cierre de hoy</p>
            <p className="mt-2 text-2xl font-semibold text-moss">{recap.completedCount}</p>
            <p className="text-sm text-moss/70">tareas cerradas · {recap.xpEarned} XP ganados</p>
          </div>
          <div className="rounded-[22px] bg-base-100/90 p-4">
            <p className="section-title">Meta semanal</p>
            <p className="mt-2 text-2xl font-semibold text-moss">{weeklyGoal.xpThisWeek}/{weeklyGoal.targetXp}</p>
            <p className="text-sm text-moss/70">XP acumulado del equipo</p>
          </div>
        </div>
        <div className="mt-4 rounded-[22px] bg-base-100/90 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-title">Recompensa objetivo</p>
              <h3 className="mt-1 text-lg font-semibold text-moss">
                {closestReward ? closestReward.reward.title : "Sin recompensa cercana"}
              </h3>
              <p className="mt-1 text-sm text-moss/70">
                {closestReward
                  ? closestReward.missing > 0
                    ? `Te faltan ${closestReward.missing} monedas para alcanzarla`
                    : "Ya la puedes canjear ahora mismo"
                  : "Agrega mas recompensas desde Config"}
              </p>
            </div>
            <Link href="/rewards" className="btn btn-sm rounded-full btn-ghost bg-base-200">
              Ver
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="section-title">Hoy</p>
            <h2 className="mt-1 text-lg font-semibold text-moss">Tus focos del dia</h2>
            <p className="mt-1 text-sm text-moss/70">Empieza por los primeros 3 para cerrar la sesion rapido.</p>
          </div>
          <Link className="text-sm font-medium text-sage" href={activeUserId === "ivan" ? "/profile" : "/auro"}>
            Ver todas
          </Link>
        </div>
        {focusTasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={() => completeTask(task.id)} />
        ))}
      </section>

      <Link
        href="/rewards"
        className="btn btn-primary fixed bottom-24 left-1/2 z-20 w-[calc(100%-2rem)] max-w-[calc(28rem-2rem)] -translate-x-1/2 rounded-full text-base shadow-lg"
      >
        Canjear
      </Link>

    </div>
  );
}
