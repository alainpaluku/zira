import { useLocation } from "wouter";
import { Bell } from "@/lib/hero-icons-compat";
import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { useAppData } from "@/contexts/data-context";
import { useLang } from "@/lib/i18n";
import type { Universe } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface NotificationButtonProps {
  universe: Universe;
  className?: string;
}

export function NotificationButton({ universe, className }: NotificationButtonProps) {
  const [location, navigate] = useLocation();
  const { unreadNotificationsCount } = useAppData();
  const { t } = useLang();

  const notifPath = `/${universe}/notifications`;
  const isActive = location === notifPath || location === "/notifications";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={() => navigate(notifPath)}
          className={cn(
            "relative h-9 w-9 rounded-full transition-colors",
            isActive
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            className
          )}
          aria-label={t.navNotifications || "Notifications"}
          id="btn-header-notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotificationsCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background animate-pulse"
              id="badge-notifications-count"
            >
              {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="font-medium">{t.navNotifications || "Notifications"}</p>
        {unreadNotificationsCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            {unreadNotificationsCount} non lue{unreadNotificationsCount > 1 ? "s" : ""}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">À jour</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
