import { Link } from "wouter";
import { Button, StatCard, PageHeader, RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { TriangleAlert, ArrowRight, Clock, CheckCircle2, Users, BarChart2, ShieldCheck, FolderKanban, Activity } from "@zira/ui/lib/hero-icons-compat";
import { useAppData } from "@/contexts/data-context";
import { useLang } from "@/lib/i18n";

export default function ModeratorDashboard() {
  const { users, projects, kycRequests, investments, formatUSD } = useAppData();
  const { t } = useLang();

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const pendingProjects = projects.filter((p) => p.status === "pending").length;
  const totalFlux = investments.filter((i) => i.status === "completed").reduce((s, i) => s + i.amountUSD, 0);
  const flaggedUsers = users.filter((u) => u.status === "suspended").length;

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <PageHeader
        title={t.modDashTitle || "Console de Modération"}
        description={t.modDashSubtitle || "Vue d'ensemble de la conformité, des projets et des flux"}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-950/40"
          value={String(kycRequests.length)}
          label={t.modKYCPending || "KYC en attente"}
          sub="dossiers à traiter"
          subClass="text-amber-600"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-950/40"
          value={String(activeProjects)}
          label="Projets actifs"
          sub={`${pendingProjects} en attente`}
          subClass="text-primary"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-950/40"
          value={users.length.toLocaleString()}
          label={t.modTotalUsers || "Utilisateurs"}
          sub={`${flaggedUsers} suspendus`}
          subClass="text-primary"
        />
        <StatCard
          icon={<BarChart2 className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-950/40"
          value={totalFlux > 0 ? `$${Math.round(totalFlux / 1000)}K` : "$0"}
          label="Flux total"
          sub={`${investments.length} transactions`}
          subClass="text-primary"
        />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Alertes & Actions requises</h2>
        <div className="flex flex-col gap-2.5">
          {[
            { msg: `${kycRequests.length} demandes KYC en attente de vérification`, href: "/moderation/kyc", show: kycRequests.length > 0 },
            { msg: `${pendingProjects} projets soumis pour validation`, href: "/moderation/projets", show: pendingProjects > 0 },
            { msg: `${flaggedUsers} utilisateur suspendu ou signalé`, href: "/moderation/utilisateurs", show: flaggedUsers > 0 },
          ].filter(a => a.show).map((alert, i) => (
            <Link key={i} href={alert.href}>
              <div className="bg-card border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-all cursor-pointer">
                <div className="flex items-center gap-3 min-w-0 mr-2">
                  <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{alert.msg}</span>
                </div>
                <span className="text-xs text-primary flex items-center gap-1 shrink-0 font-semibold">
                  Traiter <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
          {kycRequests.length === 0 && pendingProjects === 0 && flaggedUsers === 0 && (
            <div className="py-8 text-center border border-dashed rounded-xl text-sm text-muted-foreground">
              Aucune action urgente requise pour le moment.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Accès rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/moderation/kyc">
            <Button variant="outline" className="w-full justify-start gap-2.5 h-11 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-primary" /> Validation KYC ({kycRequests.length})
            </Button>
          </Link>
          <Link href="/moderation/projets">
            <Button variant="outline" className="w-full justify-start gap-2.5 h-11 rounded-xl">
              <FolderKanban className="w-4 h-4 text-primary" /> Modération Projets ({projects.length})
            </Button>
          </Link>
          <Link href="/moderation/utilisateurs">
            <Button variant="outline" className="w-full justify-start gap-2.5 h-11 rounded-xl">
              <Users className="w-4 h-4 text-primary" /> Gestion Comptes ({users.length})
            </Button>
          </Link>
          <Link href="/moderation/flux">
            <Button variant="outline" className="w-full justify-start gap-2.5 h-11 rounded-xl">
              <Activity className="w-4 h-4 text-primary" /> Supervision Flux
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const ModerationDashboard = ModeratorDashboard;
