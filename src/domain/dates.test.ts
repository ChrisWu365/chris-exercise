import { describe, expect, it } from "vitest";
import { addDays, aucklandToday, formatDate } from "./dates";

describe("Auckland dates", () => {
  it.each([
    ["2026-11-05T10:59:00Z", "2026-11-05"],
    ["2026-11-05T11:00:00Z", "2026-11-06"],
    ["2026-07-01T11:59:00Z", "2026-07-01"],
    ["2026-07-01T12:00:00Z", "2026-07-02"],
  ])("AC-04: at %s the Auckland date is %s", (now, expected) => {
    expect(aucklandToday(new Date(now))).toBe(expected);
  });

  it("AC-04: a package starting in 2 days, on Auckland date 2026-11-06, starts on 2026-11-08", () => {
    expect(addDays("2026-11-06", 2)).toBe("2026-11-08");
  });

  it("adds days across the end of a year", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it.each([
    ["2026-11-08", "8 Nov 2026"],
    ["2027-01-01", "1 Jan 2027"],
    ["2026-12-31", "31 Dec 2026"],
  ])("AC-04: %s is shown as %s", (date, expected) => {
    expect(formatDate(date)).toBe(expected);
  });
});
