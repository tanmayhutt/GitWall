import type { ContributionWeek } from "@/github";

export function getContributionLevel(count: number): number {
  if (count === 0) return -1;
  if (count <= 3) return 0;
  if (count <= 6) return 1;
  if (count <= 9) return 2;
  return 3;
}

export function calculateStreak(weeks: ContributionWeek[]): number {
  const allDays = [];
  for (let w = weeks.length - 1; w >= 0; w--) {
    const days = weeks[w].contributionDays;
    for (let d = days.length - 1; d >= 0; d--) {
      allDays.push(days[d]);
    }
  }

  // The most recent day may be "today" with no contributions yet; skipping a
  // single trailing zero keeps an active streak from resetting before midnight.
  let start = 0;
  if (allDays.length > 0 && allDays[0].contributionCount === 0) {
    start = 1;
  }

  let streak = 0;
  for (let i = start; i < allDays.length; i++) {
    if (allDays[i].contributionCount > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
