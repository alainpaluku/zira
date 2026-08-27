import React, { useEffect, useRef, useState } from "react";
import { ProfileExtrasForm } from "@/components/ProfileExtrasForm";
import { useAuth } from "@/contexts/auth-context";
import type { ProfileExtras } from "@zira/shared";
import { useLang } from "@/lib/i18n";
import { fetchKycStatus, fetchProfileExtras, saveProfileExtras, submitKyc } from "@/lib/api-client";

export default function InvestisseurKyc() {
  const { profile } = useAuth();
  const { t } = useLang();
  const [extras, setExtras] = useState<ProfileExtras>({});
  const [kycStatus, setKycStatus] = useState("not_submitted");
  const sentDocumentRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);

  useEffect(() => {
    void fetchProfileExtras().then(setExtras).catch(() => setExtras({}));
    void fetchKycStatus().then((result) => setKycStatus(result.status)).catch(() => undefined);
  }, [profile?.id]);

  const handleChange = (next: typeof extras) => {
    setExtras(next);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { void saveProfileExtras(next).catch(() => undefined); }, 400);
    if (next.idDocumentUrl && sentDocumentRef.current !== next.idDocumentUrl) {
      sentDocumentRef.current = next.idDocumentUrl;
      void submitKyc({
        documentType: next.idDocumentType,
        documentNumber: next.idDocumentNumber,
        documentFile: next.idDocumentUrl,
        proofAddressFile: next.idDocumentBackUrl,
        selfieFile: next.selfieUrl,
      }).then(() => setKycStatus("pending")).catch(() => undefined);
    }
  };

  return (
    <div className="py-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-4">{t("kyc.title", "Vérification d'identité (KYC)")}</h1>
      {kycStatus !== "not_submitted" && (
        <div className="mb-4 rounded-xl border bg-card px-4 py-3 text-sm">
          Statut du dossier : <strong>{kycStatus === "approved" ? "validé" : kycStatus === "rejected" ? "refusé" : "en attente de vérification"}</strong>
        </div>
      )}
      <div className="space-y-6">
        <ProfileExtrasForm
          extras={extras}
          onChange={handleChange}
          universe="investisseur"
          userEmail={profile?.email}
          userName={profile?.name}
          userType={profile?.type as any}
        />
      </div>
    </div>
  );
}
