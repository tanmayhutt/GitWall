import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidUsername } from "../src/github.ts";

test("accepts valid GitHub usernames", () => {
  for (const name of ["torvalds", "a", "a-b", "github-user", "user123", "a".repeat(39)]) {
    assert.equal(isValidUsername(name), true, name);
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
    assert.equal(isValidUsername(name), false, name);
  }
});
