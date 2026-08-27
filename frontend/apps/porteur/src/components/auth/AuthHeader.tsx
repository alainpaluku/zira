import React from "react";
import { useLang } from "@zira/shared";

/**
 * En-tête visuel affichant l'identité ZIRA INVEST et le sous-titre de la section auth.
 */
export function AuthHeader() {
  const { lang } = useLang();

  return (
    <div className="text-center space-y-2">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground text-2xl font-black mb-2 shadow-xs">
        Z
      </div>
      <h1 className="text-3xl font-black tracking-tight text-foreground">
        ZIRA INVEST
      </h1>
      <p className="text-muted-foreground text-sm">
        {lang === "fr"
          ? "Portail Porteur de projet et Entreprises"
          : "Project Founder and Startup Portal"}
      </p>
    </div>
  );
}
