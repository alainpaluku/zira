import { Button } from "@zira/ui";
import { useAppData } from "@/contexts/data-context";
import { RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { useLang } from "@/lib/i18n";
import { SectorImage } from "@/components/SectorImage";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function InvestisseurWallet() {
  const { t } = useLang();
  const { currentInvestorId, getInvestmentsByInvestor, getProject, formatUSD, formatDate } = useAppData();

  if (!isOnboarded("investisseur")) {
    return <RedirectIfNotOnboarded universe="investisseur" to="/investisseur/onboarding" />;
  }

  const investments = getInvestmentsByInvestor(currentInvestorId);
  const totalInvested = investments.reduce((s, i) => s + i.amountUSD, 0);

  // Group investments by project to display tranches and total equity per project
  const investmentsByProject = investments.reduce((acc, inv) => {
    if (!acc[inv.projectId]) acc[inv.projectId] = { projectId: inv.projectId, investments: [] as typeof investments, total: 0, equity: 0 };
    acc[inv.projectId].investments.push(inv);
    acc[inv.projectId].total += inv.amountUSD;
    acc[inv.projectId].equity += inv.equityReceived;
    return acc;
  }, {} as Record<string, { projectId: string; investments: typeof investments; total: number; equity: number }>);

  const grouped = Object.values(investmentsByProject);

  const chartData = investments.length > 0 ? [
    { mois: "Aujourd'hui", val: totalInvested },
  ] : [];

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <div className="bg-card border rounded-3xl p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground mb-1">{t("wallet.title", "Portefeuille total")}</p>
        <h2 className="text-4xl font-black">{formatUSD(totalInvested)}</h2>
        <div className="flex gap-3 mt-4 justify-center">
          <Button size="sm" disabled title="Le prestataire de paiement n'est pas encore configuré">Déposer</Button>
          <Button size="sm" variant="outline" disabled title="Le prestataire de paiement n'est pas encore configuré">Retirer</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Les dépôts et retraits seront activés après configuration du prestataire de paiement.</p>
      </div>

      <div className="bg-card border rounded-2xl p-5">
        <h2 className="text-base font-semibold mb-4">Évolution du portefeuille</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A843" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="val" stroke="#D4A843" strokeWidth={2} fill="url(#colorVal)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Mes positions</h2>
        <div className="flex flex-col gap-3">
          {grouped.length === 0 ? (
            <div className="border border-dashed rounded-2xl p-8 text-center text-muted-foreground text-sm">
              {t("wallet.noTransactions", "Aucune transaction enregistrée pour l'instant")}
            </div>
          ) : (
            grouped.map((g) => {
              const project = getProject(g.projectId);
              if (!project) return null;
              return (
                <div key={g.projectId} className="bg-card border rounded-2xl p-3.5 sm:p-4 hover:border-primary/40 hover:shadow-xs transition-all">
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
                        {g.equity.toFixed(2)}% total equity · {g.investments.length} tranche{g.investments.length>1?"s":""}
                      </div>
                      <div className="mt-3">
                        {g.investments.map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between text-xs text-muted-foreground py-1">
                            <div>
                              <div className="font-medium">{formatDate(inv.date)}</div>
                              <div className="text-xs">{inv.equityReceived.toFixed(2)}% · tranche</div>
                            </div>
                            <div className="text-right font-bold">{formatUSD(inv.amountUSD)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm sm:text-base">{formatUSD(g.total)}</div>
                      <div className="text-xs text-green-600 font-medium">Actif</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
