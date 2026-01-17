import { Router } from "express";
import { checkoutOrder } from "../controller/order.ctr";
import auth from "../middleware/auth.middleware";

const router = Router();

router.post("/checkout", auth, checkoutOrder);

export default router;
