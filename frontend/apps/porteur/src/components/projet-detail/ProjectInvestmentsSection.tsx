import React from "react";
import { Avatar, AvatarFallback } from "@zira/ui";

interface InvestmentRecord {
  id: string;
  investorName: string;
  amountUSD: number;
  date: string;
}

interface ProjectInvestmentsSectionProps {
  investments: InvestmentRecord[];
  formatUSD: (val: number) => string;
  formatDate: (date: string) => string;
}

/**
 * Liste des investisseurs ayant souscrit à la levée de fonds du projet.
 */
export function ProjectInvestmentsSection({
  investments,
  formatUSD,
  formatDate,
}: ProjectInvestmentsSectionProps) {
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <h2 className="text-base font-semibold">Souscriptions reçues ({investments.length})</h2>
      {investments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Aucune souscription enregistrée pour le moment</p>
      ) : (
        <div className="divide-y">
          {investments.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {inv.investorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{inv.investorName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(inv.date)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600">+{formatUSD(inv.amountUSD)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
