import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button, Progress, Avatar, AvatarFallback, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from "@zira/ui";
import { ArrowLeft as ArrowLeftIcon, DollarSign as CurrencyDollarIcon, Users as UsersIcon, TrendingUp as ArrowTrendingUpIcon, Calendar as CalendarDaysIcon, Coins as WalletIcon } from "@zira/ui/lib/hero-icons-compat";
import { useAppData } from "@/contexts/data-context";
import { useToast } from "@/hooks/useToast";
import { RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { SectorImage } from "@/components/SectorImage";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/contexts/auth-context";

interface Props { id: string; }

export default function InvestisseurProjetDetail({ id }: Props) {
  const { toast } = useToast();
  const { t, lang } = useLang();
  const { profile } = useAuth();
  const { getProject, getInvestmentsByProject, formatUSD, formatDate, refreshData, investInProject, loading } = useAppData();
  const project = getProject(id);
  const [amount, setAmount] = useState<number>(() => project?.fundraising?.minInvestment ?? 1000);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (project) setAmount(project.fundraising.minInvestment || 1000);
  }, [project?.id]);

  if (!project) {
    if (loading) return <div className="py-10 px-4 text-center text-muted-foreground">Chargement du projet…</div>;
    return (
      <div className="py-10 px-4 text-center">
        <p>{t("project.notFound", lang === "fr" ? "Projet introuvable." : "Project not found.")}</p>
        <Link href="/investisseur/explorer">
          <Button variant="outline" className="mt-4">{t("project.back", "Retour")}</Button>
        </Link>
      </div>
    );
  }

  const investments = getInvestmentsByProject(project.id);
  const percent = Math.min(100, Math.round((project.fundraising.raisedAmount / (project.fundraising.targetAmountUSD || 1)) * 100));
  const effectiveAmount = amount || project.fundraising.minInvestment || 100;
  const liveEquity = project.fundraising.targetAmountUSD > 0
    ? (effectiveAmount / project.fundraising.targetAmountUSD) * project.fundraising.equityPercent
    : 0;

  const equityData = [
    { name: t("porteurEquityBreakdown", "Fondateurs"), value: project.equityBreakdown?.porteur || 85, color: "hsl(var(--primary))" },
    { name: t("porteurEquityInvestors", "Investisseurs"), value: project.equityBreakdown?.investors || 15, color: "hsl(var(--accent))" },
    { name: t("porteurEquityAvailable", "Disponible"), value: project.equityBreakdown?.available || 0, color: "hsl(var(--muted-foreground))" },
  ];

  const handleOpenInvest = () => {
    if (!amount || amount < (project.fundraising.minInvestment || 100)) {
      setAmount(project.fundraising.minInvestment || 1000);
    }
    setOpen(true);
  };

  const handleInvest = async () => {
    const investAmount = amount || project.fundraising.minInvestment || 100;

    if (!Number.isFinite(investAmount) || investAmount <= 0) {
      toast({
        title: lang === "fr" ? "Montant invalide" : "Invalid amount",
        description: lang === "fr" ? "Saisissez un montant positif valide." : "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }
    if (investAmount < project.fundraising.minInvestment) {
      toast({
        title: t("invInvestTooLow", "Montant insuffisant"),
        description: `Ticket minimum requis : ${formatUSD(project.fundraising.minInvestment)}`,
        variant: "destructive",
      });
      return;
    }
    if (project.fundraising.maxInvestment && investAmount > project.fundraising.maxInvestment) {
      toast({
        title: t("invInvestTooHigh", "Montant trop élevé"),
        description: `Ticket maximum autorisé : ${formatUSD(project.fundraising.maxInvestment)}`,
        variant: "destructive",
      });
      return;
    }
    const remaining = Math.max(0, project.fundraising.targetAmountUSD - project.fundraising.raisedAmount);
    if (investAmount > remaining) {
      toast({
        title: t("invInvestTooHigh", "Montant trop élevé"),
        description: `Il reste au maximum ${formatUSD(remaining)} à lever sur ce projet.`,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const inv = await investInProject(project.id, investAmount, liveEquity);
      await refreshData();
      toast({
        title: t("invInvestConfirmed", "Investissement validé !"),
        description: `Vous avez investi ${formatUSD(investAmount)} dans ${project.name} (${liveEquity.toFixed(2)}% d'equity).`,
      });
      setOpen(false);
    } catch (err: any) {
      toast({
        title: lang === "fr" ? "Erreur" : "Error",
        description: err?.message || (lang === "fr" ? "L'investissement n'a pas pu être enregistré." : "The investment failed."),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const presets = [
    Math.max(100, project.fundraising.minInvestment),
    Math.max(500, project.fundraising.minInvestment * 2),
    Math.max(1000, project.fundraising.minInvestment * 5),
    Math.min(5000, project.fundraising.maxInvestment || 5000),
  ].filter((v, idx, arr) => arr.indexOf(v) === idx && v <= (project.fundraising.maxInvestment || Infinity));

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <Link href="/investisseur/explorer">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeftIcon className="w-4 h-4" /> {t("back", "Retour")}
        </Button>
      </Link>

      <div className="rounded-2xl overflow-hidden bg-muted aspect-[21/9]">
        <SectorImage src={project.poster} alt={project.name} sector={project.sector} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border text-muted-foreground">{project.sector}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border text-muted-foreground">{project.targetMarket}</span>
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{project.shortDescription}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
            <Button size="default" className="gap-2 shrink-0" data-testid="button-invest" onClick={handleOpenInvest}>
            <WalletIcon className="w-4 h-4" /> {t("invInvestBtn", "Investir")}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("invInvestTitle", `Investir dans ${project.name}`)}</DialogTitle>
              <DialogDescription>
                {`Ticket minimum: ${formatUSD(project.fundraising.minInvestment)} | Ticket maximum: ${formatUSD(project.fundraising.maxInvestment)}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount">{t("invInvestAmount", "Montant de souscription")}</Label>
                  <span className="text-xs text-muted-foreground">Min: {formatUSD(project.fundraising.minInvestment)}</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={project.fundraising.minInvestment}
                  max={project.fundraising.maxInvestment}
                  data-testid="input-investment-amount"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {presets.map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={amount === p ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2.5"
                      onClick={() => setAmount(p)}
                    >
                      {formatUSD(p)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("invInvestReceive", "Equity obtenue")}</span>
                  <span className="font-bold text-primary">{liveEquity.toFixed(3)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("invInvestValuation", "Valorisation globale")}</span>
                  <span>{formatUSD(Math.round((project.fundraising.targetAmountUSD / project.fundraising.equityPercent) * 100))}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>{t("cancel", "Annuler")}</Button>
              <Button onClick={handleInvest} disabled={submitting} data-testid="button-confirm-invest">
                {submitting ? "..." : t("invInvestConfirm", "Confirmer l'investissement")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
          { icon: CurrencyDollarIcon, label: t("invProjectRaised", "Collecté"), value: formatUSD(project.fundraising.raisedAmount) },
          { icon: ArrowTrendingUpIcon, label: t("invProjectObjective", "Objectif"), value: formatUSD(project.fundraising.targetAmountUSD) },
          { icon: UsersIcon, label: t("invProjectInvestors", "Investisseurs"), value: String(investments.length) },
          { icon: CalendarDaysIcon, label: t("invProjectLaunched", "Date de lancement"), value: formatDate(project.createdAt) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{label}</span>
            </div>
            <p className="text-base sm:text-lg font-bold leading-tight truncate">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold">{t("invProjectProgress", "Progression de la campagne")}</h2>
        <Progress value={percent} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{formatUSD(project.fundraising.raisedAmount)}</span>
          <span className="font-semibold">{percent}% sur {formatUSD(project.fundraising.targetAmountUSD)}</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">{t("porteurOverview", "Aperçu")}</TabsTrigger>
          <TabsTrigger value="team">{t("porteurTeam", "Équipe")}</TabsTrigger>
          <TabsTrigger value="equity">{t("porteurEquity", "Équité")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="bg-card border rounded-2xl p-5 space-y-3 text-sm">
            <h3 className="font-semibold">{t("invProjectAbout", "À propos du projet")}</h3>
            <p className="text-muted-foreground leading-relaxed">{project.shortDescription}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">{t("invProjectTargetMarket", "Marché cible")}</div>
                <div className="font-medium text-sm">{project.targetMarket}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">{t("invProjectMinInv", "Ticket Min.")}</div>
                <div className="font-medium text-sm">{formatUSD(project.fundraising.minInvestment)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">{t("invProjectMaxInv", "Ticket Max.")}</div>
                <div className="font-medium text-sm">{formatUSD(project.fundraising.maxInvestment)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Équité offerte</div>
                <div className="font-medium text-sm">{project.fundraising.equityPercent}%</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-3 mt-4">
          {project.team.map((member, idx) => (
            <div key={idx} className="bg-card border rounded-2xl p-4 flex items-center gap-4">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.role}</div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="equity" className="mt-4">
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">{t("porteurCapitalDistrib", "Répartition du Capital")}</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={equityData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={2}>
                    {equityData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
