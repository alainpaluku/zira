import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  BellIcon,
  CheckBadgeIcon,
  TrashIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  CheckIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useAppData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Universe } from "@/contexts/auth-context";
import type { AppNotification, NotificationType } from "@zira/shared";

interface NotificationsPageProps {
  universe: Universe;
}

export function NotificationsPage({ universe }: NotificationsPageProps) {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    formatDate,
    currentPorteurId,
    currentInvestorId,
    currentModeratorId,
  } = useAppData();
  const { profile } = useAuth();
  const { t } = useLang();
  const [, navigate] = useLocation();

  const [activeFilter, setActiveFilter] = useState<string>("all");

  const defaultUserId =
    universe === "porteur"
      ? currentPorteurId
      : universe === "investisseur"
      ? currentInvestorId
      : currentModeratorId;

  const activeUserId = profile?.id || defaultUserId;

  const userNotifications = useMemo(() => {
    return notifications.filter(
      (n) => n.universe === universe && (!n.userId || n.userId === activeUserId)
    );
  }, [notifications, universe, activeUserId]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter((n) => !n.read).length;
  }, [userNotifications]);

  const filteredNotifications = useMemo(() => {
    return userNotifications.filter((n) => {
      if (activeFilter === "unread") return !n.read;
      if (activeFilter === "all") return true;
      return n.type === activeFilter;
    });
  }, [userNotifications, activeFilter]);

  function getNotificationIcon(type: NotificationType) {
    switch (type) {
      case "investment":
        return <CurrencyDollarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "project":
        return <RocketLaunchIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "kyc":
        return <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-primary" />;
    }
  }

  function getNotificationBadge(type: NotificationType) {
    switch (type) {
      case "investment":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs">
            {universe === "porteur" ? "Investissement reçu" : universe === "investisseur" ? "Investissement" : "Finances"}
          </Badge>
        );
      case "project":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 text-xs">
            {universe === "moderation" ? "Projet à auditer" : "Campagne"}
          </Badge>
        );
      case "kyc":
        return (
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 text-xs">
            Conformité KYC
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs">
            Alerte
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-xs">Système</Badge>;
    }
  }

  function handleActionClick(n: AppNotification) {
    if (!n.read) {
      markNotificationAsRead(n.id);
    }
    if (n.actionUrl) {
      navigate(n.actionUrl);
    } else if (n.type === "project" && universe === "porteur") {
      navigate("/porteur/projets");
    } else if (n.type === "project" && universe === "investisseur") {
      navigate("/investisseur/explorer");
    } else if (n.type === "project" && universe === "moderation") {
      navigate("/moderateur/projets");
    } else if (n.type === "kyc" && (universe === "porteur" || universe === "investisseur")) {
      navigate(`/${universe}/profil`);
    } else if (n.type === "kyc" && universe === "moderation") {
      navigate("/moderateur/kyc");
    } else if (n.type === "investment" && universe === "investisseur") {
      navigate("/investisseur/wallet");
    } else if (n.type === "investment" && universe === "porteur") {
      navigate("/porteur/portefeuille");
    }
  }

  const filterOptions = [
    { key: "all", label: "Toutes", count: userNotifications.length },
    { key: "unread", label: "Non lues", count: unreadCount },
    {
      key: universe === "investisseur" || universe === "porteur" ? "investment" : "warning",
      label: universe === "porteur" ? "Financements" : universe === "investisseur" ? "Investissements" : "Alertes",
      count: userNotifications.filter((n) => n.type === (universe === "moderation" ? "warning" : "investment")).length,
    },
    {
      key: "project",
      label: "Projets",
      count: userNotifications.filter((n) => n.type === "project").length,
    },
    {
      key: "kyc",
      label: "KYC",
      count: userNotifications.filter((n) => n.type === "kyc").length,
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t("notificationsTitle", "Centre de notifications")}
            </h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2.5 py-0.5 text-xs font-semibold">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {universe === "porteur"
              ? "Suivez l'activité de vos levées de fonds, investissements reçus et mises à jour de conformité."
              : universe === "investisseur"
              ? "Suivez vos investissements, dividendes, nouveaux projets et mises à jour réglementaires."
              : "Suivez les soumissions de projets, alertes KYC et signalements de conformité."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllNotificationsAsRead(universe, activeUserId)}
              className="gap-1.5 text-xs"
              id="btn-mark-all-read"
            >
              <CheckBadgeIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.notificationsMarkAllRead || "Tout marquer comme lu"}</span>
            </Button>
          )}

          {userNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearAllNotifications(universe, activeUserId)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              id="btn-clear-all-notifs"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>{t.notificationsClearAll || "Effacer l'historique"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((f) => (
          <Button
            key={f.key}
            variant={activeFilter === f.key ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5",
              activeFilter === f.key
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
            )}
          >
            <span>{f.label}</span>
            {f.count > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  activeFilter === f.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {f.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Notification List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <BellIcon className="w-8 h-8 opacity-80" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                {activeFilter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                {activeFilter === "unread"
                  ? "Vous êtes à jour ! Toutes vos alertes ont été consultées."
                  : "Vous recevrez des notifications dès qu'un nouvel événement concerne votre compte."}
              </p>
            </div>
            {activeFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="text-xs"
              >
                Voir toutes les notifications
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "group relative p-4 rounded-xl border transition-all hover:shadow-xs",
                notif.read
                  ? "bg-card border-border/80 text-muted-foreground"
                  : "bg-card border-primary/40 shadow-xs ring-1 ring-primary/10"
              )}
            >
              <div className="flex items-start gap-3.5">
                {/* Visual Icon */}
                <div
                  className={cn(
                    "p-2.5 rounded-xl shrink-0 mt-0.5 transition-colors",
                    notif.read ? "bg-muted/60" : "bg-primary/10"
                  )}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          "text-sm font-semibold truncate",
                          notif.read ? "text-foreground/90 font-medium" : "text-foreground font-bold"
                        )}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDate ? formatDate(notif.createdAt) : notif.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {getNotificationBadge(notif.type)}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActionClick(notif)}
                        className="h-7 px-2.5 text-xs text-primary font-semibold hover:bg-primary/10 gap-1"
                      >
                        <span>Consulter</span>
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </Button>

                      {!notif.read ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          title="Marquer comme lu"
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notif.id)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                          title="Supprimer"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
