import React, { useState } from "react";
import { Link } from "wouter";
import { Button, RedirectIfNotOnboarded, isOnboarded, useToast } from "@zira/ui";
import { useAppData, useLang } from "@zira/shared";
import { ProjectDetailHeader } from "../components/projet-detail/ProjectDetailHeader";
import { ProjectMetricsGrid } from "../components/projet-detail/ProjectMetricsGrid";
import { ProjectEquitySection } from "../components/projet-detail/ProjectEquitySection";
import { ProjectInvestmentsSection } from "../components/projet-detail/ProjectInvestmentsSection";
import { ProjectEditModal } from "../components/projet-detail/ProjectEditModal";

interface Props {
  id: string;
}

/**
 * Page de détails d'un projet pour le porteur avec métriques, Cap Table et souscriptions.
 */
export default function PorteurProjetDetail({ id }: Props) {
  const { getProject, getInvestmentsByProject, getUser, updateProject, formatUSD, formatDate, loading } = useAppData();
  const { toast } = useToast();
  const { t } = useLang();
  const [editOpen, setEditOpen] = useState(false);

  if (!isOnboarded("porteur")) {
    return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;
  }

  const project = getProject(id);
  if (loading && !project) {
    return <div className="py-10 px-4 text-center text-muted-foreground">Chargement du projet…</div>;
  }
  if (!project) {
    return (
      <div className="py-10 px-4 text-center">
        <p>Projet introuvable.</p>
        <Link href="/porteur/projets">
          <Button variant="outline" className="mt-4">{t.back}</Button>
        </Link>
      </div>
    );
  }

  const investments = getInvestmentsByProject(project.id);
  const investmentRecords = investments.map((inv) => ({
    id: inv.id,
    investorName: inv.investorName || getUser(inv.investorId)?.name || "Investisseur",
    amountUSD: inv.amountUSD,
    date: inv.date,
  }));

  const handleSaveEdit = async (data: { name: string; shortDescription: string; targetMarket: string }) => {
    try {
      // Send the complete DTO: the backend validates financial fields and an
      // update must never replace them with client-side defaults.
      await updateProject({ ...project, ...data, id });
      toast({ title: t.porteurModify, description: data.name });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <ProjectDetailHeader
        project={project}
        onEditClick={() => setEditOpen(true)}
      />
      <ProjectMetricsGrid
        raisedAmount={project.fundraising.raisedAmount}
        targetAmount={project.fundraising.targetAmountUSD}
        investorsCount={investments.length}
        equityPercent={project.fundraising.equityPercent}
        formatUSD={formatUSD}
      />
      <div className="grid md:grid-cols-2 gap-6">
        <ProjectEquitySection equityBreakdown={project.equityBreakdown} />
        <ProjectInvestmentsSection
          investments={investmentRecords}
          formatUSD={formatUSD}
          formatDate={formatDate}
        />
      </div>
      <ProjectEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={{
          name: project.name,
          shortDescription: project.shortDescription,
          targetMarket: project.targetMarket,
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
