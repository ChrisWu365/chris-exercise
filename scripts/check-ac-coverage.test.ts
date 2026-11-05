import { describe, expect, it } from "vitest";
import { findUncovered } from "./check-ac-coverage.ts";

const spec = "- **AC-01** Given one thing\n- **AC-02** Given another\nAC-03 is only mentioned, and isn't a criterion.";

describe("Pipeline: every criterion has a test", () => {
  it("passes when every criterion's ID is in a test title", () => {
    const tests = ['it("AC-01: does one thing")', 'test("AC-02: does another")'];
    expect(findUncovered(spec, tests)).toEqual([]);
  });

  it("names a criterion with no test", () => {
    expect(findUncovered(spec, ['it("AC-01: does one thing")'])).toEqual(["AC-02"]);
  });

  it("doesn't count an ID that appears outside a test title", () => {
    expect(findUncovered(spec, ['it("AC-01: x") // see AC-02'])).toEqual(["AC-02"]);
  });
});
