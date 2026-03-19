import Decimal from "break_infinity.js";

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

/** Format a plain number with compact K/M/B/T notation. */
export function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return compact.format(n);
}

/** Format a Decimal, falling back to exponential notation for values ≥ 1e15. */
export function fmt(d: Decimal | number): string {
  const n = typeof d === "number" ? d : d.toNumber();
  if (!Number.isFinite(n)) return "???";
  if (d instanceof Decimal && d.gte(new Decimal("1e15"))) {
    return d.toExponential(2);
  }
  return compact.format(n);
}
