import { Link } from "wouter";
import { useAppData } from "@zira/shared";
import { RedirectIfNotOnboarded, isOnboarded, StatCard, EmptyState, PageHeader } from "@zira/ui";
import { SectorImage } from "@/components/SectorImage";
import { useLang } from "@/lib/i18n";
import { TrendingUp, FolderKanban, Coins, Users } from "@zira/ui/lib/hero-icons-compat";

export default function InvestorDashboard() {
  const { currentInvestorId, getInvestmentsByInvestor, getProject, getUser, formatUSD } = useAppData();
  const { t } = useLang();

  if (!isOnboarded("investisseur")) {
    return <RedirectIfNotOnboarded universe="investisseur" to="/investisseur/onboarding" />;
  }

  const currentUser = getUser(currentInvestorId);
  const investments = getInvestmentsByInvestor(currentInvestorId);
  const totalInvested = investments.reduce((s, i) => s + i.amountUSD, 0);
  const projectCount = new Set(investments.map((i) => i.projectId)).size;
  const totalEquity = investments.reduce((s, i) => s + i.equityReceived, 0);

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <PageHeader
        title={t("dashboardTitle", "Tableau de Bord Investisseur")}
        description={currentUser?.name ? `Bienvenue, ${currentUser.name}. Voici un aperçu de vos investissements.` : "Aperçu de vos investissements et rendements."}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          label={t("totalInvested", "Portefeuille total")}
          value={formatUSD(totalInvested)}
          sub="montant total"
          icon={<Coins className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label={t("activeProjects", "Projets investis")}
          value={String(projectCount)}
          sub="tous actifs"
          icon={<FolderKanban className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="Équité totale"
          value={`${totalEquity.toFixed(2)}%`}
          sub={`sur ${projectCount} projet${projectCount !== 1 ? "s" : ""}`}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label={t("averageReturn", "Gains estimés")}
          value="—"
          sub="Valorisation indisponible"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-semibold text-foreground">Mes investissements</h2>
          <Link href="/investisseur/explorer">
            <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
              Explorer les projets
            </span>
          </Link>
        </div>

        {investments.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="w-10 h-10 text-muted-foreground/50" />}
            title={t("invNoInvestments", "Aucun investissement pour le moment")}
            description="Explorez les opportunités de financement pour commencer à construire votre portefeuille."
            actionLabel="Explorer les opportunités"
            onAction={() => {
              window.location.href = "/investisseur/explorer";
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {investments.map((inv) => {
              const project = getProject(inv.projectId);
              if (!project) return null;
              return (
                <Link key={inv.id} href={`/investisseur/projets/${inv.projectId}`}>
                  <div className="bg-card border rounded-2xl p-3.5 sm:p-4 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-muted">
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
                        <div className="font-bold text-sm sm:text-base truncate">{project.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {project.sector} · {inv.equityReceived.toFixed(2)}% equity
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600 text-sm sm:text-base shrink-0">
                        {formatUSD(inv.amountUSD)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export const InvestisseurDashboard = InvestorDashboard;
