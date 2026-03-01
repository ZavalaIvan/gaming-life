import { getDayKey, getLevelFromXp, getStreak, getWeekKey } from "@/lib/gamification";
import { ActorState, Reward, Task, ZenStateData } from "@/lib/state";

export type TaskStatus = "due" | "completed" | "expired" | "upcoming";

export type TaskView = Task & {
  status: TaskStatus;
  assigneeName: string;
  meta: string;
};

export function getActorSnapshot(actor: ActorState) {
  const level = getLevelFromXp(actor.xp);
  return {
    ...level,
    streak: getStreak(actor.completedDates)
  };
}

export function getTaskStatus(task: Task, now = new Date()): TaskStatus {
  const today = getDayKey(now);

  if (task.type === "timed") {
    if (task.completedAt) return "completed";
    return task.deadline && new Date(task.deadline).getTime() < now.getTime() ? "expired" : "due";
  }

  if (task.type === "oneTime") {
    return task.completedAt ? "completed" : "due";
  }

  if (task.type === "daily") {
    if (!task.completedAt) return "due";
    return getDayKey(task.completedAt) === today ? "completed" : "due";
  }

  if (!task.schedule?.frequencyDays) {
    return task.completedAt ? "completed" : "due";
  }

  if (!task.completedAt) return "due";
  const lastCompleted = new Date(task.completedAt);
  const nextDue = new Date(lastCompleted);
  nextDue.setUTCDate(nextDue.getUTCDate() + task.schedule.frequencyDays);

  if (getDayKey(task.completedAt) === today) return "completed";
  return nextDue.getTime() <= now.getTime() ? "due" : "upcoming";
}

export function getAssigneeName(state: ZenStateData, task: Task) {
  if (task.assignedTo === "team") return "Equipo";
  return state.users.find((user) => user.id === task.assignedTo)?.name ?? "Usuario";
}

export function toTaskView(state: ZenStateData, task: Task): TaskView {
  return {
    ...task,
    status: getTaskStatus(task),
    assigneeName: getAssigneeName(state, task),
    meta: getTaskMeta(task)
  };
}

function getTaskMeta(task: Task) {
  if (task.type === "daily") return "Cada dia";
  if (task.type === "oneTime") return "Una sola vez";
  if (task.type === "timed") return task.deadline ? `Hasta ${task.deadline.slice(0, 10)}` : "Tiempo limitado";
  return `Cada ${task.schedule?.frequencyDays ?? 0} dias`;
}

export function getDailyFocusTasks(state: ZenStateData) {
  const activeUserId = state.settings.activeUserId;
  const teamDailyDue = state.tasks.filter(
    (task) => task.type === "daily" && task.assignedTo === "team" && getTaskStatus(task) === "due"
  );
  const personalDailyDue = state.tasks.filter(
    (task) => task.type === "daily" && task.assignedTo === activeUserId && getTaskStatus(task) === "due"
  );
  const recurringDue = state.tasks.find(
    (task) => task.type === "recurring" && task.assignedTo === "team" && getTaskStatus(task) === "due"
  );
  const fallback = state.tasks.filter(
    (task) =>
      (task.type === "daily" || task.type === "recurring") &&
      (task.assignedTo === "team" || task.assignedTo === activeUserId)
  );

  const picks: Task[] = [
    ...teamDailyDue.slice(0, 2),
    ...personalDailyDue.slice(0, 2),
    ...(recurringDue ? [recurringDue] : [])
  ];

  fallback.forEach((task) => {
    if (picks.length >= 5) return;
    if (picks.some((picked) => picked.id === task.id)) return;
    picks.push(task);
  });

  return picks.slice(0, 5).map((task) => toTaskView(state, task));
}

export function getTasksForProfile(state: ZenStateData, selected: string) {
  return state.tasks
    .filter((task) => (selected === "team" ? task.assignedTo === "team" : task.assignedTo === selected))
    .map((task) => toTaskView(state, task))
    .sort((a, b) => {
      const order: Record<TaskStatus, number> = { due: 0, upcoming: 1, completed: 2, expired: 3 };
      return order[a.status] - order[b.status];
    });
}

export function getRewardsByCategory(rewards: Reward[], category: Reward["category"]) {
  return rewards.filter((reward) => reward.category === category);
}

export function getUnlockedRewards(state: ZenStateData) {
  const level = getLevelFromXp(state.team.xp).level;
  return state.rewards.filter((reward) => (reward.scope === "team" ? true : level >= 3));
}

export function getPendingTicketsCount(state: ZenStateData) {
  return state.tickets.filter((ticket) => ticket.status === "pending").length;
}

