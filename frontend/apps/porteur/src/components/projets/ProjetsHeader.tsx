import React from "react";
import { Link } from "wouter";
import { Button } from "@zira/ui";
import { Plus } from "@/lib/hero-icons-compat";
import { useLang } from "@zira/shared";

/**
 * En-tête de la page de gestion des projets avec bouton CTA de création.
 */
export function ProjetsHeader() {
  const { t } = useLang();

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">{t.porteurMyProjects}</h1>
      <Link href="/porteur/projets/nouveau">
        <Button className="gap-2 rounded-full px-5">
          <Plus className="w-4 h-4" /> Créer
        </Button>
      </Link>
    </div>
  );
}
