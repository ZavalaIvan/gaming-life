"use client";

import { create } from "zustand";
import { applyXp, getLevelFromXp } from "@/lib/gamification";
import { importJSON, loadState, resetState, restoreDemoState, saveState } from "@/lib/storage";
import { createSeedState, Reward, RewardTicket, Task, UserId, ZenStateData } from "@/lib/state";
import { getTaskStatus } from "@/lib/selectors";

type Toast = {
  id: string;
  message: string;
  tone?: "xp" | "coin" | "streak" | "level";
};

type ZenStore = ZenStateData & {
  hydrated: boolean;
  toasts: Toast[];
  teamLevel: ReturnType<typeof getLevelFromXp>;
  hydrate: () => void;
  completeTask: (taskId: string) => void;
  redeemReward: (rewardId: string) => void;
  markTicketDone: (ticketId: string) => void;
  setActiveUser: (userId: string) => void;
  importState: (raw: string) => void;
  resetApp: () => void;
  clearToast: (toastId: string) => void;
  getPersistedState: () => ZenStateData;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completedAt">) => void;
  updateTask: (taskId: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  addReward: (reward: Omit<Reward, "id">) => void;
  updateReward: (rewardId: string, updates: Partial<Omit<Reward, "id">>) => void;
  dismissOnboarding: () => void;
  toggleSoundEnabled: () => void;
  deleteTask: (taskId: string) => void;
  deleteReward: (rewardId: string) => void;
  restoreDemo: () => void;
};

const seed = createSeedState();

function buildPersisted(state: ZenStore): ZenStateData {
  return {
    users: state.users,
    team: state.team,
    tasks: state.tasks,
    rewards: state.rewards,
    tickets: state.tickets,
    settings: state.settings
  };
}

function pushToast(
  set: (partial: Partial<ZenStore> | ((state: ZenStore) => Partial<ZenStore>)) => void,
  message: string,
  tone: Toast["tone"] = "xp"
) {
  const toastId = crypto.randomUUID();
  set((state) => ({
    toasts: [...state.toasts, { id: toastId, message, tone }]
  }));
  window.setTimeout(() => {
    useZenStore.getState().clearToast(toastId);
  }, 2600);
}

export const useZenStore = create<ZenStore>((set, get) => ({
  ...seed,
  hydrated: false,
  toasts: [],
  teamLevel: getLevelFromXp(seed.team.xp),
  hydrate: () => {
    const state = loadState();
    set({
      ...state,
      hydrated: true,
      teamLevel: getLevelFromXp(state.team.xp)
    });
  },
  completeTask: (taskId) => {
    const now = new Date().toISOString();
    const state = get();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    const status = getTaskStatus(task, new Date(now));
    if (status !== "due") return;

    let nextUsers = state.users;
    let nextTeam = state.team;
    const nextTasks = state.tasks.map((item) => (item.id === taskId ? { ...item, completedAt: now } : item));

    if (task.assignedTo === "team") {
      nextTeam = applyXp(state.team, task.xpValue, now);
    } else {
      nextUsers = state.users.map((user) => (user.id === task.assignedTo ? applyXp(user, task.xpValue, now) : user));
    }

    const teamLevel = getLevelFromXp(nextTeam.xp);
    const currentActorLevel =
      task.assignedTo === "team"
        ? getLevelFromXp(state.team.xp).level
        : getLevelFromXp(state.users.find((user) => user.id === task.assignedTo)?.xp ?? 0).level;
    const nextActorLevel =
      task.assignedTo === "team"
        ? teamLevel.level
        : getLevelFromXp(nextUsers.find((user) => user.id === task.assignedTo)?.xp ?? 0).level;

    set({
      users: nextUsers,
      team: nextTeam,
      tasks: nextTasks,
      teamLevel
    });
    saveState(buildPersisted(get()));
    pushToast(set, `+${task.xpValue} XP | Racha mantenida`, "streak");

    const coinsDelta =
      task.assignedTo === "team"
        ? nextTeam.coins - state.team.coins
        : (nextUsers.find((user) => user.id === task.assignedTo)?.coins ?? 0) -
          (state.users.find((user) => user.id === task.assignedTo)?.coins ?? 0);

    if (coinsDelta > 0) {
      pushToast(set, `+${coinsDelta} moneda${coinsDelta > 1 ? "s" : ""}`, "coin");
    }
    if (nextActorLevel > currentActorLevel) {
      pushToast(
        set,
        `${task.assignedTo === "team" ? "Equipo" : "Nivel personal"} sube a nivel ${nextActorLevel}`,
        "level"
      );
    }
  },
  redeemReward: (rewardId) => {
    const state = get();
    const reward = state.rewards.find((item) => item.id === rewardId);
    if (!reward) return;
    const activeUserId = state.settings.activeUserId;
    const now = new Date().toISOString();

    if (reward.scope === "team") {
      if (state.team.coins < reward.costCoins) return;
      const nextTeam = { ...state.team, coins: state.team.coins - reward.costCoins };
      const ticket: RewardTicket = {
        id: crypto.randomUUID(),
        rewardId,
        redeemedBy: activeUserId,
        redeemedAt: now,
        status: "pending"
      };
      set({
        team: nextTeam,
        tickets: [ticket, ...state.tickets]
      });
    } else {
      const activeUser = state.users.find((user) => user.id === activeUserId);
      if (!activeUser || activeUser.coins < reward.costCoins) return;
      const nextUsers = state.users.map((user) =>
        user.id === activeUserId ? { ...user, coins: user.coins - reward.costCoins } : user
      );
      const ticket: RewardTicket = {
        id: crypto.randomUUID(),
        rewardId,
        redeemedBy: activeUserId,
        redeemedAt: now,
        status: "pending"
      };
      set({
        users: nextUsers,
        tickets: [ticket, ...state.tickets]
      });
    }

    saveState(buildPersisted(get()));
    pushToast(set, `${reward.title} canjeada`, "coin");
  },
  markTicketDone: (ticketId) => {
    set((state) => ({
      tickets: state.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: "done" } : ticket))
    }));
    saveState(buildPersisted(get()));
  },
  setActiveUser: (userId) => {
    if (!["ivan", "ella"].includes(userId)) return;
    set((state) => ({
      settings: {
        ...state.settings,
        activeUserId: userId as UserId
      }
    }));
    saveState(buildPersisted(get()));
  },
  importState: (raw) => {
    try {
      const next = importJSON(raw);
      set({
        ...next,
        teamLevel: getLevelFromXp(next.team.xp)
      });
      pushToast(set, "Backup importado", "xp");
    } catch {
      pushToast(set, "JSON invalido", "xp");
    }
  },
  resetApp: () => {
    const fresh = resetState();
    set({
      ...fresh,
      teamLevel: getLevelFromXp(fresh.team.xp)
    });
    pushToast(set, "Estado reiniciado", "xp");
  },
  clearToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId)
    }));
  },
  getPersistedState: () => buildPersisted(get()),
  addTask: (task) => {
    const nextTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    set((state) => ({
      tasks: [nextTask, ...state.tasks]
    }));
    saveState(buildPersisted(get()));
    pushToast(set, "Tarea creada");
  },
  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    }));
    saveState(buildPersisted(get()));
    pushToast(set, "Tarea actualizada");
  },
  addReward: (reward) => {
    const nextReward: Reward = {
      ...reward,
      id: crypto.randomUUID()
    };
    set((state) => ({
      rewards: [nextReward, ...state.rewards]
    }));
    saveState(buildPersisted(get()));
    pushToast(set, "Recompensa creada");
  },
  updateReward: (rewardId, updates) => {
    set((state) => ({
      rewards: state.rewards.map((reward) => (reward.id === rewardId ? { ...reward, ...updates } : reward))
    }));
    saveState(buildPersisted(get()));
    pushToast(set, "Recompensa actualizada");
  },
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId)
    }));
    saveState(buildPersisted(get()));
    pushToast(set, "Tarea eliminada");
  },
  deleteReward: (rewardId) => {
    set((state) => ({
      rewards: state.rewards.filter((reward) => reward.id !== rewardId),
      tickets: state.tickets.filter((ticket) => ticket.rewardId !== rewardId)
    }));
    saveState(buildPersisted(get()));
    pushToast(set, "Recompensa eliminada");
  },
  dismissOnboarding: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        onboardingDone: true
      }
    }));
    saveState(buildPersisted(get()));
  },
  toggleSoundEnabled: () => {
    const nextEnabled = !get().settings.soundEnabled;
    set((state) => ({
      settings: {
        ...state.settings,
        soundEnabled: nextEnabled
      }
    }));
    saveState(buildPersisted(get()));
    pushToast(set, `Sonido ${nextEnabled ? "activado" : "desactivado"}`, "xp");
  },
  restoreDemo: () => {
    const fresh = restoreDemoState();
    set({
      ...fresh,
      teamLevel: getLevelFromXp(fresh.team.xp)
    });
    pushToast(set, "Demo restaurada", "xp");
  }
}));
