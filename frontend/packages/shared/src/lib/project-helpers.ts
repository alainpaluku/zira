import type { FundraisingGoal, Project, ProjectStatus } from "../types";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_STYLE } from "./status";

export type ProjectListItem = Pick<
  Project,
  "id" | "name" | "sector" | "status" | "logo" | "poster" | "team" | "fundraising"
>;

export interface ProjectStatusPresentation {
  label: string;
  className: string;
}

export function getFundingProgress(
  fundraising: Pick<FundraisingGoal, "raisedAmount" | "targetAmountUSD">,
): number {
  if (fundraising.targetAmountUSD <= 0) return 0;

  const progress = Math.round(
    (fundraising.raisedAmount / fundraising.targetAmountUSD) * 100,
  );
  return Math.min(100, Math.max(0, progress));
}

export function getProjectStatusPresentation(
  status: ProjectStatus,
): ProjectStatusPresentation {
  const safeStatus = Object.prototype.hasOwnProperty.call(PROJECT_STATUS_LABEL, status) ? status : "draft";
  return {
    label: PROJECT_STATUS_LABEL[safeStatus],
    className: PROJECT_STATUS_STYLE[safeStatus],
  };
}
