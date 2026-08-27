import React from "react";
import { useAppData } from "@zira/shared";
import { RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { WalletHeader } from "../components/portefeuille/WalletHeader";
import { WalletBalanceCard } from "../components/portefeuille/WalletBalanceCard";
import { WalletBreakdownChart } from "../components/portefeuille/WalletBreakdownChart";
import { WalletTransactionsList } from "../components/portefeuille/WalletTransactionsList";

/**
 * Page Portefeuille du porteur de projet.
 * Affiche la balance globale, la ventilation par projet et l'historique des souscriptions.
 */
export default function PorteurPortefeuille() {
  const { currentPorteurId, getProjectsByPorteur, getUser, getProject, investments, formatUSD, formatDate } = useAppData();

  if (!isOnboarded("porteur")) {
    return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;
  }

  const myProjects = getProjectsByPorteur(currentPorteurId);
  const myProjectIds = myProjects.map((p) => p.id);
  const allIncoming = investments.filter((i) => myProjectIds.includes(i.projectId));
  const totalRaised = allIncoming.filter((i) => i.status === "completed").reduce((s, i) => s + i.amountUSD, 0);

  const pieData = myProjects.map((p) => ({
    name: p.name,
    value: allIncoming.filter((i) => i.projectId === p.id && i.status === "completed").reduce((s, i) => s + i.amountUSD, 0),
  }));

  const transactionsData = allIncoming.slice(0, 8).map((inv) => ({
    id: inv.id,
    amountUSD: inv.amountUSD,
    date: inv.date,
    investorName: getUser(inv.investorId)?.name || "Investisseur",
    projectName: getProject(inv.projectId)?.name || "Projet",
  }));

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <WalletHeader />
      <WalletBalanceCard totalRaisedFormatted={formatUSD(totalRaised)} />
      <WalletBreakdownChart data={pieData} formatUSD={formatUSD} />
      <WalletTransactionsList
        investments={transactionsData}
        formatUSD={formatUSD}
        formatDate={formatDate}
      />
    </div>
  );
}
