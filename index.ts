import dotenv from "dotenv";
dotenv.config();

import express from "express";
import db from "./config/pg";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import homeRoutes from "./routes/home.routes";

const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/home", homeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await db.query("SELECT 1");
    console.log("Database connected");
  } catch (err) {
    console.error("DB connection error:", err);
  }

  console.log(`Server running on http://localhost:${PORT}`);
});
