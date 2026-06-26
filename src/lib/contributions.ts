import type { ContributionDay, ContributionWeek } from "@/github";

export function getContributionLevel(count: number): number {
  if (count === 0) return -1;
  if (count <= 3) return 0;
  if (count <= 6) return 1;
  if (count <= 9) return 2;
  return 3;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// `today` is injectable so the result is deterministic in tests; it defaults to
// the current UTC date.
export function calculateStreak(
  weeks: ContributionWeek[],
  today: string = todayISO()
): number {
  const allDays: ContributionDay[] = [];
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      allDays.push(day);
    }
  }

  // GitHub returns whole calendar weeks, so the most recent week is padded with
  // future-dated zero days (and today may also be zero before the first commit
  // lands). Walk newest → oldest: skip anything dated today or later, then count
  // consecutive contributing days. A *past* zero day ends the streak.
  let streak = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    const { date, contributionCount } = allDays[i];
    if (date > today) continue; // future padding day
    if (contributionCount > 0) {
      streak++;
    } else if (date === today) {
      continue; // today, not committed yet — don't break the streak
    } else {
      break; // a past day with no contributions ends the streak
    }
  }
  return streak;
}
