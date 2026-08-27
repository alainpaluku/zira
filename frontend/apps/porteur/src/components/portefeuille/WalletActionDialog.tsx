import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@zira/ui";
import { Coins, Smartphone, Building2, CreditCard } from "@/lib/hero-icons-compat";
import { useLang } from "@zira/shared";

type PaymentMethod = "usdt" | "usdc" | "airtel" | "orange" | "vodacom" | "bank" | "card";

const METHOD_GROUPS = [
  { group: "crypto", label: "Stablecoin", icon: <Coins className="w-4 h-4" />, methods: [{ id: "usdt", label: "USDT" }, { id: "usdc", label: "USDC" }] },
  { group: "mobile", label: "Mobile Money", icon: <Smartphone className="w-4 h-4" />, methods: [{ id: "airtel", label: "Airtel Money" }, { id: "orange", label: "Orange Money" }, { id: "vodacom", label: "M-Pesa" }] },
  { group: "bank", label: "Virement", icon: <Building2 className="w-4 h-4" />, methods: [{ id: "bank", label: "Virement bancaire" }] },
  { group: "card", label: "Carte", icon: <CreditCard className="w-4 h-4" />, methods: [{ id: "card", label: "Carte bancaire" }] },
];

interface WalletActionDialogProps {
  dialog: { open: boolean; action: "deposit" | "withdraw" } | null;
  onClose: () => void;
  onConfirm: (action: "deposit" | "withdraw", method: PaymentMethod, amount: number) => void;
}

/**
 * Boîte de dialogue pour exécuter un dépôt ou un retrait de fonds.
 */
export function WalletActionDialog({ dialog, onClose, onConfirm }: WalletActionDialogProps) {
  const { t } = useLang();
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [amount, setAmount] = useState("");

  const handleAction = () => {
    const amt = parseFloat(amount);
    if (!method || isNaN(amt) || amt <= 0 || !dialog) return;
    onConfirm(dialog.action, method as PaymentMethod, amt);
    setMethod("");
    setAmount("");
  };

  return (
    <Dialog open={Boolean(dialog?.open)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dialog?.action === "deposit" ? t.walletDeposit : t.walletWithdrawAction}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t.walletAmount}</Label>
            <Input
              type="number"
              min="1"
              placeholder={t.walletAmountPlaceholder}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.walletPaymentMethod}</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue placeholder={t.walletSelectMethod} /></SelectTrigger>
              <SelectContent>
                {METHOD_GROUPS.map((g) => (
                  <div key={g.group}>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      {g.icon}{g.label}
                    </div>
                    {g.methods.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleAction} disabled={!method || !amount}>
            {dialog?.action === "deposit" ? t.walletConfirmDeposit : t.walletConfirmWithdraw}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
