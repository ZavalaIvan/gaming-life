import { ActorState } from "@/lib/state";

export function getXpRequiredForLevel(level: number) {
  return 200 + (level - 1) * 50;
}

export function getLevelFromXp(totalXp: number) {
  let remaining = totalXp;
  let level = 1;

  while (remaining >= getXpRequiredForLevel(level)) {
    remaining -= getXpRequiredForLevel(level);
    level += 1;
  }

  return {
    level,
    levelXp: remaining,
    nextLevelXp: getXpRequiredForLevel(level)
  };
}

export function getDayKey(value: string | Date = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function getWeekKey(value: string | Date = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  const cloned = new Date(date);
  cloned.setUTCHours(0, 0, 0, 0);
  const day = cloned.getUTCDay() || 7;
  cloned.setUTCDate(cloned.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(cloned.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((cloned.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${cloned.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getStreak(dates: string[], now = new Date()) {
  const unique = Array.from(new Set(dates)).sort().reverse();
  if (unique.length === 0) return 0;

  const today = getDayKey(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = getDayKey(yesterdayDate);

  if (unique[0] !== today && unique[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let cursor = new Date(`${unique[0]}T00:00:00.000Z`);

  for (let index = 1; index < unique.length; index += 1) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (getDayKey(cursor) !== unique[index]) {
      break;
    }
    streak += 1;
  }

  return streak;
}

export function applyXp(actor: ActorState, amount: number, nowIso: string) {
  const nextXp = actor.xp + amount;
  const earnedCoins = Math.floor(nextXp / 100);
  const newCoins = Math.max(0, earnedCoins - actor.coinsClaimedFromXp);
  const completedDay = getDayKey(nowIso);

  return {
    ...actor,
    xp: nextXp,
    coins: actor.coins + newCoins,
    coinsClaimedFromXp: earnedCoins,
    completedDates: actor.completedDates.includes(completedDay)
      ? actor.completedDates
      : [...actor.completedDates, completedDay]
  };
}
