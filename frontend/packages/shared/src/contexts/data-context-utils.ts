import type { AppNotification, Project, Universe } from "../types";

export function mergeProjects(...lists: Project[][]): Project[] {
  const byId = new Map<string, Project>();
  for (const project of lists.flat()) if (project?.id) byId.set(project.id, project);
  return [...byId.values()];
}

export function matchesUniverse(notification: AppNotification, universe?: Universe): boolean {
  if (!universe) return true;
  const aliases: Record<string, string[]> = {
    porteur: ["porteur", "project_owner"], project_owner: ["porteur", "project_owner"],
    investisseur: ["investisseur", "investor"], investor: ["investisseur", "investor"],
    moderation: ["moderation", "moderator"], moderator: ["moderation", "moderator"],
  };
  return (aliases[universe] || [universe]).includes(notification.universe);
}

export const isInvestorRole = (role?: string) => role === "investisseur" || role === "investor";
export const isModeratorRole = (role?: string) => role === "moderateur" || role === "moderator" || role === "admin";