export function getDailyMissionProgress(state: ZenStateData) {
  const focusTasks = getDailyFocusTasks(state);
  const completed = focusTasks.filter((task) => task.status === "completed").length;
  return {
    focusTasks,
    total: focusTasks.length,
    completed,
    remaining: Math.max(0, focusTasks.length - completed)
  };
}

export function getPhaseUnlockHint(level: number) {
  if (level >= 5) {
    return "Todo el sistema principal ya esta desbloqueado.";
  }
  if (level >= 3) {
    return `Faltan ${5 - level} niveles para desbloquear duelos semanales.`;
  }
  return `Faltan ${3 - level} niveles para desbloquear recompensas personales.`;
}

export function getXpToNextLevel(actor: ActorState) {
  const snapshot = getActorSnapshot(actor);
  return Math.max(0, snapshot.nextLevelXp - snapshot.levelXp);
}

export function getTodayRecap(state: ZenStateData) {
  const today = getDayKey();
  const activeUserId = state.settings.activeUserId;
  const completedToday = state.tasks.filter((task) => task.completedAt && getDayKey(task.completedAt) === today);
  const relevant = completedToday.filter((task) => task.assignedTo === "team" || task.assignedTo === activeUserId);

  return {
    completedCount: relevant.length,
    xpEarned: relevant.reduce((sum, task) => sum + task.xpValue, 0),
    teamCompletedCount: completedToday.filter((task) => task.assignedTo === "team").length
  };
}

export function getWeeklyTeamGoal(state: ZenStateData) {
  const weekKey = getWeekKey();
  const xpThisWeek = state.tasks
    .filter((task) => task.completedAt && getWeekKey(task.completedAt) === weekKey)
    .reduce((sum, task) => sum + task.xpValue, 0);
  const targetXp = 240;

  return {
    targetXp,
    xpThisWeek,
    remainingXp: Math.max(0, targetXp - xpThisWeek)
  };
}

export function getClosestReward(state: ZenStateData) {
  const activeUserId = state.settings.activeUserId;
  const activeUser = state.users.find((user) => user.id === activeUserId) ?? state.users[0];
  const unlocked = getUnlockedRewards(state);

  const candidates = unlocked.map((reward) => {
    const available = reward.scope === "team" ? state.team.coins : activeUser.coins;
    return {
      reward,
      available,
      missing: Math.max(0, reward.costCoins - available)
    };
  });

  return candidates.sort((a, b) => a.missing - b.missing || a.reward.costCoins - b.reward.costCoins)[0] ?? null;
}

export function getChallengeBuckets(state: ZenStateData) {
  const timed = state.tasks.filter((task) => task.type === "timed").map((task) => toTaskView(state, task));
  return {
    active: timed.filter((task) => task.status === "due" || task.status === "completed"),
    expired: timed.filter((task) => task.status === "expired")
  };
}

export function formatDeadlineLabel(deadline?: string | null, expired = false) {
  if (!deadline) return "Sin deadline";
  return expired ? `Expiro el ${deadline.slice(0, 10)}` : `Termina el ${deadline.slice(0, 10)}`;
}

export function getPhaseMeta(level: number) {
  if (level >= 5) {
    return {
      title: "Fase 3 - Duelos suaves",
      description: "Ya hay panel individual completo, recompensas personales y duelos semanales."
    };
  }

  if (level >= 3) {
    return {
      title: "Fase 2 - Ritmo individual",
      description: "Se desbloquean stats personales completos y recompensas individuales."
    };
  }

  return {
    title: "Fase 1 - Cooperativo",
    description: "Prioridad total al equipo con salud basica visible y cero friccion."
  };
}

export function getWeeklyDuelSummary(state: ZenStateData) {
  const weekKey = getWeekKey();
  const rows = state.users.map((user) => {
    const completed = state.tasks.filter((task) => {
      if (task.assignedTo !== user.id || !task.completedAt) return false;
      return getWeekKey(task.completedAt) === weekKey && (task.type === "daily" || task.type === "recurring");
    }).length;

    return {
      userId: user.id,
      name: user.name,
      completed
    };
  });

  const top = [...rows].sort((a, b) => b.completed - a.completed);
  const leader = top[0];
  const tie = top[0]?.completed === top[1]?.completed;

  return {
    rows,
    summary: tie
      ? "Semana pareja: ambos se llevan un bonus simbolico al cerrar la semana."
      : `${leader?.name ?? "Alguien"} va arriba. Quien cierre con mas tareas individuales gana bonus XP, pero ambos reciben recompensa.`
  };
}
