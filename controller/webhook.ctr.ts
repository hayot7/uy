import { Request, Response } from "express";
import db from "../config/pg";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ✅ to‘g‘ri

export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return res.status(500).send("Webhook secret not configured");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent((req as any).rawBody, sig || "", webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      const paymentIntentId = pi.id;

      await db.query(
        "UPDATE payments SET status = $1 WHERE stripe_payment_intent_id = $2",
        ["succeeded", paymentIntentId]
      );

      if (orderId) {
        await db.query("UPDATE orders SET status = $1 WHERE id = $2", ["paid", Number(orderId)]);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = pi.id;
      const orderId = pi.metadata?.orderId;

      await db.query(
        "UPDATE payments SET status = $1 WHERE stripe_payment_intent_id = $2",
        ["failed", paymentIntentId]
      );

      if (orderId) {
        await db.query("UPDATE orders SET status = $1 WHERE id = $2", ["cancelled", Number(orderId)]);

        const itemsRes = await db.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
          [Number(orderId)]
        );
        for (const it of itemsRes.rows) {
          await db.query(
            "UPDATE product_variants SET stock = stock + $1 WHERE id = $2",
            [it.quantity, it.product_id]
          );
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    res.status(500).send("Webhook handler error");
  }
}



/////jgudsfgsdafubadhfbhabd