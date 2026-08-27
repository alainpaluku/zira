import { useState } from "react";
import { Avatar, AvatarFallback, FilterPills, PageHeader, StatCard, EmptyState, RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { useAppData } from "@/contexts/data-context";
import { useLang } from "@/lib/i18n";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { DollarSign, Activity, Calendar, ArrowUpRight } from "@zira/ui/lib/hero-icons-compat";

type FilterValue = "all" | "completed" | "pending";

export default function ModeratorFinancialFlows() {
  const { investments, getProject, getUser, formatUSD, formatDate } = useAppData();
  const { t } = useLang();
  const [tab, setTab] = useState<FilterValue>("all");

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const totalCompleted = investments.filter((i) => i.status === "completed").reduce((s, i) => s + i.amountUSD, 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalMonth = investments
    .filter((i) => i.status === "completed" && new Date(i.date).getTime() >= monthStart.getTime())
    .reduce((s, i) => s + i.amountUSD, 0);
  const txCount = investments.length;

  const chartData = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const value = investments
      .filter((i) => i.status === "completed")
      .filter((i) => {
        const timestamp = new Date(i.date).getTime();
        return timestamp >= start.getTime() && timestamp < end.getTime();
      })
      .reduce((sum, i) => sum + i.amountUSD, 0);
    return { mois: start.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""), val: value };
  });

  const TABS = [
    { value: "all", label: "Tous" },
    { value: "completed", label: "Complétés" },
    { value: "pending", label: "En attente" },
  ];

  const filtered = investments.filter((i) => tab === "all" || i.status === tab);

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <PageHeader
        title="Flux d'Investissements"
        description="Supervision globale des transactions financières et des volumes d'investissement."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <StatCard
          label="Volume Total Traité"
          value={formatUSD(totalCompleted)}
          sub="depuis le lancement"
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="Volume ce Mois"
          value={formatUSD(totalMonth)}
          sub="croissance positive"
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          label="Total Transactions"
          value={String(txCount)}
          sub="investissements enregistrés"
          icon={<Activity className="w-5 h-5 text-blue-600" />}
        />
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <h2 className="text-base font-semibold text-foreground">Évolution des Flux Mensuels</h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis hide />
              <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="val" fill="#D4A843" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Dernières transactions</h2>
          <FilterPills options={TABS} value={tab} onChange={(v) => setTab(v as FilterValue)} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ArrowUpRight className="w-10 h-10 text-muted-foreground/50" />}
            title="Aucune transaction trouvée"
            description="Aucun flux financier ne correspond au statut sélectionné."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.slice(0, 15).map((tx) => {
              const project = getProject(tx.projectId);
              const investor = getUser(tx.investorId);
              return (
                <div key={tx.id} className="bg-card border rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {investor?.name.split(" ").map((n) => n[0]).join("") ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">{investor?.name || "Investisseur"}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {project?.name || "Projet"} · {formatDate(tx.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-emerald-600">+{formatUSD(tx.amountUSD)}</div>
                    <div className={cn(
                      "text-xs font-semibold",
                      tx.status === "completed" ? "text-emerald-600" : "text-amber-500"
                    )}>
                      {tx.status === "completed" ? "Complété" : "En cours"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export const ModerationFlux = ModeratorFinancialFlows;
