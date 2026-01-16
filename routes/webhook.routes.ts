import { Router } from "express";
import { stripeWebhookHandler } from "../controller/webhook.ctr";

const router = Router();

router.post("/stripe", stripeWebhookHandler);

export default router;