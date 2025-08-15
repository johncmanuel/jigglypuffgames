const LOCAL_KEY = "whackapuff_stats";

export interface Stats {
    points: number,
    maxStreak: number
}

export function saveStats(stats: Stats) {
  const prev: Stats = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
  const bestPoints = Math.max(stats.points, prev.points || 0);
  const bestStreak = Math.max(stats.maxStreak, prev.maxStreak || 0);
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify({ points: bestPoints, maxStreak: bestStreak })
  );
}

export function getStats(): Stats {
  if (typeof window === "undefined") return { points: 0, maxStreak: 0 };
  const stats = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
  return {
    points: stats.points || 0,
    maxStreak: stats.maxStreak || 0,
  };
}