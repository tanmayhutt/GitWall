import { test, expect } from "bun:test";
import { getContributionLevel, calculateStreak } from "../src/lib/contributions";

// Build one week of sequential January 2026 days from the given counts.
// Day N gets date 2026-01-0N (callers stay within the first 9 days).
function week(...counts: number[]) {
  return {
    contributionDays: counts.map((contributionCount, i) => ({
      contributionCount,
      date: `2026-01-0${i + 1}`,
      color: "#000",
    })),
  };
}

test("getContributionLevel maps counts to levels", () => {
  expect(getContributionLevel(0)).toBe(-1);
  expect(getContributionLevel(1)).toBe(0);
  expect(getContributionLevel(3)).toBe(0);
  expect(getContributionLevel(4)).toBe(1);
  expect(getContributionLevel(6)).toBe(1);
  expect(getContributionLevel(7)).toBe(2);
  expect(getContributionLevel(9)).toBe(2);
  expect(getContributionLevel(10)).toBe(3);
  expect(getContributionLevel(500)).toBe(3);
});

test("calculateStreak counts consecutive recent days", () => {
  expect(calculateStreak([week(0, 1, 2, 3)], "2026-01-04")).toBe(3);
});

test("calculateStreak skips today when not yet committed", () => {
  // 2026-01-04 is "today" with 0 contributions — skipped, not a break.
  expect(calculateStreak([week(5, 4, 3, 0)], "2026-01-04")).toBe(3);
});

test("calculateStreak skips multiple future-dated padding days", () => {
  // The week is padded with future zero days (05–07) and a zero today (04);
  // none of these should reset an active 3-day streak (01–03).
  expect(calculateStreak([week(1, 2, 3, 0, 0, 0, 0)], "2026-01-04")).toBe(3);
});

test("calculateStreak breaks on a past gap", () => {
  expect(calculateStreak([week(9, 0, 2, 1)], "2026-01-04")).toBe(2);
});

test("calculateStreak is zero with no contributions", () => {
  expect(calculateStreak([week(0, 0, 0)], "2026-01-03")).toBe(0);
});

test("calculateStreak handles empty input", () => {
  expect(calculateStreak([], "2026-01-04")).toBe(0);
});
