import { useState } from "react";
import { Button, FilterPills, Progress, PageHeader, EmptyState, RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { Check, PauseCircle, FolderKanban } from "@zira/ui/lib/hero-icons-compat";
import { useToast } from "@/hooks/useToast";
import type { ProjectStatus, Project } from "@zira/shared";
import { useAppData } from "@/contexts/data-context";
import { approveProject, suspendProject } from "@/lib/api-client";
import { SectorImage } from "@/components/SectorImage";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_STYLE } from "@zira/shared";

type FilterValue = ProjectStatus | "all";

export default function ModeratorProjects() {
  const { toast } = useToast();
  const { t } = useLang();
  const { projects, setProjects, getUser, formatUSD, formatDate, refreshData } = useAppData();
  const [tab, setTab] = useState<FilterValue>("all");

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const TABS = [
    { value: "all", label: "Tous" },
    { value: "pending", label: "En review" },
    { value: "active", label: "Actifs" },
    { value: "suspended", label: "Suspendus" },
  ];

  const filtered = projects.filter((p) => tab === "all" || p.status === tab);

  const validate = async (p: Project) => {
    try {
      await approveProject(p.id);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: "active" as ProjectStatus } : x)));
      await refreshData();
      toast({ title: t("modProjValidated", "Projet validé"), description: `Le projet "${p.name}" est désormais actif.` });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  const suspend = async (p: Project) => {
    try {
      await suspendProject(p.id);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: "suspended" as ProjectStatus } : x)));
      await refreshData();
      toast({ title: t("modProjSuspended", "Projet suspendu"), description: `Le projet "${p.name}" a été suspendu.`, variant: "destructive" });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <PageHeader
        title="Modération des Projets"
        description="Validez, suspendez ou supervisez les projets de levée de fonds."
      />

      <FilterPills options={TABS} value={tab} onChange={(v) => setTab(v as FilterValue)} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-10 h-10 text-muted-foreground/50" />}
          title={t("modProjNone", "Aucun projet trouvé")}
          description="Aucun projet ne correspond au filtre actuellement sélectionné."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((project) => {
            const porteur = getUser(project.porteurId);
            const percent = project.fundraising.targetAmountUSD
              ? Math.round((project.fundraising.raisedAmount / project.fundraising.targetAmountUSD) * 100)
              : 0;
            return (
              <div key={project.id} className="bg-card border rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-muted">
                    <SectorImage
                      src={project.logo ?? project.poster}
                      alt={project.name}
                      sector={project.sector}
                      variant="logo"
                      initial={project.name.slice(0, 1)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-base text-foreground truncate">{project.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {project.sector} · {porteur?.name || "Porteur inconnu"} · {formatDate(project.createdAt)}
                        </div>
                      </div>
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full shrink-0", PROJECT_STATUS_STYLE[project.status])}>
                        {PROJECT_STATUS_LABEL[project.status]}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {project.shortDescription}
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{formatUSD(project.fundraising.raisedAmount)} levés ({percent}%)</span>
                    <span className="text-muted-foreground">Objectif : {formatUSD(project.fundraising.targetAmountUSD)}</span>
                  </div>
                  <Progress value={percent} className="h-2 rounded-full" />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                  {project.status !== "active" && (
                    <Button size="sm" onClick={() => validate(project)} className="gap-1.5 rounded-xl">
                      <Check className="w-4 h-4" /> Approuver & Activer
                    </Button>
                  )}
                  {project.status !== "suspended" && (
                    <Button size="sm" variant="outline" onClick={() => suspend(project)} className="gap-1.5 rounded-xl text-amber-600 hover:text-amber-700">
                      <PauseCircle className="w-4 h-4" /> Suspendre
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const ModerationProjets = ModeratorProjects;
