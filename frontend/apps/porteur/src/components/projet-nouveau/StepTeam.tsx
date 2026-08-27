import React from "react";
import { Button, Input, Label, Avatar, AvatarFallback } from "@zira/ui";
import { Plus, X, AlertCircle } from "@/lib/hero-icons-compat";
import { useLang } from "@zira/shared";
import type { FormTeamMember } from "./types";

interface StepTeamProps {
  team: FormTeamMember[];
  onAddMember: () => void;
  onRemoveMember: (idx: number) => void;
  onUpdateMember: (idx: number, key: keyof FormTeamMember, value: string) => void;
  errors: Record<string, string>;
}

/**
 * Étape 2 : Présentation de l'équipe fondatrice et des rôles clés.
 */
export function StepTeam({
  team,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  errors,
}: StepTeamProps) {
  const { t } = useLang();

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-5 shadow-xs">
      <div>
        <h2 className="text-base font-semibold">{t.porteurFormTeamTitle}</h2>
        <p className="text-sm text-muted-foreground">Présentez les fondateurs et profils clés de votre entreprise.</p>
      </div>

      {errors.team && (
        <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.team}</span>
        </div>
      )}

      <div className="space-y-3">
        {team.map((member, idx) => (
          <div key={idx} className="p-4 rounded-xl border bg-muted/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {member.name ? member.name.slice(0, 2).toUpperCase() : `M${idx + 1}`}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{member.name || `Membre #${idx + 1}`}</span>
              </div>
              {team.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => onRemoveMember(idx)}
                  className="text-muted-foreground hover:text-destructive text-xs h-7 px-2"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Retirer
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Nom complet *</Label>
                <Input
                  placeholder="Ex: Koffi Mensah"
                  value={member.name}
                  onChange={(e) => onUpdateMember(idx, "name", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Rôle / Titre *</Label>
                <Input
                  placeholder="Ex: CEO & Co-fondateur, CTO..."
                  value={member.role}
                  onChange={(e) => onUpdateMember(idx, "role", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          type="button"
          onClick={onAddMember}
          className="w-full gap-2 border-dashed py-4 text-sm"
        >
          <Plus className="w-4 h-4" /> {t.porteurFormAddMember}
        </Button>
      </div>
    </div>
  );
}
