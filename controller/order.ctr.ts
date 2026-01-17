import { Request, Response } from "express";
import Order from "../models/order.model";

export const checkoutOrder = async (req: Request, res: Response) => {
  try {
    const { products, address, shippingMethod, paymentMethod } = req.body;

    let shippingPrice = 0;
    if (shippingMethod === "EXPRESS") shippingPrice = 8.5;
    if (shippingMethod === "SCHEDULE") shippingPrice = 5;

    const subtotal = products.reduce(
      (sum: number, p: any) => sum + p.price * p.qty,
      0
    );

    const tax = subtotal * 0.05;
    const total = subtotal + tax + shippingPrice;

    const order = await Order.create({
      userId: req.user.id,
      products,
      address,
      shippingMethod,
      shippingPrice,
      paymentMethod,
      subtotal,
      tax,
      total
    });

    res.status(201).json(order);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
