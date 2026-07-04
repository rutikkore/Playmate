import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireProvider } from "../middleware/role.middleware.js";
import {
  getTurfs,
  getTurf,
  createNewTurf,
  updateExistingTurf,
  deleteTurf,
} from "../controllers/turf.controller.js";

const router = Router();

// Public / Read routes
router.get("/", getTurfs);
router.get("/:id", getTurf);

// Protected Provider routes
router.post("/", requireAuth, requireProvider as any, createNewTurf);
router.put("/:id", requireAuth, requireProvider as any, updateExistingTurf);
router.delete("/:id", requireAuth, requireProvider as any, deleteTurf);

export default router;
