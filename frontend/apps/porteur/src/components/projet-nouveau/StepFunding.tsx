import React from "react";
import { Input, Label } from "@zira/ui";
import { TrendingUp } from "@/lib/hero-icons-compat";
import { formatUSD, useLang } from "@zira/shared";
import { USD_TO_XOF } from "./types";

interface StepFundingProps {
  targetAmount: number;
  setTargetAmount: (v: number) => void;
  equityPercent: number;
  setEquityPercent: (v: number) => void;
  minInvestment: number;
  setMinInvestment: (v: number) => void;
  maxInvestment: number;
  setMaxInvestment: (v: number) => void;
  porteurEquity: number;
  errors: Record<string, string>;
}

/**
 * Étape 4 : Paramètres de la campagne de levée de fonds et calcul de valorisation.
 */
export function StepFunding({
  targetAmount, setTargetAmount, equityPercent, setEquityPercent,
  minInvestment, setMinInvestment, maxInvestment, setMaxInvestment,
  porteurEquity, errors,
}: StepFundingProps) {
  const { t } = useLang();
  const postMoney = equityPercent > 0 ? Math.round(targetAmount / (equityPercent / 100)) : 0;
  const preMoney = Math.max(0, postMoney - targetAmount);

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-5 shadow-xs">
      <div>
        <h2 className="text-base font-semibold">{t.porteurFormFundingTitle} & Conditions</h2>
        <p className="text-sm text-muted-foreground">Fixez le montant cible et les tickets d'entrée.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="t-amt" className="text-sm font-medium">{t.porteurFormTargetAmount} *</Label>
          <span className="text-xs text-muted-foreground">≈ {(targetAmount * USD_TO_XOF).toLocaleString("fr-FR")} FCFA</span>
        </div>
        <div className="relative">
          <Input id="t-amt" type="number" value={targetAmount} onChange={(e) => setTargetAmount(Math.max(0, Number(e.target.value) || 0))} min={100} step={1000} className="pl-8" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
        </div>
        {errors.targetAmountUSD && <p className="text-xs text-destructive">{errors.targetAmountUSD}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="eq-off" className="text-sm font-medium">{t.porteurFormEquityOffered} (Max : {100 - porteurEquity}%) *</Label>
        <div className="relative">
          <Input id="eq-off" type="number" value={equityPercent} onChange={(e) => setEquityPercent(Math.max(0, Number(e.target.value) || 0))} min={1} max={Math.max(1, 100 - porteurEquity)} className="pr-8" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
        </div>
        {errors.equityPercent && <p className="text-xs text-destructive">{errors.equityPercent}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="min-i" className="text-sm font-medium">{t.porteurFormMinInv} *</Label>
          <div className="relative">
            <Input id="min-i" type="number" value={minInvestment} onChange={(e) => setMinInvestment(Math.max(0, Number(e.target.value) || 0))} min={1} className="pl-8" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
          </div>
          {errors.minInvestment && <p className="text-xs text-destructive">{errors.minInvestment}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max-i" className="text-sm font-medium">{t.porteurFormMaxInv} *</Label>
          <div className="relative">
            <Input id="max-i" type="number" value={maxInvestment} onChange={(e) => setMaxInvestment(Math.max(0, Number(e.target.value) || 0))} min={minInvestment} className="pl-8" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
          </div>
        </div>
      </div>
      {errors.maxInvestment && <p className="text-xs text-destructive">{errors.maxInvestment}</p>}

      <div className="rounded-xl border bg-primary/5 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-primary">
          <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Simulateur de Valorisation</span>
          <span className="text-muted-foreground font-normal">Calcul temps réel</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="text-xs text-muted-foreground">Pré-Money</div>
            <div className="text-lg font-bold">{formatUSD(preMoney)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Post-Money</div>
            <div className="text-lg font-bold text-primary">{formatUSD(postMoney)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
