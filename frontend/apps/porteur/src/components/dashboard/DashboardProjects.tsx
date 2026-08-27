import React from "react";
import { Link } from "wouter";
import { Plus } from "@/lib/hero-icons-compat";
import { ProjectRow } from "@zira/ui";
import {
  getFundingProgress,
  getProjectStatusPresentation,
  useLang,
  type ProjectListItem,
} from "@zira/shared";

interface DashboardProjectsProps {
  projects: ProjectListItem[];
  formatUSD: (val: number) => string;
}

/**
 * Liste des projets récents du porteur avec bouton d'ajout et statut.
 */
export function DashboardProjects({ projects, formatUSD }: DashboardProjectsProps) {
  const { t } = useLang();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">{t.porteurMyProjects}</h2>
        <Link href="/porteur/projets/nouveau">
          <span className="text-sm text-primary font-medium cursor-pointer">+ Nouveau</span>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {projects.length === 0 ? (
          <Link href="/porteur/projets/nouveau">
            <div className="border border-dashed rounded-2xl p-8 flex flex-col items-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors">
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">{t.porteurNewProject}</span>
            </div>
          </Link>
        ) : (
          projects.slice(0, 3).map((project) => {
            const percent = getFundingProgress(project.fundraising);
            const status = getProjectStatusPresentation(project.status);

            return (
              <Link key={project.id} href={`/porteur/projets/${project.id}`}>
                <ProjectRow
                  name={project.name}
                  sector={project.sector}
                  meta={project.fundraising.equityPercent ? `${project.fundraising.equityPercent}% equity` : undefined}
                  statusLabel={status.label}
                  statusClass={status.className}
                  percent={percent}
                  raisedLabel={`${formatUSD(project.fundraising.raisedAmount)} levés`}
                  percentLabel={`${percent}%`}
                  logo={project.logo}
                  poster={project.poster}
                />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
