import { AppShell } from "@zira/ui";
import { LayoutDashboard, User, Briefcase, FolderKanban } from "@/lib/hero-icons-compat";
import { ReactNode } from "react";
import { useLang } from "@zira/shared";

export function ProjectOwnerLayout({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const porteurNav = [
    { label: t.navDashboard, href: "/porteur/dashboard", icon: LayoutDashboard },
    { label: t.navProjects, href: "/porteur/projets", icon: FolderKanban },
    { label: t.navPortfolio, href: "/porteur/portefeuille", icon: Briefcase },
    { label: t.navProfile, href: "/porteur/profil", icon: User },
  ];
  return <AppShell navItems={porteurNav} universe="porteur" showFooterControls={false}>{children}</AppShell>;
}

export const PorteurLayout = ProjectOwnerLayout;
