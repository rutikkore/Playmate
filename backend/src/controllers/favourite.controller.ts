import { Response } from "express";
import { DBAuthenticatedRequest } from "../middleware/role.middleware.js";
import { getFavourites, addFavourite, removeFavourite } from "../services/favourite.service.js";

export async function getUserFavourites(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const favourites = await getFavourites(req.dbUser.id);
    return res.status(200).json({ favourites });
  } catch (error) {
    console.error("getUserFavourites error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function addFavouriteTurf(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { turfId } = req.body;
    if (!turfId || typeof turfId !== "string") {
      return res.status(400).json({ error: "Missing or invalid turfId" });
    }

    const favourite = await addFavourite(req.dbUser.id, turfId);
    return res.status(201).json({ favourite });
  } catch (error: any) {
    console.error("addFavouriteTurf error:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function removeFavouriteTurf(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { turfId } = req.params;
    if (!turfId || typeof turfId !== "string") {
      return res.status(400).json({ error: "Missing or invalid turfId" });
    }

    await removeFavourite(req.dbUser.id, turfId);
    return res.status(200).json({ message: "Favourite removed successfully" });
  } catch (error: any) {
    console.error("removeFavouriteTurf error:", error);
    if (error.code === "P2025" || (error.message && error.message.includes("Record to delete does not exist"))) {
      return res.status(404).json({ error: "Favourite not found" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
