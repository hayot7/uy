import { Request, Response } from "express";
import db from "../config/pg";
import { Totals, calculateTotals } from "../utils.ts/totals";

async function getOrCreateCartId(userId: number): Promise<number> {
  const { rows } = await db.query("SELECT id FROM carts WHERE user_id = $1", [userId]);
  if (rows.length) return rows[0].id;
  const insert = await db.query("INSERT INTO carts (user_id) VALUES ($1) RETURNING id", [userId]);
  return insert.rows[0].id;
}

export async function getCart(req: Request, res: Response) {
  const user = req.user!;
  const userId = user.id;

  const cartRes = await db.query("SELECT id FROM carts WHERE user_id = $1", [userId]);
  if (!cartRes.rows.length) {
    return res.json({ items: [], meta: { subtotalCents: 0 } });
  }
  const cartId = cartRes.rows[0].id;
  const itemsRes = await db.query("SELECT * FROM cart_items WHERE cart_id = $1 ORDER BY id", [cartId]);
  const items = itemsRes.rows;

  const subtotalCents = items.reduce((s: number, it: any) => s + it.price_cents * it.quantity, 0);
  
  const totals: Totals = calculateTotals(subtotalCents);

  res.json({ items, totals });
}

export async function addToCart(req: Request, res: Response) {
  const user = req.user!;
  const userId = user.id;
  const { productId, name, sku, priceCents, quantity = 1, imageUrl } = req.body;

  if (!productId || !priceCents || !name) {
    return res.status(400).json({ message: "productId, name and priceCents are required" });
  }

  const cartId = await getOrCreateCartId(userId);

  // If same product exists, increment quantity
  const existing = await db.query(
    "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1",
    [cartId, productId]
  );

  if (existing.rows.length) {
    const existingId = existing.rows[0].id;
    const newQty = existing.rows[0].quantity + Number(quantity);
    await db.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [newQty, existingId]);
    const updated = await db.query("SELECT * FROM cart_items WHERE id = $1", [existingId]);
    return res.status(200).json({ item: updated.rows[0] });
  }

  const insert = await db.query(
    `INSERT INTO cart_items (cart_id, product_id, name, sku, price_cents, quantity, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [cartId, productId, name, sku || null, priceCents, quantity, imageUrl || null]
  );

  res.status(201).json({ item: insert.rows[0] });
}

export async function updateCartItem(req: Request, res: Response) {
  const user = req.user!;
  const userId = user.id;
  const itemId = Number(req.params.itemId);
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be an integer >= 1" });
  }

  // Ensure item belongs to user's cart
  const itemRes = await db.query(
    `SELECT ci.* FROM cart_items ci
     JOIN carts c ON c.id = ci.cart_id
     WHERE ci.id = $1 AND c.user_id = $2`,
    [itemId, userId]
  );
  if (!itemRes.rows.length) return res.status(404).json({ message: "Item not found" });

  await db.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [quantity, itemId]);
  const updated = await db.query("SELECT * FROM cart_items WHERE id = $1", [itemId]);
  res.json({ item: updated.rows[0] });
}

export async function removeCartItem(req: Request, res: Response) {
  const user = req.user!;
  const userId = user.id;
  const itemId = Number(req.params.itemId);

  const itemRes = await db.query(
    `SELECT ci.* FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE ci.id = $1 AND c.user_id = $2`,
    [itemId, userId]
  );
  if (!itemRes.rows.length) return res.status(404).json({ message: "Item not found" });

  await db.query("DELETE FROM cart_items WHERE id = $1", [itemId]);
  res.status(204).send();
}

export async function clearCart(req: Request, res: Response) {
  const user = req.user!;
  const userId = user.id;
  await db.query(
    `DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)`,
    [userId]
  );
  res.status(204).send();
}