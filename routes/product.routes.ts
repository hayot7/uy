import { Router } from "express";
import {
  getProducts,
  addProduct,
  getProductsSafe,
  addProductValidated
} from "../controller/product.ctr";

import {
  getShopProducts,
  addShopProduct
} from "../controller/shop.ctr";

const router = Router();

router.get("/get_product", getProducts);
router.post("/add_product", addProduct);
router.get("/safe", getProductsSafe);
router.post("/create-enhanced", addProductValidated);
router.get("/shop", getShopProducts);
router.post("/shop", addShopProduct);

export default router;
