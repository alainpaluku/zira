import type { ProjectSector } from "../types";

export type Sector = ProjectSector;
export const SECTOR_COLORS: Record<ProjectSector, string> = {
  Tech: "#3b82f6", Fintech: "#10b981", Agritech: "#f59e0b", Santé: "#f43f5e",
  Énergie: "#8b5cf6", Éducation: "#6366f1", Logistique: "#06b6d4", Autre: "#6b7280",
};
