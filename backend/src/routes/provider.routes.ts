import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { attachDBUser, requireProvider } from "../middleware/role.middleware.js";
import {
  getProviderProfile,
  createProviderProfile,
  updateProviderProfile,
} from "../controllers/provider.controller.js";

const router = Router();

// Apply auth to all endpoints
router.use(requireAuth);

router.get("/profile", attachDBUser as any, getProviderProfile);
router.post("/profile", attachDBUser as any, createProviderProfile);
router.put("/profile", requireProvider as any, updateProviderProfile);

export default router;
