import React from "react";

interface WalletBalanceCardProps {
  totalRaisedFormatted: string;
}

/**
 * Carte grand format affichant le total cumulé des fonds levés par le porteur.
 */
export function WalletBalanceCard({ totalRaisedFormatted }: WalletBalanceCardProps) {
  return (
    <div className="bg-card border rounded-3xl p-6 text-center shadow-xs">
      <p className="text-sm text-muted-foreground mb-1">Total levé</p>
      <h2 className="text-4xl font-black">{totalRaisedFormatted}</h2>
    </div>
  );
}
