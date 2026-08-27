import React from "react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@zira/ui";
import { CheckCircle2, Users, DollarSign, PieChart as PieIcon } from "@/lib/hero-icons-compat";
import { formatUSD, type ProjectStatus } from "@zira/shared";
import type { FormTeamMember } from "./types";

interface StepReviewProps {
  name: string;
  sector: string;
  targetMarket: string;
  shortDescription: string;
  poster?: string;
  logo?: string;
  team: FormTeamMember[];
  targetAmount: number;
  equityPercent: number;
  minInvestment: number;
  maxInvestment: number;
  projectStatusToCreate: ProjectStatus;
  setProjectStatusToCreate: (s: ProjectStatus) => void;
  submitting: boolean;
  onSubmit: () => void;
}

/**
 * Étape 5 : Récapitulatif global avant validation finale et publication.
 */
export function StepReview({
  name, sector, targetMarket, shortDescription, poster, logo, team,
  targetAmount, equityPercent, minInvestment, maxInvestment,
  projectStatusToCreate, setProjectStatusToCreate, submitting, onSubmit,
}: StepReviewProps) {
  const activeMembers = team.filter((m) => m.name.trim());

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-6 shadow-xs">
      <div>
        <h2 className="text-base font-semibold">Récapitulatif & Finalisation</h2>
        <p className="text-sm text-muted-foreground">Vérifiez vos informations avant de les soumettre à la validation ZIRA.</p>
      </div>

      <div className="rounded-xl border overflow-hidden bg-background">
        <div className="h-32 w-full bg-muted/40 relative">
          {poster ? <img src={poster} alt={name} className="w-full h-full object-cover" /> : null}
          <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full font-semibold">{sector}</div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg">{name || "Nom du projet non renseigné"}</h3>
          <p className="text-xs text-muted-foreground">{shortDescription || "Aucune description"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl border bg-muted/20">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Objectif</div>
          <div className="font-bold text-sm mt-1">{formatUSD(targetAmount)}</div>
        </div>
        <div className="p-3 rounded-xl border bg-muted/20">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><PieIcon className="w-3.5 h-3.5" /> Equity</div>
          <div className="font-bold text-sm mt-1">{equityPercent}%</div>
        </div>
        <div className="p-3 rounded-xl border bg-muted/20">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> Équipe</div>
          <div className="font-bold text-sm mt-1">{activeMembers.length} membres</div>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <label className="text-xs font-semibold">Statut initial du projet</label>
        <Select value={projectStatusToCreate} onValueChange={(v) => setProjectStatusToCreate(v as ProjectStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">En révision (Validation équipe ZIRA)</SelectItem>
            <SelectItem value="draft">Brouillon (Non visible publiquement)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSubmit} disabled={submitting} className="w-full font-bold py-6 text-base shadow-sm">
        <CheckCircle2 className="w-5 h-5 mr-2" />
        {submitting ? "Création en cours..." : projectStatusToCreate === "pending" ? "Créer et soumettre à la validation" : "Enregistrer le brouillon"}
      </Button>
    </div>
  );
}
