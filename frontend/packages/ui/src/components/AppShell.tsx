import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import { ReactNode } from "react";
import { useLang } from "@/lib/i18n";
import { type Universe } from "@/contexts/auth-context";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { NotificationButton } from "./NotificationButton";
import { UserProfileMenu } from "./UserProfileMenu";
import { ThemeSelector } from "./ThemeSelector";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface AppShellProps {
  children: ReactNode;
  navItems: NavItem[];
  universe: Universe;
  showFooterControls?: boolean;
}

export function AppShell({ children, navItems, universe, showFooterControls = true }: AppShellProps) {
  const [location] = useLocation();
  const { lang, setLang, t } = useLang();
  const homePath = `/${universe}/dashboard`;

  const universeBadgeText =
    universe === "porteur"
      ? "Portail Porteur de Projet"
      : universe === "investisseur"
      ? "Portail Investisseur"
      : "Portail Modération & Conformité";

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background text-foreground" id="app-shell-root">

      {/* ── Mobile Header (Sticky) ── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-md px-4 md:hidden shadow-xs">
        <Link href={homePath}>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-black text-primary tracking-tight text-lg">
              ZIRA<span className="text-foreground">INVEST</span>
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {/* Exactement 2 boutons en haut à droite : Notification et Profil */}
          <NotificationButton universe={universe} />
          <UserProfileMenu universe={universe} showNameOnDesktop={false} />
        </div>
      </header>

      {/* ── Desktop / Tablet Sidebar (rail on tablet) ── */}
      <aside className="hidden md:flex md:w-20 lg:w-64 flex-col border-r bg-card sticky top-0 h-screen shrink-0 z-30">
        {/* Sidebar header */}
        <div className="flex h-16 items-center px-5 border-b">
          <Link href={homePath} aria-label="Accueil ZIRA">
            <div className="flex items-center gap-2 cursor-pointer">
              {/* Logo on tablet (md), full text on large screens */}
              <svg
                className="hidden md:block lg:hidden h-8 w-8"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
              >
                <rect width="48" height="48" rx="10" fill="url(#g)" />
                <path d="M14 34L24 14L34 34H14Z" fill="white" />
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#2563EB" />
                    <stop offset="1" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>

              <span className="hidden lg:flex font-black text-primary tracking-tight text-xl">
                ZIRA<span className="text-foreground">INVEST</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== homePath && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} aria-label={item.label}>
                <div
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer",
                    // Tablet: compact icon rail (centered icons)
                    "md:px-0 md:py-2.5 md:justify-center md:gap-0",
                    // Desktop: full width, left-aligned text
                    "lg:px-3.5 lg:py-2.5 lg:justify-start lg:gap-3",
                    // common styling for active/inactive
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                  <span className="hidden lg:inline">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {showFooterControls && (
          <div className="p-3 border-t bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center border rounded-lg p-0.5 bg-muted/50 text-xs">
                <button
                  type="button"
                  onClick={() => setLang("fr")}
                  className={`px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                    lang === "fr"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Français"
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                    lang === "en"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
              </div>

              <ThemeSelector variant="segmented" />
            </div>

            <div className="flex items-center justify-between px-1.5 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold capitalize">
                  {universe}
                </span>
              </div>
              <Link href="/" className="hover:text-foreground transition-colors">
                Accueil ZIRA
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Content Area with Desktop Top Bar Header ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ── Desktop Top Bar Header ── */}
        <header className="hidden md:flex h-16 sticky top-0 z-30 items-center justify-between border-b bg-background/95 backdrop-blur-md px-6 shadow-xs">
          {/* keep left area to preserve spacing so right controls remain aligned */}
          <div className="flex items-center gap-3">
            <div className="w-32" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-3">
            {/* Exactement 2 boutons en haut à droite : Notification et Profil */}
            <NotificationButton universe={universe} />
            <div className="h-5 w-px bg-border" />
            <UserProfileMenu universe={universe} showNameOnDesktop={true} />
          </div>
        </header>

        {/* ── Main Page Content ── */}
        <main className="flex-1 flex flex-col pb-20 md:pb-8 overflow-x-hidden min-w-0">
          {(universe === "porteur" || universe === "investisseur") && (
            <ProfileCompletionBanner universe={universe} />
          )}
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 z-30 flex h-16 w-full items-center justify-around border-t bg-background/95 backdrop-blur-md px-2 shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[56px] h-full cursor-pointer py-1",
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] leading-none font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
