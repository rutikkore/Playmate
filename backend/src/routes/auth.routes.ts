import { Router } from "express";
import { register, login, googleLogin, phoneLogin } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/phone", phoneLogin);

export default router;
