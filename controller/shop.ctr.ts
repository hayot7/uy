import { Request, Response } from "express";
import db from "../config/db";

export const getShopProducts = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      "SELECT * FROM products ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("getShopProducts error:", error);
    res.status(500).json({ msg: "Failed to fetch shop products" });
  }
};

export const addShopProduct = async (req: Request, res: Response) => {
  try {
    const { title, price, category } = req.body;

    const result = await db.query(
      `INSERT INTO products (title, price, category)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, price, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("addShopProduct error:", error);
    res.status(500).json({ msg: "Failed to add product" });
  }
};
