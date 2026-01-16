import { Request, Response } from "express";
import db from "../config/pg";
import { calculateTotals } from "../utils.ts/totals";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createOrderAndPaymentIntent(
  req: Request,
  res: Response
) {
  const user = req.user!;
  const userId = user.id;
  const { addressId, couponCode, currency = "usd" } = req.body;

  const addrRes = await db.query(
    "SELECT * FROM addresses WHERE id = $1 AND user_id = $2 LIMIT 1",
    [addressId, userId]
  );
  if (!addrRes.rows.length) {
    return res.status(400).json({ message: "Address not found" });
  }

  const cartRes = await db.query(
    "SELECT id FROM carts WHERE user_id = $1",
    [userId]
  );
  if (!cartRes.rows.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const cartId = cartRes.rows[0].id;

  const itemsRes = await db.query(
    "SELECT * FROM cart_items WHERE cart_id = $1",
    [cartId]
  );
  const items = itemsRes.rows;

  if (!items.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    for (const it of items) {
      const variantRes = await client.query(
        "SELECT id, stock FROM product_variants WHERE id = $1 FOR UPDATE",
        [it.product_id]
      );

      if (variantRes.rows.length) {
        const variant = variantRes.rows[0];

        if (variant.stock < it.quantity) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            message: `Insufficient stock for item ${it.name}`,
          });
        }

        await client.query(
          "UPDATE product_variants SET stock = stock - $1 WHERE id = $2",
          [it.quantity, variant.id]
        );
      } else {
        const prodRes = await client.query(
          "SELECT id FROM products WHERE id = $1 FOR UPDATE",
          [it.product_id]
        );

        if (!prodRes.rows.length) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            message: `Product not found for item ${it.name}`,
          });
        }
      }
    }

    const subtotalCents = items.reduce(
      (sum: number, it: any) => sum + it.price_cents * it.quantity,
      0
    );

    let coupon: any = null;
    if (couponCode) {
      const cRes = await client.query(
        "SELECT * FROM coupons WHERE code = $1 AND active = true LIMIT 1",
        [couponCode]
      );

      if (!cRes.rows.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Invalid coupon code" });
      }

      coupon = cRes.rows[0];

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Coupon expired" });
      }
    }

    const couponObj = coupon
      ? { type: coupon.type, amount: coupon.amount }
      : null;

    const totals = calculateTotals(
      subtotalCents,
      0.02,   
      2900,   
      couponObj
    );

    const orderRes = await client.query(
      `
      INSERT INTO orders (
        user_id,
        address_id,
        subtotal_cents,
        discount_cents,
        tax_cents,
        shipping_cents,
        total_cents,
        coupon_code,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending')
      RETURNING *
      `,
      [
        userId,
        addressId,
        totals.subtotalCents,
        totals.discountCents,
        totals.taxCents,
        totals.shippingCents,
        totals.totalCents,
        coupon ? coupon.code : null,
      ]
    );

    const order = orderRes.rows[0];

    for (const it of items) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          name,
          sku,
          price_cents,
          quantity
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [
          order.id,
          it.product_id,
          it.name,
          it.sku || null,
          it.price_cents,
          it.quantity,
        ]
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totals.totalCents,
      currency,
      metadata: {
        orderId: String(order.id),
        userId: String(userId),
      },
    });

    await client.query(
      `
      INSERT INTO payments (
        order_id,
        user_id,
        stripe_payment_intent_id,
        amount_cents,
        currency,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        order.id,
        userId,
        paymentIntent.id,
        totals.totalCents,
        currency,
        paymentIntent.status,
      ]
    );

    await client.query(
      "DELETE FROM cart_items WHERE cart_id = $1",
      [cartId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      order,
      totals,
      payment: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createOrderAndPaymentIntent error:", err);
    return res.status(500).json({ message: "Failed to create order" });
  } finally {
    client.release();
  }
}
