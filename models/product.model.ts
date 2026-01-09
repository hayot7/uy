import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: String,
    image: String
});

export const Product = mongoose.model("Product", productSchema);

import { Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
