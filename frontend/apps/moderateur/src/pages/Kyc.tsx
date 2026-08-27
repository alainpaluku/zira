import { useEffect, useState } from "react";
import {
  Button,
  Avatar,
  AvatarFallback,
  FilterPills,
  PageHeader,
  EmptyState,
  RedirectIfNotOnboarded,
  isOnboarded,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from "@zira/ui";
import { Check, X, ShieldCheck } from "@zira/ui/lib/hero-icons-compat";
import { useToast } from "@/hooks/useToast";
import type { KycRequest } from "@zira/shared";
import { useAppData } from "@/contexts/data-context";
import { approveKyc, fetchModeratorKyc, rejectKyc } from "@/lib/api-client";
import { useLang } from "@/lib/i18n";

type FilterValue = "pending" | "approved" | "rejected" | "all";

export default function ModeratorKyc() {
  const { toast } = useToast();
  const { t } = useLang();
  const { kycRequests: localKycRequests, getUser, formatDate, refreshData } = useAppData();
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForRejection, setSelectedForRejection] = useState<KycRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState<FilterValue>("pending");

  const loadRequests = async (nextFilter = filter) => {
    setLoading(true);
    try {
      setRequests(await fetchModeratorKyc(nextFilter));
    } catch (error) {
      toast({ title: "Erreur de chargement", description: error instanceof Error ? error.message : "Impossible de charger les dossiers.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localKycRequests.length > 0) {
      setRequests(localKycRequests.filter((item) => filter === "all" || item.status === filter));
    }
    void loadRequests(filter);
  }, [filter, localKycRequests.length]);

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const approve = async (req: KycRequest) => {
    const user = getUser(req.userId);
    try {
      await approveKyc(req.id);
      await loadRequests();
      await refreshData();
      toast({ title: t("modKYCApproved", "KYC Approuvé"), description: `Le dossier de ${user?.name ?? ""} est validé.` });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  const reject = async () => {
    if (!selectedForRejection || rejectionReason.trim().length < 10) return;
    const req = selectedForRejection;
    const user = getUser(req.userId);
    try {
      await rejectKyc(req.id, rejectionReason.trim());
      setSelectedForRejection(null);
      setRejectionReason("");
      await loadRequests();
      await refreshData();
      toast({ title: t("modKYCRejected", "KYC Rejeté"), description: `Le dossier de ${user?.name ?? ""} a été rejeté.`, variant: "destructive" });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  const TABS = [
    { value: "pending", label: "En attente" },
    { value: "approved", label: "Approuvés" },
    { value: "rejected", label: "Rejetés" },
    { value: "all", label: "Tous" },
  ];

  const displayed = requests;

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <PageHeader
        title="Validation KYC & Conformité"
        description="Vérifiez les pièces d'identité et validez les profils investisseurs et porteurs."
      />

      <FilterPills options={TABS} value={filter} onChange={(v) => setFilter(v as FilterValue)} />

      {loading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">Chargement des dossiers KYC…</div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-12 h-12 text-emerald-500" />}
          title={t("modKYCNone", "Aucun dossier en attente")}
          description="Tous les dossiers KYC soumis ont été traités avec succès."
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {displayed.map((req) => {
            const user = getUser(req.userId);
            return (
              <div key={req.id} className="bg-card border rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3.5">
                  <Avatar className="w-12 h-12 shrink-0">
                    {user?.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user?.name.split(" ").map((n) => n[0]).join("") ?? "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-foreground truncate">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {req.type === "porteur" ? "Porteur de projet" : "Investisseur"} · {user?.email || req.userEmail} · Soumis le {formatDate(req.submittedAt)}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shrink-0">
                    {req.status === "pending" ? "En attente" : req.status === "approved" ? "Approuvé" : "Rejeté"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {req.documents.map((document: any, index) => {
                    const url = document.document_url || document.url;
                    if (!url) return null;
                    return (
                      <div key={`${req.id}-${index}`} className="rounded-xl border bg-muted/30 overflow-hidden">
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                          {index === 0 ? "Pièce d’identité — recto" : index === 1 ? "Pièce d’identité — verso" : "Selfie"}
                        </div>
                        {url.startsWith("data:image/") || /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url) ? (
                          <a href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt="Document KYC" className="h-40 w-full object-contain bg-black/5" />
                          </a>
                        ) : (
                          <a href={url} target="_blank" rel="noreferrer" className="block p-4 text-sm text-primary hover:underline">Ouvrir le document</a>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                  {req.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 gap-1.5 rounded-xl"
                        onClick={() => setSelectedForRejection(req)}
                      >
                        <X className="w-4 h-4" /> Rejeter le dossier
                      </Button>
                      <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => approve(req)}>
                        <Check className="w-4 h-4" /> Valider l'identité
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(selectedForRejection)} onOpenChange={(open) => !open && setSelectedForRejection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motif du refus KYC</DialogTitle>
            <DialogDescription>Ce message sera envoyé à l’utilisateur dans l’application et par email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="kyc-rejection-reason">Cause du refus</Label>
            <Textarea
              id="kyc-rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Ex. Le document est expiré ou illisible…"
              rows={5}
            />
            <p className="text-xs text-muted-foreground">Minimum 10 caractères.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedForRejection(null)}>Annuler</Button>
            <Button variant="destructive" disabled={rejectionReason.trim().length < 10} onClick={() => void reject()}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const ModerationKYC = ModeratorKyc;
