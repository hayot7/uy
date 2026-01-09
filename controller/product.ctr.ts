import { Request, Response } from "express";
import { Product } from "../models/product.model";

export const getProducts = async (req: Request, res: Response) => {
    const products = await Product.find();
    res.json(products);
};

export const addProduct = async (req: Request, res: Response) => {
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
};

export const getProductsSafe = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("getProductsSafe error:", error);
    res.status(500).json({ msg: "Failed to fetch products", error });
  }
};

export const addProductValidated = async (req: Request, res: Response) => {
  try {
    const { title, price, category, description, image } = req.body;
    if (!title || typeof price !== "number" || !category) {
      return res.status(400).json({ msg: "title (string), price (number), category (string) required" });
    }
    const created = await Product.create({ title, price, category, description, image });
    res.status(201).json(created);
  } catch (error) {
    console.error("addProductValidated error:", error);
    res.status(500).json({ msg: "Failed to create product", error });
  }
};