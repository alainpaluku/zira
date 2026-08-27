import React from "react";
import { UserAvatar } from "@zira/ui";

interface DashboardHeaderProps {
  displayName: string;
  photo?: string;
}

/**
 * En-tête du tableau de bord affichant les salutations et l'avatar de l'utilisateur.
 */
export function DashboardHeader({ displayName, photo }: DashboardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Bonjour,</p>
        <h1 className="text-2xl font-bold">{displayName}</h1>
      </div>
      <UserAvatar name={displayName} photo={photo} size="md" />
    </div>
  );
}
