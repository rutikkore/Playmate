import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePlayer } from "../middleware/role.middleware.js";
import {
  getUserFavourites,
  addFavouriteTurf,
  removeFavouriteTurf,
} from "../controllers/favourite.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requirePlayer as any);

router.get("/", getUserFavourites);
router.post("/", addFavouriteTurf);
router.delete("/:turfId", removeFavouriteTurf);

export default router;
