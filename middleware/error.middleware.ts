import { Request, Response, NextFunction } from "express";

export default function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const payload: any = { error: true, message };
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}