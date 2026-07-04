import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import turf1 from "@/assets/turf-1.jpg";
import turf2 from "@/assets/turf-2.jpg";
import turf3 from "@/assets/turf-3.jpg";
import turf4 from "@/assets/turf-4.jpg";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTurfImage(imageName?: string | null) {
  if (!imageName) return turf1;
  if (imageName.includes("turf-1")) return turf1;
  if (imageName.includes("turf-2")) return turf2;
  if (imageName.includes("turf-3")) return turf3;
  if (imageName.includes("turf-4")) return turf4;
  return turf1;
}
