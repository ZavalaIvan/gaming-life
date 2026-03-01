"use client";

import { FormEvent, useMemo, useState } from "react";
import { useZenStore } from "@/lib/store";
import { Reward, Task } from "@/lib/state";

type TaskDraft = {
  title: string;
  type: Task["type"];
  xpValue: string;
  assignedTo: Task["assignedTo"];
  frequencyDays: string;
  deadline: string;
};

type RewardDraft = {
  title: string;
  costCoins: string;
  category: Reward["category"];
  scope: Reward["scope"];
  description: string;
};

const emptyTask: TaskDraft = {
  title: "",
  type: "daily",
  xpValue: "20",
  assignedTo: "team",
  frequencyDays: "7",
  deadline: ""
};

const emptyReward: RewardDraft = {
  title: "",
  costCoins: "3",
  category: "quick",
  scope: "individual",
  description: ""
};

export default function ConfigPage() {
  const tasks = useZenStore((state) => state.tasks);
  const rewards = useZenStore((state) => state.rewards);
  const settings = useZenStore((state) => state.settings);
  const addTask = useZenStore((state) => state.addTask);
  const updateTask = useZenStore((state) => state.updateTask);
  const deleteTask = useZenStore((state) => state.deleteTask);
  const addReward = useZenStore((state) => state.addReward);
  const updateReward = useZenStore((state) => state.updateReward);
  const deleteReward = useZenStore((state) => state.deleteReward);
  const toggleSoundEnabled = useZenStore((state) => state.toggleSoundEnabled);
  const dismissOnboarding = useZenStore((state) => state.dismissOnboarding);
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(emptyTask);
  const [rewardDraft, setRewardDraft] = useState<RewardDraft>(emptyReward);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.completedAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tasks]
  );

  const submitTask = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      title: taskDraft.title.trim(),
      type: taskDraft.type,
      xpValue: Number(taskDraft.xpValue),
      assignedTo: taskDraft.assignedTo,
      schedule: taskDraft.type === "recurring" ? { frequencyDays: Number(taskDraft.frequencyDays) } : undefined,
      deadline: taskDraft.type === "timed" && taskDraft.deadline ? new Date(taskDraft.deadline).toISOString() : null
    };

    if (!payload.title) return;

    if (editingTaskId) {
      updateTask(editingTaskId, payload);
      setEditingTaskId(null);
    } else {
      addTask(payload);
    }

    setTaskDraft(emptyTask);
  };

  const submitReward = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      title: rewardDraft.title.trim(),
      costCoins: Number(rewardDraft.costCoins),
      category: rewardDraft.category,
      scope: rewardDraft.scope,
      description: rewardDraft.description.trim()
    };

    if (!payload.title) return;

    if (editingRewardId) {
      updateReward(editingRewardId, payload);
      setEditingRewardId(null);
    } else {
      addReward(payload);
    }

    setRewardDraft(emptyReward);
  };

  return (
    <div className="space-y-4">
      <section className="glass-card p-5">
        <p className="section-title">Configuracion</p>
        <h1 className="mt-1 text-2xl font-semibold text-moss">Fichas y catalogo</h1>
        <p className="mt-2 text-sm text-moss/70">Aqui puedes agregar o editar tareas pendientes, recompensas y detalles de experiencia.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" className="btn rounded-full btn-ghost bg-base-200" onClick={toggleSoundEnabled}>
            Sonido: {settings.soundEnabled ? "On" : "Off"}
          </button>
          <button type="button" className="btn rounded-full btn-ghost bg-base-200" onClick={dismissOnboarding}>
            Onboarding listo
          </button>
        </div>
      </section>

      <section className="glass-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="section-title">Pendientes</p>
            <h2 className="mt-1 text-lg font-semibold text-moss">Crear o editar tarea</h2>
          </div>
          {editingTaskId ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-full"
              onClick={() => {
                setEditingTaskId(null);
                setTaskDraft(emptyTask);
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
        <form className="space-y-3" onSubmit={submitTask}>
          <input
            className="input input-bordered w-full rounded-2xl"
            placeholder="Nombre de la tarea"
            value={taskDraft.title}
            onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="select select-bordered rounded-2xl"
              value={taskDraft.type}
              onChange={(event) => setTaskDraft((current) => ({ ...current, type: event.target.value as Task["type"] }))}
            >
              <option value="daily">Daily</option>
              <option value="recurring">Recurring</option>
              <option value="oneTime">One time</option>
              <option value="timed">Timed</option>
            </select>
            <input
              className="input input-bordered rounded-2xl"
              type="number"
              min="1"
              placeholder="XP"
              value={taskDraft.xpValue}
              onChange={(event) => setTaskDraft((current) => ({ ...current, xpValue: event.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="select select-bordered rounded-2xl"
              value={taskDraft.assignedTo}
              onChange={(event) =>
                setTaskDraft((current) => ({ ...current, assignedTo: event.target.value as Task["assignedTo"] }))
              }
            >
              <option value="team">Equipo</option>
              <option value="ivan">Ivan</option>
              <option value="ella">Aurora</option>
            </select>
            {taskDraft.type === "recurring" ? (
              <input
                className="input input-bordered rounded-2xl"
                type="number"
                min="1"
                placeholder="Cada X dias"
                value={taskDraft.frequencyDays}
                onChange={(event) => setTaskDraft((current) => ({ ...current, frequencyDays: event.target.value }))}
              />
            ) : (
              <input
                className="input input-bordered rounded-2xl"
                type="datetime-local"
                value={taskDraft.type === "timed" ? taskDraft.deadline : ""}
                onChange={(event) => setTaskDraft((current) => ({ ...current, deadline: event.target.value }))}
                disabled={taskDraft.type !== "timed"}
              />
            )}
          </div>
          <button type="submit" className="btn btn-primary w-full rounded-full">
            {editingTaskId ? "Guardar tarea" : "Agregar tarea"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-title">Pendientes activas</p>
          <h2 className="mt-1 text-lg font-semibold text-moss">Lista editable</h2>
        </div>
        {pendingTasks.map((task) => (
          <article key={task.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-moss">{task.title}</h3>
                <p className="mt-1 text-sm text-moss/70">
                  {task.type} - {task.xpValue} XP - {task.assignedTo === "ella" ? "Aurora" : task.assignedTo}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm rounded-full btn-ghost"
                onClick={() => {
                  setEditingTaskId(task.id);
                  setTaskDraft({
                    title: task.title,
                    type: task.type,
                    xpValue: String(task.xpValue),
                    assignedTo: task.assignedTo,
                    frequencyDays: String(task.schedule?.frequencyDays ?? 7),
                    deadline: task.deadline ? task.deadline.slice(0, 16) : ""
                  });
                }}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn btn-sm rounded-full btn-ghost text-error"
                onClick={() => {
                  deleteTask(task.id);
                  if (editingTaskId === task.id) {
                    setEditingTaskId(null);
                    setTaskDraft(emptyTask);
                  }
                }}
              >
                Borrar
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="glass-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="section-title">Recompensas</p>
            <h2 className="mt-1 text-lg font-semibold text-moss">Crear o editar ficha</h2>
          </div>
          {editingRewardId ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-full"
              onClick={() => {
                setEditingRewardId(null);
                setRewardDraft(emptyReward);
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
        <form className="space-y-3" onSubmit={submitReward}>
          <input
            className="input input-bordered w-full rounded-2xl"
            placeholder="Nombre de la recompensa"
            value={rewardDraft.title}
            onChange={(event) => setRewardDraft((current) => ({ ...current, title: event.target.value }))}
          />
          <textarea
            className="textarea textarea-bordered w-full rounded-2xl"
            placeholder="Descripcion breve"
            value={rewardDraft.description}
            onChange={(event) => setRewardDraft((current) => ({ ...current, description: event.target.value }))}
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              className="input input-bordered rounded-2xl"
              type="number"
              min="1"
              placeholder="Costo"
              value={rewardDraft.costCoins}
              onChange={(event) => setRewardDraft((current) => ({ ...current, costCoins: event.target.value }))}
            />
            <select
              className="select select-bordered rounded-2xl"
              value={rewardDraft.category}
              onChange={(event) =>
                setRewardDraft((current) => ({ ...current, category: event.target.value as Reward["category"] }))
              }
            >
              <option value="quick">Quick</option>
              <option value="major">Major</option>
            </select>
            <select
              className="select select-bordered rounded-2xl"
              value={rewardDraft.scope}
              onChange={(event) =>
                setRewardDraft((current) => ({ ...current, scope: event.target.value as Reward["scope"] }))
              }
            >
              <option value="individual">Personal</option>
              <option value="team">Equipo</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full rounded-full">
            {editingRewardId ? "Guardar recompensa" : "Agregar recompensa"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-title">Catalogo actual</p>
          <h2 className="mt-1 text-lg font-semibold text-moss">Recompensas editables</h2>
        </div>
        {rewards.map((reward) => (
          <article key={reward.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-moss">{reward.title}</h3>
                <p className="mt-1 text-sm text-moss/70">
                  {reward.category} - {reward.scope} - {reward.costCoins} monedas
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm rounded-full btn-ghost"
                onClick={() => {
                  setEditingRewardId(reward.id);
                  setRewardDraft({
                    title: reward.title,
                    costCoins: String(reward.costCoins),
                    category: reward.category,
                    scope: reward.scope,
                    description: reward.description
                  });
                }}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn btn-sm rounded-full btn-ghost text-error"
                onClick={() => {
                  deleteReward(reward.id);
                  if (editingRewardId === reward.id) {
                    setEditingRewardId(null);
                    setRewardDraft(emptyReward);
                  }
                }}
              >
                Borrar
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
