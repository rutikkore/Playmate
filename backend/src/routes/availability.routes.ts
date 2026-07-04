import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireProvider } from "../middleware/role.middleware.js";
import { getAvailability, updateAvailability } from "../controllers/availability.controller.js";

const router = Router();

// Public read availability
router.get("/", getAvailability);

// Provider only write availability
router.post("/", requireAuth, requireProvider as any, updateAvailability);

export default router;
