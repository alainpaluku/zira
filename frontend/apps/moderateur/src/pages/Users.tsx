import { useState } from "react";
import { Button, Avatar, AvatarFallback, Input, FilterPills, PageHeader, EmptyState, RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { Pause, RotateCcw, Search, Users as UsersIcon } from "@zira/ui/lib/hero-icons-compat";
import { useToast } from "@/hooks/useToast";
import type { UserProfile } from "@zira/shared";
import { useAppData } from "@/contexts/data-context";
import { suspendUser, activateUser } from "@/lib/api-client";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { USER_STATUS_LABEL, USER_STATUS_STYLE } from "@zira/shared";

type FilterValue = "all" | "active" | "suspended" | "pending_kyc" | "porteur" | "investisseur";

export default function ModeratorUsers() {
  const { toast } = useToast();
  const { t } = useLang();
  const { users, setUsers, refreshData } = useAppData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const TABS = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Actifs" },
    { value: "suspended", label: "Suspendus" },
    { value: "pending_kyc", label: "KYC att." },
    { value: "porteur", label: "Porteurs" },
    { value: "investisseur", label: "Investisseurs" },
  ];

  const filtered = users
    .filter((u) => {
      if (filter === "all") return true;
      if (filter === "porteur") return u.role === "porteur";
      if (filter === "investisseur") return u.role === "investisseur";
      return u.status === filter;
    })
    .filter((u) => {
      if (!search) return true;
      return u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    });

  const suspend = async (u: UserProfile) => {
    try {
      await suspendUser(u.id);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: "suspended" as const } : x));
      await refreshData();
      toast({ title: t("modUsersSuspended", "Utilisateur suspendu"), description: u.name, variant: "destructive" });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  const activate = async (u: UserProfile) => {
    try {
      await activateUser(u.id);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: "active" as const } : x));
      await refreshData();
      toast({ title: t("modUsersActivated", "Utilisateur réactivé"), description: u.name });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <PageHeader
        title="Gestion des Utilisateurs"
        description="Supervisez les comptes porteurs et investisseurs de la plateforme."
      />

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/40 h-11 rounded-xl"
        />
      </div>

      <FilterPills options={TABS} value={filter} onChange={(v) => setFilter(v as FilterValue)} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="w-10 h-10 text-muted-foreground/50" />}
          title={t("modUsersNone", "Aucun utilisateur trouvé")}
          description="Aucun utilisateur ne correspond à vos critères de recherche."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((u) => (
            <div key={u.id} className="bg-card border rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-11 h-11 shrink-0">
                  {u.photo ? (
                    <img src={u.photo} alt={u.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {u.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.email} · {u.role === "porteur" ? "Porteur" : "Investisseur"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", USER_STATUS_STYLE[u.status] || "bg-muted text-muted-foreground")}>
                  {USER_STATUS_LABEL[u.status] || u.status}
                </span>

                {u.status === "active" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-xl gap-1 text-xs"
                    onClick={() => suspend(u)}
                  >
                    <Pause className="w-3.5 h-3.5" /> Suspendre
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-600 hover:bg-emerald-50 h-8 px-2.5 rounded-xl gap-1 text-xs"
                    onClick={() => activate(u)}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Réactiver
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ModerationUtilisateurs = ModeratorUsers;
