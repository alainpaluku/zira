import React, { useState } from "react";
import { useAppData, useLang, PROJECT_STATUS_LABEL, type ProjectStatus } from "@zira/shared";
import { RedirectIfNotOnboarded, isOnboarded, FilterPills } from "@zira/ui";
import { ProjetsHeader } from "../components/projets/ProjetsHeader";
import { ProjetsList } from "../components/projets/ProjetsList";

type FilterValue = ProjectStatus | "all";

/**
 * Page de listing et filtrage des projets créés par le porteur.
 */
export default function PorteurProjets() {
  const { currentPorteurId, getProjectsByPorteur, formatUSD } = useAppData();
  const { t } = useLang();
  const [tab, setTab] = useState<FilterValue>("all");

  if (!isOnboarded("porteur")) {
    return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;
  }

  const allProjects = getProjectsByPorteur(currentPorteurId);
  const projects = tab === "all" ? allProjects : allProjects.filter((p) => p.status === tab);

  const TABS = [
    { value: "all", label: t.all },
    { value: "active", label: PROJECT_STATUS_LABEL.active },
    { value: "pending", label: PROJECT_STATUS_LABEL.pending },
    { value: "draft", label: PROJECT_STATUS_LABEL.draft },
  ];

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <ProjetsHeader />
      <FilterPills options={TABS} value={tab} onChange={(v) => setTab(v as FilterValue)} />
      <ProjetsList projects={projects} formatUSD={formatUSD} />
    </div>
  );
}
