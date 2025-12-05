import { ShareInput } from "./types";

export function to2(n: number) {
  return Number(n.toFixed(2));
}

export function to3(n: number) {
  return Number(n.toFixed(3));
}

// Igual siempre a 2 decimales (backend cierra total con ajuste del último)

export function sumFixed(shares: ShareInput[]) {
  return to2(
    shares.filter(s => s.type === "FIXED").reduce((a, b) => a + (b.amount || 0), 0)
  );
}

export function sumPercent(shares: ShareInput[]) {
  return shares
    .filter(s => s.type === "PERCENTAGE")
    .reduce((a, b) => a + (b.amount || 0), 0);
}

export function remainder(total: number, shares: ShareInput[]) {
  return to2(total - sumFixed(shares));
}

export function calculatePercentageAmounts(total: number, shares: ShareInput[]) {
  const rem = remainder(total, shares);
  return shares.map(s =>
    s.type === "PERCENTAGE" ? { ...s, amount: to2((s.amount / 100) * rem) } : s
  );
}

export function calculateEqualAmounts(total: number, shares: ShareInput[]) {
  const others = shares.filter(s => s.type !== "EQUAL");
  const equalers = shares.filter(s => s.type === "EQUAL");
  const rem = remainder(total, shares);
  if (equalers.length === 0) return shares;
  const base = rem / equalers.length;
  const rounded = equalers.map(s => ({ ...s, amount: to2(base) }));
  const diff = to2(rem - rounded.reduce((a, b) => a + b.amount, 0));
  if (rounded.length > 0) rounded[rounded.length - 1].amount = to2(rounded[rounded.length - 1].amount + diff);
  return [...others, ...rounded];
}

export function hasPercent(shares: ShareInput[]) {
  return shares.some(s => s.type === "PERCENTAGE");
}

export function hasEqual(shares: ShareInput[]) {
  return shares.some(s => s.type === "EQUAL");
}

export function percentSumIs100(shares: ShareInput[]) {
  const sum = sumPercent(shares);
  return Math.round(sum) === 100 && Math.abs(sum - 100) < 1e-9;
}

export function hasDuplicates(shares: ShareInput[]) {
  const ids = new Set<string>();
  for (const s of shares) {
    if (ids.has(s.userId)) return true;
    ids.add(s.userId);
  }
  return false;
}

export function exceedsTotal(total: number, shares: ShareInput[]) {
  const fixed = sumFixed(shares);
  return fixed > to2(total);
}

export function sumShares(shares: ShareInput[]) {
  return to2(shares.reduce((a, b) => a + (b.amount || 0), 0));
}

export function uniqueByUserId(shares: ShareInput[]): ShareInput[] {
  const seen = new Set<string>();
  const out: ShareInput[] = [];
  for (const s of shares) {
    if (!seen.has(s.userId)) {
      seen.add(s.userId);
      out.push(s);
    }
  }
  return out;
}