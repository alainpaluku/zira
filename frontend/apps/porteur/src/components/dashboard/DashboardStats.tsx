import React from "react";
import { StatCard } from "@zira/ui";
import { useLang } from "@zira/shared";

interface DashboardStatsProps {
  totalRaised: string;
  activeProjects: number;
  reviewProjects: number;
  totalProjects: number;
  totalInvestors: number;
  totalEquity: number;
}

/**
 * Grille des indicateurs clés de performance du porteur (Montant levé, Projets, Investisseurs, Equity).
 */
export function DashboardStats({
  totalRaised,
  activeProjects,
  reviewProjects,
  totalProjects,
  totalInvestors,
  totalEquity,
}: DashboardStatsProps) {
  const { t } = useLang();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label={t.porteurTotalRaised}
        value={totalRaised}
        sub="total levé"
      />
      <StatCard
        label={t.porteurActiveProjects}
        value={String(activeProjects)}
        sub={reviewProjects > 0 ? `${reviewProjects} en review` : `${totalProjects} au total`}
      />
      <StatCard
        label={t.porteurInvestors}
        value={String(totalInvestors)}
        sub={t.porteurInvestorsTotal}
      />
      <StatCard
        label={t.porteurAvgRate}
        value={`${totalEquity}%`}
        sub="equity total"
      />
    </div>
  );
}
