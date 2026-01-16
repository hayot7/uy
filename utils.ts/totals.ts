export type Totals = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}

export function calculateTotals(
  subtotalCents: number,
  taxRate = 0.02,
  shippingFlatCents = 2900,
  coupon?: { type: "fixed" | "percent"; amount: number } | null
): Totals {
  let discountCents = 0;
  if (coupon) {
    if (coupon.type === "fixed") {
      discountCents = coupon.amount;
    } else if (coupon.type === "percent") {
      discountCents = Math.round((subtotalCents * coupon.amount) / 100);
    }
    if (discountCents > subtotalCents) discountCents = subtotalCents;
  }

  const taxedBase = subtotalCents - discountCents;
  const taxCents = Math.round(taxedBase * taxRate);
  const shippingCents = subtotalCents > 0 ? shippingFlatCents : 0;
  const totalCents = taxedBase + taxCents + shippingCents;

  return {
    subtotalCents,
    discountCents,
    taxCents,
    shippingCents,
    totalCents,
  };
}