import type { ProjectStatus } from "../types";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Actif",
  pending: "En review",
  draft: "Brouillon",
  funded: "Financé",
  suspended: "Suspendu",
};

export const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-orange-100 text-orange-700",
  funded: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-600",
  suspended: "bg-red-100 text-red-700",
};

export const USER_STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  pending_kyc: "KYC en attente",
  suspended: "Suspendu",
};

export const USER_STATUS_STYLE: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending_kyc: "bg-orange-100 text-orange-700",
  suspended: "bg-red-100 text-red-700",
};
