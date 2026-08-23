const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format a decimal-as-string (Prisma Decimal serialized) as IDR currency. */
export function formatIDR(decimalString: string | number): string {
  const value = typeof decimalString === "string" ? Number.parseFloat(decimalString) : decimalString;
  if (!Number.isFinite(value)) return "—";
  return idrFormatter.format(value);
}
