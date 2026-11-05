import { describe, expect, it } from "vitest";
import { fromThousandths, toThousandths } from "./quantity";

describe("Spec section 2: quantities as thousandths", () => {
  it.each([
    ["0.1", 100n],
    ["2", 2000n],
    ["1.005", 1005n],
    ["0", 0n],
    // The database returns numeric(12,3) values with all three decimal places.
    ["20.000", 20000n],
    ["0.300", 300n],
    ["999999999.999", 999999999999n],
  ])("reads %s exactly", (text, thousandths) => {
    expect(toThousandths(text)).toBe(thousandths);
  });

  it.each([
    [300n, "0.3"],
    [25000n, "25"],
    [1n, "0.001"],
    [1005n, "1.005"],
    [1500n, "1.5"],
    [0n, "0"],
    [999999999999n, "999999999.999"],
  ])("writes %s thousandths with trailing zeros removed", (thousandths, text) => {
    expect(fromThousandths(thousandths)).toBe(text);
  });
});
