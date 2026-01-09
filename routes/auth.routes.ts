import { Router } from "express";
import { register, login } from "../controller/auth.ctr";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;

import { registerWithToken, loginWithToken } from "../controller/auth.ctr";

router.post("/register-token", registerWithToken);
router.post("/login-token", loginWithToken);