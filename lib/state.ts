export type UserId = "ivan" | "ella";
export type Assignee = "team" | UserId;
export type TaskType = "daily" | "recurring" | "oneTime" | "timed";
export type RewardCategory = "quick" | "major";

export type ActorState = {
  id: string;
  name: string;
  xp: number;
  coins: number;
  coinsClaimedFromXp: number;
  completedDates: string[];
};

export type Task = {
  id: string;
  title: string;
  type: TaskType;
  xpValue: number;
  assignedTo: Assignee;
  schedule?: {
    frequencyDays: number;
  };
  deadline?: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type Reward = {
  id: string;
  title: string;
  costCoins: number;
  category: RewardCategory;
  description: string;
  scope: "individual" | "team";
};

export type RewardTicket = {
  id: string;
  rewardId: string;
  redeemedBy: UserId;
  redeemedAt: string;
  status: "pending" | "done";
};

export type Settings = {
  activeUserId: UserId;
  theme: "zen";
  soundEnabled: boolean;
  onboardingDone: boolean;
};

export type ZenStateData = {
  users: ActorState[];
  team: ActorState;
  tasks: Task[];
  rewards: Reward[];
  tickets: RewardTicket[];
  settings: Settings;
};

export function createEmptyState(): ZenStateData {
  return {
    users: [
      {
        id: "ivan",
        name: "Ivan",
        xp: 0,
        coins: 0,
        coinsClaimedFromXp: 0,
        completedDates: []
      },
      {
        id: "ella",
        name: "Aurora",
        xp: 0,
        coins: 0,
        coinsClaimedFromXp: 0,
        completedDates: []
      }
    ],
    team: {
      id: "team",
      name: "Equipo",
      xp: 0,
      coins: 0,
      coinsClaimedFromXp: 0,
      completedDates: []
    },
    tasks: [],
    rewards: [],
    tickets: [],
    settings: {
      activeUserId: "ivan",
      theme: "zen",
      soundEnabled: false,
      onboardingDone: false
    }
  };
}

function getWeeklyDeadline() {
  const now = new Date();
  const end = new Date(now);
  const day = end.getUTCDay();
  const offset = day === 0 ? 0 : 7 - day;
  end.setUTCDate(end.getUTCDate() + offset);
  end.setUTCHours(23, 59, 59, 999);
  return end.toISOString();
}

export function createSeedState(): ZenStateData {
  const createdAt = new Date().toISOString();

  return {
    users: [
      {
        id: "ivan",
        name: "Ivan",
        xp: 0,
        coins: 0,
        coinsClaimedFromXp: 0,
        completedDates: []
      },
      {
        id: "ella",
        name: "Aurora",
        xp: 0,
        coins: 0,
        coinsClaimedFromXp: 0,
        completedDates: []
      }
    ],
    team: {
      id: "team",
      name: "Equipo",
      xp: 0,
      coins: 0,
      coinsClaimedFromXp: 0,
      completedDates: []
    },
    tasks: [
      {
        id: "task-reset-bed",
        title: "Tender cama",
        type: "daily",
        xpValue: 20,
        assignedTo: "team",
        completedAt: null,
        createdAt
      },
      {
        id: "task-reset-clothes",
        title: "Recoger ropa suelta",
        type: "daily",
        xpValue: 15,
        assignedTo: "team",
        completedAt: null,
        createdAt
      },
      {
        id: "task-reset-desk",
        title: "Escritorio limpio",
        type: "daily",
        xpValue: 15,
        assignedTo: "ivan",
        completedAt: null,
        createdAt
      },
      {
        id: "task-cocina",
        title: "Cocina limpia",
        type: "daily",
        xpValue: 30,
        assignedTo: "team",
        completedAt: null,
        createdAt
      },
      {
        id: "task-orden-10",
        title: "10 min orden con timer",
        type: "daily",
        xpValue: 20,
        assignedTo: "team",
        completedAt: null,
        createdAt
      },
      {
        id: "task-ejercicio-ivan",
        title: "Ejercicio 20 min",
        type: "daily",
        xpValue: 25,
        assignedTo: "ivan",
        completedAt: null,
        createdAt
      },
      {
        id: "task-ejercicio-ella",
        title: "Ejercicio 20 min",
        type: "daily",
        xpValue: 25,
        assignedTo: "ella",
        completedAt: null,
        createdAt
      },
      {
        id: "task-agua-ivan",
        title: "Agua 2L",
        type: "daily",
        xpValue: 15,
        assignedTo: "ivan",
        completedAt: null,
        createdAt
      },
      {
        id: "task-agua-ella",
        title: "Agua 2L",
        type: "daily",
        xpValue: 15,
        assignedTo: "ella",
        completedAt: null,
        createdAt
      },
      {
        id: "task-barrer",
        title: "Barrer o aspirar",
        type: "recurring",
        xpValue: 35,
        assignedTo: "team",
        schedule: { frequencyDays: 3 },
        completedAt: null,
        createdAt
      },
      {
        id: "task-bano",
        title: "Bano ligero",
        type: "recurring",
        xpValue: 35,
        assignedTo: "team",
        schedule: { frequencyDays: 3 },
        completedAt: null,
        createdAt
      },
      {
        id: "task-ropa",
        title: "Lavar ropa",
        type: "recurring",
        xpValue: 45,
        assignedTo: "team",
        schedule: { frequencyDays: 7 },
        completedAt: null,
        createdAt
      },
      {
        id: "task-sabanas",
        title: "Cambiar sabanas",
        type: "recurring",
        xpValue: 45,
        assignedTo: "team",
        schedule: { frequencyDays: 7 },
        completedAt: null,
        createdAt
      },
      {
        id: "task-weekly-food",
        title: "Reto semanal: Sin comida fuera",
        type: "timed",
        xpValue: 60,
        assignedTo: "team",
        deadline: getWeeklyDeadline(),
        completedAt: null,
        createdAt
      },
      {
        id: "task-alacena",
        title: "Organizar alacena",
        type: "oneTime",
        xpValue: 50,
        assignedTo: "team",
        completedAt: null,
        createdAt
      }
    ],
    rewards: [
      {
        id: "reward-cafe",
        title: "Cafe premium",
        costCoins: 2,
        category: "quick",
        description: "Un cafe especial o postre pequeno para celebrar el ritmo.",
        scope: "individual"
      },
      {
        id: "reward-siesta",
        title: "20 min libres",
        costCoins: 3,
        category: "quick",
        description: "Tiempo personal sin pendientes durante 20 minutos.",
        scope: "individual"
      },
      {
        id: "reward-movie",
        title: "Noche de peli",
        costCoins: 6,
        category: "major",
        description: "Plan compartido con pelicula, snacks y descanso.",
        scope: "team"
      },
      {
        id: "reward-date",
        title: "Mini cita zen",
        costCoins: 8,
        category: "major",
        description: "Salir por algo sencillo juntos o pedir algo especial.",
        scope: "team"
      }
    ],
    tickets: [],
    settings: {
      activeUserId: "ivan",
      theme: "zen",
      soundEnabled: false,
      onboardingDone: false
    }
  };
}
