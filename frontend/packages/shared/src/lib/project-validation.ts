import { z } from "zod";
import type { ProjectSector } from "../types";

export const PROJECT_SECTORS: [ProjectSector, ...ProjectSector[]] = [
  "Tech",
  "Fintech",
  "Agritech",
  "Santé",
  "Énergie",
  "Éducation",
  "Logistique",
  "Autre",
];

export const SECTORS = PROJECT_SECTORS;

export const infoFields = {
  name: z
    .string()
    .trim()
    .min(2, "Le nom du projet doit comporter au moins 2 caractères")
    .max(120, "Le nom du projet ne doit pas dépasser 120 caractères"),
  shortDescription: z
    .string()
    .trim()
    .min(5, "Veuillez fournir une brève description du projet")
    .max(2500, "La description ne doit pas dépasser 2500 caractères"),
  sector: z.enum(PROJECT_SECTORS, {
    message: "Veuillez sélectionner un secteur d'activité valide",
  }),
  targetMarket: z
    .string()
    .trim()
    .min(1, "Veuillez préciser le marché cible")
    .max(200, "Le marché cible ne doit pas dépasser 200 caractères"),
  videoUrl: z
    .string()
    .trim()
    .optional(),
  logo: z.string().optional(),
  poster: z.string().optional(),
};

export const stepInfoSchema = z.object(infoFields);
export type StepInfoData = z.infer<typeof stepInfoSchema>;

export const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Le nom du membre est requis"),
  role: z.string().trim().min(1, "Le rôle du membre est requis"),
  photo: z.string().optional(),
});

export const stepTeamSchema = z.object({
  team: z
    .array(teamMemberSchema)
    .min(1, "L'équipe doit comporter au moins un membre fondateur"),
});

export type StepTeamData = z.infer<typeof stepTeamSchema>;

export const stepEquitySchema = z.object({
  porteurEquity: z
    .number()
    .min(1, "La part fondateurs doit être d'au moins 1%")
    .max(100, "La part fondateurs ne peut pas dépasser 100%"),
});

export type StepEquityData = z.infer<typeof stepEquitySchema>;

export const fundingFields = {
  targetAmountUSD: z
    .number()
    .min(100, "L'objectif de financement minimum est de 100 $ USD")
    .max(100000000, "L'objectif de financement ne peut excéder 100 000 000 $ USD"),
  equityPercent: z
    .number()
    .min(1, "Le capital cédé doit être d'au moins 1%")
    .max(100, "Le capital cédé ne peut excéder 100%"),
  minInvestment: z
    .number()
    .min(1, "Le ticket d'investissement minimum est de 1 $ USD"),
  maxInvestment: z
    .number()
    .min(1, "Le ticket maximum doit être d'au moins 1 $ USD"),
};

export const stepFundingSchema = z.object(fundingFields);

export type StepFundingData = z.infer<typeof stepFundingSchema>;

export const completeProjectSchema = z.object({
  name: infoFields.name,
  shortDescription: infoFields.shortDescription,
  sector: infoFields.sector,
  targetMarket: infoFields.targetMarket,
  videoUrl: infoFields.videoUrl,
  logo: infoFields.logo,
  poster: infoFields.poster,
  team: z.array(teamMemberSchema).min(1, "Au moins un membre de l'équipe requis"),
  porteurEquity: stepEquitySchema.shape.porteurEquity,
  fundraising: z.object(fundingFields),
}).superRefine((value, ctx) => {
  const { targetAmountUSD, equityPercent, minInvestment, maxInvestment } = value.fundraising;
  if (value.porteurEquity + equityPercent > 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fundraising", "equityPercent"], message: "La part fondateurs et la part proposée ne peuvent pas dépasser 100 %" });
  }
  if (maxInvestment < minInvestment) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fundraising", "maxInvestment"], message: "Le ticket maximum doit être supérieur ou égal au ticket minimum" });
  }
  if (minInvestment > targetAmountUSD) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fundraising", "minInvestment"], message: "Le ticket minimum ne peut pas dépasser l'objectif de financement" });
  }
});

export type CompleteProjectData = z.infer<typeof completeProjectSchema>;

export function extractZodErrors(result: { success: boolean; error?: z.ZodError }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!result.success && result.error) {
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!errors[key]) {
        errors[key] = issue.message;
      }
    }
  }
  return errors;
}
