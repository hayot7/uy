import { Request, Response } from "express";

export const applyCoupon = async (req: Request, res: Response) => {
  res.json({ message: "Coupon applied" });
};

export const createOrder = async (req: Request, res: Response) => {
  res.json({ message: "Order created" });
};

export const createOrderAndPaymentIntent = async (
  req: Request,
  res: Response
) => {
  res.json({ message: "Order + PaymentIntent created" });
};
