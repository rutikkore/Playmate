import { Router } from "express";
import { getSports } from "../controllers/sport.controller.js";

const router = Router();

router.get("/", getSports);

export default router;
