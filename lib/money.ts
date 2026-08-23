/**
 * Money boundary helpers. Prices cross the server/client boundary as strings
 * (Prisma Decimal serialized); all arithmetic happens on integer rupiah.
 * IDR has no practical minor unit, so the rupiah IS the minor unit here.
 */

/** Parse a decimal-string price into integer rupiah (rounds sub-rupiah dust). */
export function toRupiahInt(decimalString: string): number {
  const value = Number.parseFloat(decimalString);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

/** Format an integer rupiah amount without currency symbol (for line totals). */
export function formatAmount(amountInt: number): string {
  return new Intl.NumberFormat("id-ID").format(amountInt);
}
