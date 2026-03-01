"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { PhaseLock } from "@/components/PhaseLock";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskCard } from "@/components/TaskCard";
import { useZenStore } from "@/lib/store";
import { exportJSON } from "@/lib/storage";
import { getActorSnapshot, getTasksForProfile } from "@/lib/selectors";
import { UserId, ZenStateData } from "@/lib/state";

type ProfileHubProps = {
  baseUserId: UserId;
  baseLabel: string;
  heading: string;
};

export function ProfileHub({ baseUserId, baseLabel, heading }: ProfileHubProps) {
  const users = useZenStore((state) => state.users);
  const team = useZenStore((state) => state.team);
  const tasksState = useZenStore((state) => state.tasks);
  const rewards = useZenStore((state) => state.rewards);
  const tickets = useZenStore((state) => state.tickets);
  const settings = useZenStore((state) => state.settings);
  const teamLevel = useZenStore((state) => state.teamLevel);
  const setActiveUser = useZenStore((state) => state.setActiveUser);
  const completeTask = useZenStore((state) => state.completeTask);
  const importState = useZenStore((state) => state.importState);
  const resetApp = useZenStore((state) => state.resetApp);
  const restoreDemo = useZenStore((state) => state.restoreDemo);
  const getPersistedState = useZenStore((state) => state.getPersistedState);
  const [selected, setSelected] = useState<"team" | UserId>(baseUserId);
  const [rawImport, setRawImport] = useState("");
  const derivedState = useMemo<ZenStateData>(
    () => ({ users, team, tasks: tasksState, rewards, tickets, settings }),
    [users, team, tasksState, rewards, tickets, settings]
  );
  const activeEntity = useMemo(() => {
    if (selected === "team") {
      return { label: "Equipo", actor: team };
    }
    const user = users.find((item) => item.id === selected) ?? users[0];
    return { label: user.name, actor: user };
  }, [selected, team, users]);
  const snapshot = getActorSnapshot(activeEntity.actor);
  const tasks = useMemo(() => getTasksForProfile(derivedState, selected), [derivedState, selected]);

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const contents = await file.text();
    setRawImport(contents);
  };

  return (
    <div className="space-y-4">
      <section className="glass-card p-5">
        <p className="section-title">{heading}</p>
        <div className="mt-3 flex gap-2">
          {[baseUserId, "team" as const].map((value) => (
            <button
              key={value}
              type="button"
              className={`btn btn-sm rounded-full ${selected === value ? "btn-primary" : "btn-ghost bg-base-200"}`}
              onClick={() => {
                setSelected(value);
                if (value !== "team") {
                  setActiveUser(value);
                }
              }}
            >
              {value === "team" ? "Equipo" : baseLabel}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-[24px] bg-base-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-moss">{activeEntity.label}</h1>
              <p className="mt-1 text-sm text-moss/70">
                Nivel {snapshot.level} - Racha {snapshot.streak} dias
              </p>
            </div>
            <div className="rounded-full bg-white px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-sage">Monedas</p>
              <p className="text-lg font-semibold text-moss">{activeEntity.actor.coins}</p>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              current={snapshot.levelXp}
              max={snapshot.nextLevelXp}
              label={`${snapshot.levelXp} / ${snapshot.nextLevelXp} XP`}
            />
          </div>
        </div>
      </section>

      {selected !== "team" && teamLevel.level < 3 ? <PhaseLock minLevel={3} label="Panel individual completo" /> : null}

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-title">Tareas</p>
          <h2 className="mt-1 text-lg font-semibold text-moss">Historial vivo y pendientes</h2>
        </div>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={() => completeTask(task.id)} />
        ))}
      </section>

      <section className="glass-card p-5">
        <p className="section-title">Ajustes</p>
        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="btn btn-outline w-full rounded-full"
            onClick={() => exportJSON(getPersistedState())}
          >
            Exportar backup JSON
          </button>
          <label className="btn btn-ghost w-full rounded-full border border-dashed border-sage/30 bg-base-200">
            Importar desde archivo
            <input hidden accept="application/json" type="file" onChange={handleImportFile} />
          </label>
          <textarea
            className="textarea textarea-bordered h-32 w-full rounded-[22px]"
            placeholder="Pega aqui un backup JSON para restaurar el estado"
            value={rawImport}
            onChange={(event) => setRawImport(event.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary w-full rounded-full"
            onClick={() => importState(rawImport)}
          >
            Restaurar backup
          </button>
          <button type="button" className="btn btn-outline w-full rounded-full" onClick={() => restoreDemo()}>
            Restaurar demo
          </button>
          <button type="button" className="btn btn-ghost w-full rounded-full" onClick={() => resetApp()}>
            Resetear a vacio
          </button>
        </div>
      </section>
    </div>
  );
}
