export function centsToDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}
export function decimalToCents(amount: number): number {
  return Math.round(amount * 100);
}