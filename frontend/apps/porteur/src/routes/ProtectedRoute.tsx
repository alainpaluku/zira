import React, { ReactNode } from "react";
import { AuthGuard } from "@zira/ui";
import { ProjectOwnerLayout } from "../layouts/ProjectOwnerLayout";

interface ProtectedRouteProps {
  children: ReactNode;
  withLayout?: boolean;
}

/**
 * Route protégée spécifique à l'univers Porteur de Projet.
 * Enveloppe le composant enfant avec l'AuthGuard et optionnellement le ProjectOwnerLayout.
 */
export function ProtectedRoute({ children, withLayout = true }: ProtectedRouteProps) {
  const content = withLayout ? <ProjectOwnerLayout>{children}</ProjectOwnerLayout> : children;

  return (
    <AuthGuard universe="porteur" loginPath="/porteur/login">
      {content}
    </AuthGuard>
  );
}
