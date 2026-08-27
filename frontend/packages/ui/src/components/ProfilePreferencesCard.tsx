import { Languages, Sun, Moon, Laptop, Check, ShieldCheck, ShieldAlert, Clock, Bell, SparklesIcon } from "@/lib/hero-icons-compat";
import { FlagIcon } from "@heroicons/react/24/solid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/i18n";
import { useTheme } from "./ThemeProvider";
import { useAppData } from "@/contexts/data-context";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { Universe } from "@/contexts/auth-context";

interface ProfilePreferencesCardProps {
  universe: Universe;
  isKycApproved?: boolean;
  isKycPending?: boolean;
  className?: string;
}

export function ProfilePreferencesCard({
  universe,
  isKycApproved = false,
  isKycPending = false,
  className,
}: ProfilePreferencesCardProps) {
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const { unreadNotificationsCount } = useAppData();
  const [, navigate] = useLocation();

  return (
    <Card className={cn("border bg-card shadow-xs", className)} id="profile-preferences-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
          <SparklesIcon className="w-4 h-4 text-primary" />
          Préférences & Paramètres d'affichage
        </CardTitle>
        <CardDescription>
          Personnalisez la langue de l'interface, le thème d'affichage et vos options de sécurité.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Section 1: KYC Status Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 gap-3">
          <div className="flex items-center gap-3">
            {isKycApproved ? (
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : isKycPending ? (
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t.profileMenuKycStatus || "Vérification d'identité (KYC)"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isKycApproved
                  ? "Votre compte est validé et prêt pour toutes les opérations financières."
                  : isKycPending
                  ? "Vos pièces justificatives sont en cours d'analyse par l'équipe de conformité."
                  : "Veuillez soumettre vos pièces d'identité ci-dessous pour débloquer toutes les fonctionnalités."}
              </p>
            </div>
          </div>

          <div>
            {isKycApproved ? (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-semibold text-xs">
                Certifié Conforme
              </Badge>
            ) : isKycPending ? (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 font-semibold text-xs">
                En cours d'examen
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold text-xs">
                Non vérifié
              </Badge>
            )}
          </div>
        </div>

        {/* Section 2: Language & Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Language Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Languages className="w-3.5 h-3.5 text-primary" />
              {t.profileMenuLanguage || "Langue de l'interface"}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all",
                  lang === "fr"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
                )}
                id="btn-profile-lang-fr"
              >
                <FlagIcon className="w-4 h-4" />
                <span>Français</span>
                {lang === "fr" && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>

              <button
                type="button"
                onClick={() => setLang("en")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all",
                  lang === "en"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
                )}
                id="btn-profile-lang-en"
              >
                <FlagIcon className="w-4 h-4" />
                <span>English</span>
                {lang === "en" && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              {t.profileMenuTheme || "Thème d'affichage"}
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center gap-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  theme === "light"
                    ? "bg-card text-foreground border-primary ring-2 ring-primary/20 font-bold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
                )}
                id="btn-profile-theme-light"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.profileThemeLight || "Clair"}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center gap-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  theme === "dark"
                    ? "bg-card text-foreground border-primary ring-2 ring-primary/20 font-bold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
                )}
                id="btn-profile-theme-dark"
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.profileThemeDark || "Sombre"}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={cn(
                  "flex items-center justify-center gap-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  theme === "system"
                    ? "bg-card text-foreground border-primary ring-2 ring-primary/20 font-bold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
                )}
                id="btn-profile-theme-system"
              >
                <Laptop className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.profileThemeSystem || "Auto"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Shortcuts */}
        <div className="pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Notifications : {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} non lue(s)` : "Toutes les alertes sont lues"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold text-primary hover:bg-primary/10"
            onClick={() => navigate(`/${universe}/notifications`)}
          >
            Ouvrir le centre de notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
