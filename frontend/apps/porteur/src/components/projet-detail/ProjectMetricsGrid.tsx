import React from "react";
import { Progress, StatCard } from "@zira/ui";
import { useLang } from "@zira/shared";

interface ProjectMetricsGridProps {
  raisedAmount: number;
  targetAmount: number;
  investorsCount: number;
  equityPercent?: number;
  formatUSD: (val: number) => string;
}

/**
 * Grille des métriques financières clés et barre de progression de la levée.
 */
export function ProjectMetricsGrid({
  raisedAmount,
  targetAmount,
  investorsCount,
  equityPercent,
  formatUSD,
}: ProjectMetricsGridProps) {
  const { t } = useLang();
  const percent = targetAmount > 0 ? Math.round((raisedAmount / targetAmount) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground">Progression de la levée</p>
            <p className="text-2xl font-bold">{formatUSD(raisedAmount)}</p>
          </div>
          <p className="text-sm font-semibold text-primary">{percent}% sur {formatUSD(targetAmount)}</p>
        </div>
        <Progress value={Math.min(100, percent)} className="h-2.5" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Objectif" value={formatUSD(targetAmount)} />
        <StatCard label="Investisseurs" value={String(investorsCount)} />
        <StatCard label="Equity cédé" value={`${equityPercent ?? 0}%`} />
      </div>
    </div>
  );
}
