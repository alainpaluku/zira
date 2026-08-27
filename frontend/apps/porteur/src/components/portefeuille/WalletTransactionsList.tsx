import React from "react";
import { Avatar, AvatarFallback } from "@zira/ui";
import { useLang } from "@zira/shared";

interface InvestmentItem {
  id: string;
  amountUSD: number;
  date: string;
  investorName: string;
  projectName: string;
}

interface WalletTransactionsListProps {
  investments: InvestmentItem[];
  formatUSD: (val: number) => string;
  formatDate: (date: string) => string;
}

/**
 * Liste des transactions et souscriptions récentes reçues par le porteur.
 */
export function WalletTransactionsList({
  investments,
  formatUSD,
  formatDate,
}: WalletTransactionsListProps) {
  const { t } = useLang();

  return (
    <div className="bg-card border rounded-2xl p-5">
      <h2 className="text-base font-semibold mb-3">Derniers investissements reçus</h2>
      {investments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{t.walletNoTransactions}</p>
      ) : (
        <div className="divide-y">
          {investments.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {inv.investorName.split(" ").map((n) => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{inv.investorName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {inv.projectName} · {formatDate(inv.date)}
                  </div>
                </div>
              </div>
              <span className="font-semibold text-sm text-green-600 shrink-0">
                +{formatUSD(inv.amountUSD)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
