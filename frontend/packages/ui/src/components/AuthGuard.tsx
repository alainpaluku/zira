import React from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth, type Universe } from "@zira/shared";
import { Loader2 } from "@/lib/hero-icons-compat";

export interface AuthGuardProps {
  universe: Universe;
  loginPath: string;
  children: React.ReactNode;
  fallbackText?: string;
  spinnerColor?: string;
}

export function AuthGuard({
  universe,
  loginPath,
  children,
  fallbackText = "Vérification de l'authentification...",
  spinnerColor = "text-primary",
}: AuthGuardProps) {
  const { user, isAuthenticated, authLoading } = useAuth();
  const [location] = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className={`w-8 h-8 animate-spin mb-4 ${spinnerColor}`} />
        <span className="text-sm font-medium text-muted-foreground">{fallbackText}</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={`${loginPath}?next=${encodeURIComponent(location)}`} />;
  }

  const roles = universe === "moderation"
    ? ["moderateur", "moderator", "admin"]
    : universe === "investisseur" || universe === "investor"
      ? ["investisseur", "investor"]
      : ["porteur", "project_owner"];
  if (user && !roles.includes(user.role)) {
    return <div className="min-h-screen grid place-items-center p-6 text-center">
      <p className="text-destructive">Ce compte n’a pas accès à ce portail.</p>
    </div>;
  }

  return <>{children}</>;
}
