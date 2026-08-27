import { useState } from "react";
import { useLocation } from "wouter";
import { Input, FilterPills, ProjectCard, EmptyState, PageHeader, RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { Search, FolderKanban } from "@zira/ui/lib/hero-icons-compat";
import { SECTORS, type Sector } from "@zira/shared";
import { useAppData } from "@/contexts/data-context";
import { useLang } from "@/lib/i18n";

type FilterValue = Sector | "all";

export default function InvestorExplorer() {
  const { projects, formatUSD } = useAppData();
  const { t } = useLang();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<FilterValue>("all");

  if (!isOnboarded("investisseur")) {
    return <RedirectIfNotOnboarded universe="investisseur" to="/investisseur/onboarding" />;
  }

  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "funded" || !p.status);

  const filtered = activeProjects.filter((p) => {
    if (sector !== "all" && p.sector !== sector) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sectorOptions = [
    { value: "all", label: "Tous" },
    ...SECTORS.slice(0, 6).map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <PageHeader
        title={t("explorerTitle", "Explorer les opportunités")}
        description={t("explorerSubtitle", "Découvrez les entreprises en recherche de financement et participez à leur croissance.")}
      />

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
        <Input
          placeholder={t("explorer.searchPlaceholder", "Rechercher une entreprise, un secteur...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/40 border-border rounded-xl py-2.5 h-11"
        />
      </div>

      <FilterPills options={sectorOptions} value={sector} onChange={(v) => setSector(v as FilterValue)} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-12 h-12 text-muted-foreground/60" />}
          title={t("explorerNoResults", "Aucun projet trouvé")}
          description="Essayez de modifier votre recherche ou vos filtres sectoriels pour voir plus de projets."
          actionLabel="Réinitialiser les filtres"
          onAction={() => {
            setSearch("");
            setSector("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              tagline={project.shortDescription}
              sector={project.sector}
              location={project.targetMarket || "Afrique"}
              raisedAmount={project.fundraising.raisedAmount}
              targetAmount={project.fundraising.targetAmountUSD}
              equityPercent={project.fundraising.equityPercent}
              logo={project.logo}
              poster={project.poster}
              formattedRaised={formatUSD(project.fundraising.raisedAmount)}
              formattedTarget={formatUSD(project.fundraising.targetAmountUSD)}
              onClick={() => navigate(`/investisseur/projets/${project.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const InvestisseurExplorer = InvestorExplorer;
