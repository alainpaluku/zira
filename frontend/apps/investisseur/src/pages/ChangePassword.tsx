import React, { useState } from "react";
import { useUser } from "@clerk/react";
import { Label, Input, Button } from "@zira/ui";
import { useToast } from "@/hooks/useToast";
import { useLang } from "@/lib/i18n";

export default function ChangePassword() {
  const { toast } = useToast();
  const { t } = useLang();
  const { user } = useUser();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères", variant: "destructive" });
      return;
    }
    try {
      if (!user) throw new Error("Session utilisateur indisponible");
      await user.updatePassword({ currentPassword: current, newPassword: next });
      toast({ title: "Mot de passe mis à jour", description: "Votre mot de passe a été modifié avec succès." });
      setCurrent("");
      setNext("");
    } catch (error) {
      toast({ title: "Échec de la mise à jour", description: error instanceof Error ? error.message : "Impossible de modifier le mot de passe.", variant: "destructive" });
    }
  }

  return (
    <div className="py-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-4">{t("changePassword.title", "Mettre à jour le mot de passe")}</h1>
      <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-4 max-w-md">
        <div className="space-y-3">
          <div>
            <Label>Mot de passe actuel</Label>
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div>
            <Label>Nouveau mot de passe</Label>
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div className="pt-2">
            <Button type="submit">Mettre à jour</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
