import { AppShell } from "@zira/ui";
import { LayoutDashboard, User, Search, Wallet, Laptop } from "@/lib/hero-icons-compat";
import { ReactNode } from "react";
import { useLang } from "@zira/shared";

export function InvestorLayout({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const investisseurNav = [
    { label: t("nav.home", "Accueil"), href: "/investisseur/dashboard", icon: LayoutDashboard },
    { label: t("nav.explorer", "Explorer"), href: "/investisseur/explorer", icon: Search },
    { label: t("nav.wallet", "Portefeuille"), href: "/investisseur/wallet", icon: Wallet },
    { label: t("nav.settings", "Paramètres"), href: "/investisseur/settings", icon: Laptop },
  ];
  return <AppShell navItems={investisseurNav} universe="investisseur" showFooterControls={false}>{children}</AppShell>;
}

export const InvestisseurLayout = InvestorLayout;
