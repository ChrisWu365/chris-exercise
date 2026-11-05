// Exact decimal arithmetic: quantities are held as a BigInt count of thousandths,
// so they never become JavaScript numbers.
const thousand = 1000n;

export function toThousandths(quantity: string): bigint {
  const [whole, decimals = ""] = quantity.split(".");
  return BigInt(whole + decimals.padEnd(3, "0"));
}

export function fromThousandths(thousandths: bigint): string {
  const whole = thousandths / thousand;
  const decimals = (thousandths % thousand).toString().padStart(3, "0").replace(/0+$/, "");
  return decimals ? `${whole}.${decimals}` : `${whole}`;
}
