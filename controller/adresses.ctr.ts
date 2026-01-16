import { Request, Response } from "express";
import db from "../config/pg";

export async function listAddresses(req: Request, res: Response) {
  const user = req.user!;
  const { rows } = await db.query("SELECT * FROM addresses WHERE user_id = $1 ORDER BY id", [user.id]);
  res.json(rows);
}

export async function createAddress(req: Request, res: Response) {
  const user = req.user!;
  const { label, full_name, phone, line1, line2, city, state, postal_code, country, is_default } = req.body;
  if (!line1 || !city || !country) return res.status(400).json({ message: "line1, city, country required" });

  if (is_default) {
    await db.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [user.id]);
  }

  const insert = await db.query(
    `INSERT INTO addresses (user_id, label, full_name, phone, line1, line2, city, state, postal_code, country, is_default)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [user.id, label || null, full_name || null, phone || null, line1, line2 || null, city, state || null, postal_code || null, country, is_default || false]
  );

  res.status(201).json(insert.rows[0]);
}

export async function updateAddress(req: Request, res: Response) {
  const user = req.user!;
  const id = Number(req.params.id);
  const { label, full_name, phone, line1, line2, city, state, postal_code, country, is_default } = req.body;

  const check = await db.query("SELECT * FROM addresses WHERE id = $1 AND user_id = $2", [id, user.id]);
  if (!check.rows.length) return res.status(404).json({ message: "Address not found" });

  if (is_default) {
    await db.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [user.id]);
  }

  const upd = await db.query(
    `UPDATE addresses SET label=$1, full_name=$2, phone=$3, line1=$4, line2=$5, city=$6, state=$7, postal_code=$8, country=$9, is_default=$10
     WHERE id=$11 RETURNING *`,
    [label || null, full_name || null, phone || null, line1 || null, line2 || null, city || null, state || null, postal_code || null, country || null, is_default || false, id]
  );

  res.json(upd.rows[0]);
}

export async function deleteAddress(req: Request, res: Response) {
  const user = req.user!;
  const id = Number(req.params.id);
  const check = await db.query("SELECT * FROM addresses WHERE id = $1 AND user_id = $2", [id, user.id]);
  if (!check.rows.length) return res.status(404).json({ message: "Address not found" });

  await db.query("DELETE FROM addresses WHERE id = $1", [id]);
  res.status(204).send();
}