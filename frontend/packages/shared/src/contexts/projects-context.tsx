export { useAppData as useProjects } from "./data-context";

import { useAppData } from "./data-context";

export function useCurrentPorteurId() {
  return useAppData().currentPorteurId;
}

export { useAppData };
export const currentPorteurId = ""; // legacy compat — use useAppData().currentPorteurId instead
