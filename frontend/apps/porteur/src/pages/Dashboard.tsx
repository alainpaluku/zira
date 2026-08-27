import React from "react";
import { useAppData } from "@zira/shared";
import { RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { DashboardProjects } from "../components/dashboard/DashboardProjects";

/**
 * Tableau de bord principal pour le porteur de projet.
 * Affiche la synthèse des levées de fonds, les projets en cours et les statistiques globales.
 */
export default function PorteurDashboard() {
  const { currentPorteurId, getProjectsByPorteur, getUser, investments, formatUSD } = useAppData();

  if (!isOnboarded("porteur")) {
    return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;
  }

  const currentUser = getUser(currentPorteurId);
  const myProjects = getProjectsByPorteur(currentPorteurId);
  const totalRaised = myProjects.reduce((sum, p) => sum + p.fundraising.raisedAmount, 0);
  const activeProjects = myProjects.filter((p) => p.status === "active").length;
  const reviewProjects = myProjects.filter((p) => p.status === "pending").length;
  const totalInvestors = investments.filter((i) => myProjects.some((p) => p.id === i.projectId)).length;
  const totalEquity = myProjects.reduce((s, p) => s + (p.fundraising.equityPercent ?? 0), 0);

  const displayName = currentUser?.name || (currentUser?.email ? currentUser.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Porteur");

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <DashboardHeader displayName={displayName} photo={currentUser?.photo} />
      <DashboardStats
        totalRaised={formatUSD(totalRaised)}
        activeProjects={activeProjects}
        reviewProjects={reviewProjects}
        totalProjects={myProjects.length}
        totalInvestors={totalInvestors}
        totalEquity={totalEquity}
      />
      <DashboardProjects projects={myProjects} formatUSD={formatUSD} />
    </div>
  );
}
