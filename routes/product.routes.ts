import { Router } from "express";
import { getProducts, addProduct } from "../controller/product.ctr";
import { auth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getProducts);
router.post("/", auth, addProduct);

export default router;

import { getProductsSafe, addProductValidated } from "../controller/product.ctr";
import { authEnhanced } from "../middleware/auth.middleware";

router.get("/safe", getProductsSafe);

router.post("/create-enhanced", authEnhanced, addProductValidated);