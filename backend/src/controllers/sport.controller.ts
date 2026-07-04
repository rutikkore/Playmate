import { Request, Response } from "express";
import { getAllSports } from "../services/sport.service.js";

export async function getSports(req: Request, res: Response) {
  try {
    const sports = await getAllSports();
    return res.status(200).json({ sports });
  } catch (error) {
    console.error("getSports error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}
