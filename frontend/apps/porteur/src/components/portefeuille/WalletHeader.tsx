import React from "react";
import { Button } from "@zira/ui";

interface WalletHeaderProps {
  onDeposit?: () => void;
  onWithdraw?: () => void;
  paymentsEnabled?: boolean;
}

/**
 * En-tête de la page portefeuille avec les boutons d'action Déposer et Retirer.
 */
export function WalletHeader({ onDeposit, onWithdraw, paymentsEnabled = false }: WalletHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h1 className="text-2xl font-bold">Mon Wallet</h1>
      <div className="flex gap-2">
        <Button size="sm" onClick={onDeposit} disabled={!paymentsEnabled} title={!paymentsEnabled ? "Le prestataire de paiement n'est pas configuré" : undefined}>
          + Déposer
        </Button>
        <Button size="sm" variant="outline" onClick={onWithdraw} disabled={!paymentsEnabled} title={!paymentsEnabled ? "Le prestataire de paiement n'est pas configuré" : undefined}>
          Retirer
        </Button>
      </div>
      {!paymentsEnabled && <p className="text-xs text-muted-foreground sm:max-w-xs">Dépôts et retraits indisponibles tant que le prestataire de paiement n'est pas configuré.</p>}
    </div>
  );
}
