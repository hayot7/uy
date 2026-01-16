import { Router } from "express";
import { listAddresses, createAddress, updateAddress, deleteAddress } from "../controller/adresses.ctr";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", listAddresses);
router.post("/", createAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;