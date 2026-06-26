import { test, expect } from "bun:test";
import { isValidUsername } from "../src/github";

test("accepts valid GitHub usernames", () => {
  for (const name of ["torvalds", "a", "a-b", "github-user", "user123", "a".repeat(39)]) {
    expect(isValidUsername(name)).toBe(true);
  }
});

test("rejects invalid GitHub usernames", () => {
  for (const name of [
    "",
    "-abc",
    "abc-",
    "a--b",
    "a_b",
    "a.b",
    "a b",
    "a".repeat(40),
  ]) {
    expect(isValidUsername(name)).toBe(false);
  }
});
