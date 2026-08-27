import React from "react";
import { Link } from "wouter";
import { Button, ProjectRow } from "@zira/ui";
import { Plus } from "@/lib/hero-icons-compat";
import {
  getFundingProgress,
  getProjectStatusPresentation,
  useLang,
  type ProjectListItem,
} from "@zira/shared";

interface ProjetsListProps {
  projects: ProjectListItem[];
  formatUSD: (val: number) => string;
}

/**
 * Grille ou liste des projets porteur avec gestion de l'état vide.
 */
export function ProjetsList({ projects, formatUSD }: ProjetsListProps) {
  const { t } = useLang();

  if (projects.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Plus className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">Aucun projet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Créez votre premier projet pour commencer à lever des fonds
          </p>
        </div>
        <Link href="/porteur/projets/nouveau">
          <Button className="gap-2 rounded-full px-5 mt-1">
            <Plus className="w-4 h-4" /> {t.porteurNewProject}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {projects.map((project) => {
        const percent = getFundingProgress(project.fundraising);
        const status = getProjectStatusPresentation(project.status);
        const members = project.team?.length ?? 0;
        const meta = [
          members > 0 ? `${members} membres` : null,
          project.fundraising.equityPercent ? `${project.fundraising.equityPercent}% equity` : null,
        ].filter(Boolean).join(" · ");

        return (
          <Link key={project.id} href={`/porteur/projets/${project.id}`}>
            <ProjectRow
              name={project.name}
              sector={project.sector}
              meta={meta || undefined}
              statusLabel={status.label}
              statusClass={status.className}
              percent={percent}
              raisedLabel={`${formatUSD(project.fundraising.raisedAmount)} / ${formatUSD(project.fundraising.targetAmountUSD ?? 0)}`}
              percentLabel={`${percent}% atteint`}
              logo={project.logo}
              poster={project.poster}
            />
          </Link>
        );
      })}
    </div>
  );
}
