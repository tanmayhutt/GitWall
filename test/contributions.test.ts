import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getContributionLevel,
  calculateStreak,
} from "../src/lib/contributions.ts";

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
  assert.equal(getContributionLevel(0), -1);
  assert.equal(getContributionLevel(1), 0);
  assert.equal(getContributionLevel(3), 0);
  assert.equal(getContributionLevel(4), 1);
  assert.equal(getContributionLevel(6), 1);
  assert.equal(getContributionLevel(7), 2);
  assert.equal(getContributionLevel(9), 2);
  assert.equal(getContributionLevel(10), 3);
  assert.equal(getContributionLevel(500), 3);
});

test("calculateStreak counts consecutive recent days", () => {
  // Most recent day is the last entry; streak of 3 trailing positives.
  assert.equal(calculateStreak([week(0, 1, 2, 3)]), 3);
});

test("calculateStreak skips a single trailing zero (today)", () => {
  // Trailing zero is treated as "today, not committed yet" and skipped.
  assert.equal(calculateStreak([week(5, 4, 3, 0)]), 3);
});

test("calculateStreak breaks on a gap", () => {
  assert.equal(calculateStreak([week(9, 0, 2, 1)]), 2);
});

test("calculateStreak is zero with no contributions", () => {
  assert.equal(calculateStreak([week(0, 0, 0)]), 0);
});

test("calculateStreak handles empty input", () => {
  assert.equal(calculateStreak([]), 0);
});
