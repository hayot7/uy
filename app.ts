import express from "express";
import cors from "cors";
import "express-async-errors";
import routes from "./routes/product.routes";
import errorMiddleware from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);
app.get("/health", (req, res) => res.json({ ok: true, timestamp: Date.now() }));
app.use(errorMiddleware);

export default app;