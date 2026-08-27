import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useLang } from "@/lib/i18n";
import type { ProfileExtras, IdDocumentType } from "@/lib/profile-completion";
import { uploadFile, verifyIdentityDocument, requestVerificationCode, verifyVerificationCode } from "@/lib/api-client";
import { useToast } from "@/hooks/useToast";
import { extractIdentityNameCandidate } from "@/lib/identity-name";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Camera,
  RefreshCw,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  SparklesIcon,
  Upload,
  UserCheck,
  Send,
} from "@/lib/hero-icons-compat";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { DocumentTextIcon, UserIcon as HeroUserIcon, CameraIcon as HeroCameraIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface ProfileExtrasFormProps {
  extras: ProfileExtras;
  onChange: (extras: ProfileExtras) => void;
  universe: "porteur" | "investisseur";
  userEmail?: string;
  userName?: string;
  userType?: "physique" | "morale";
  onIdentityNameDetected?: (identityName: string) => Promise<void> | void;
}

const COUNTRY_CODES = [
  { code: "+243", label: "RD Congo (+243)" },
  { code: "+225", label: "Côte d'Ivoire (+225)" },
  { code: "+221", label: "Sénégal (+221)" },
  { code: "+237", label: "Cameroun (+237)" },
  { code: "+229", label: "Bénin (+229)" },
  { code: "+228", label: "Togo (+228)" },
  { code: "+223", label: "Mali (+223)" },
  { code: "+226", label: "Burkina Faso (+226)" },
  { code: "+33", label: "France (+33)" },
  { code: "+1", label: "USA / Canada (+1)" },
  { code: "+32", label: "Belgique (+32)" },
  { code: "+44", label: "Royaume-Uni (+44)" },
];

export function ProfileExtrasForm({
  extras,
  onChange,
  universe,
  userEmail = "",
  userName = "",
  userType = "physique",
  onIdentityNameDetected,
}: ProfileExtrasFormProps) {
  const { lang } = useLang();
  const { toast } = useToast();
  const safeLang = lang === "en" ? "en" : "fr";

  // Document state
  const docType: IdDocumentType = extras.idDocumentType || "national_id";
  const [selectedDocType, setSelectedDocType] = useState<IdDocumentType>(docType);
  const [docNumber, setDocNumber] = useState(extras.idDocumentNumber || "");
  const [docExpiry, setDocExpiry] = useState(extras.idExpiryDate || "");
  const [docCountry, setDocCountry] = useState(extras.idDocumentCountry || "RD Congo (+243)");

  // Email verification dialog
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerifying, setEmailVerifying] = useState(false);

  // Phone verification dialog
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneCode, setPhoneCode] = useState(extras.phoneCountryCode || "+243");
  const [phoneNumber, setPhoneNumber] = useState(extras.phone || "");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerifying, setPhoneVerifying] = useState(false);

  // Document & selfie state
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [selfieUploading, setSelfieUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (extras.idDocumentType) {
      setSelectedDocType(extras.idDocumentType);
    }
  }, [extras.idDocumentType]);

  useEffect(() => {
    setDocNumber(extras.idDocumentNumber || "");
    setDocExpiry(extras.idExpiryDate || "");
    setDocCountry(extras.idDocumentCountry || "RD Congo (+243)");
    setPhoneCode(extras.phoneCountryCode || "+243");
    setPhoneNumber(extras.phone || "");
  }, [extras.idDocumentNumber, extras.idExpiryDate, extras.idDocumentCountry, extras.phoneCountryCode, extras.phone]);

  // KYC Completion calculation
  const emailVerified = Boolean(extras.emailVerified);
  const phoneVerified = Boolean(extras.phoneVerified && (extras.phone || phoneNumber));
  const idVerified = Boolean(extras.idVerified && extras.idDocumentUrl);

  const kycScore = useMemo(() => {
    let score = 0;
    if (emailVerified) score += 30;
    if (phoneVerified) score += 30;
    if (idVerified) score += 40;
    return score;
  }, [emailVerified, phoneVerified, idVerified]);

  function stopCamera() {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        safeLang === "fr"
          ? "Caméra non supportée par ce navigateur."
          : "Camera is not supported by this browser."
      );
    }

    stopCamera();
    setCameraStarting(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : safeLang === "fr"
          ? "Impossible d'ouvrir la caméra."
          : "Could not open camera.";
      setCameraError(msg);
      throw err;
    } finally {
      setCameraStarting(false);
    }
  }

  async function openCameraForSelfie() {
    setCameraOpen(true);
    try {
      await startCamera();
    } catch {
      toast({
        title: safeLang === "fr" ? "Caméra indisponible" : "Camera unavailable",
        description:
          safeLang === "fr"
            ? "Veuillez autoriser l'accès à la caméra."
            : "Please allow camera permissions.",
        variant: "destructive",
      });
    }
  }

  async function captureSelfieToFile(): Promise<File> {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      throw new Error(safeLang === "fr" ? "Flux caméra non prêt." : "Camera stream is not ready.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error(safeLang === "fr" ? "Capture impossible." : "Capture failed.");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) {
            reject(new Error("Capture invalide"));
            return;
          }
          resolve(b);
        },
        "image/jpeg",
        0.92
      );
    });

    return new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
  }

  async function handleSendEmailOtp() {
    try {
      await requestVerificationCode("email");
      toast({ title: safeLang === "fr" ? "Code de vérification envoyé" : "Verification code sent", description: safeLang === "fr" ? `Un code a été envoyé à ${userEmail || "votre email"}.` : "A code was sent to your email." });
    } catch (error) {
      toast({ title: safeLang === "fr" ? "Envoi impossible" : "Unable to send code", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  }

  async function handleVerifyEmailOtp() {
    if (!emailOtp.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez saisir le code à 6 chiffres reçu.",
        variant: "destructive",
      });
      return;
    }

    setEmailVerifying(true);
    try {
      await verifyVerificationCode("email", emailOtp.trim());
      const updated = {
        ...extras,
        emailVerified: true,
        emailVerifiedAt: new Date().toLocaleDateString(safeLang === "fr" ? "fr-FR" : "en-US"),
      };
      onChange(updated);
      setEmailModalOpen(false);
      setEmailOtp("");
      toast({
        title: safeLang === "fr" ? "Email vérifié avec succès !" : "Email successfully verified!",
        description:
          safeLang === "fr"
            ? "Votre adresse email est désormais authentifiée."
            : "Your email address is now verified.",
      });
    } catch (error) {
      toast({ title: safeLang === "fr" ? "Code invalide" : "Invalid code", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setEmailVerifying(false);
    }
  }

  async function handleSendPhoneOtp() {
    if (!phoneNumber.trim()) {
      toast({
        title: "Numéro requis",
        description: "Veuillez saisir votre numéro de téléphone.",
        variant: "destructive",
      });
      return;
    }
    try {
      await requestVerificationCode("phone", `${phoneCode}${phoneNumber}`.replace(/\s+/g, ""));
      toast({ title: safeLang === "fr" ? "Code SMS envoyé" : "SMS code sent", description: safeLang === "fr" ? `Code envoyé au ${phoneCode} ${phoneNumber}.` : "A code was sent by SMS." });
    } catch (error) {
      toast({ title: safeLang === "fr" ? "Envoi impossible" : "Unable to send code", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  }

  async function handleVerifyPhoneOtp() {
    if (!phoneOtp.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez saisir le code SMS à 6 chiffres reçu.",
        variant: "destructive",
      });
      return;
    }

    setPhoneVerifying(true);
    try {
      await verifyVerificationCode("phone", phoneOtp.trim());
      const fullPhone = `${phoneCode} ${phoneNumber}`.trim();
      const updated = {
        ...extras,
        phone: fullPhone,
        phoneCountryCode: phoneCode,
        phoneVerified: true,
        phoneVerifiedAt: new Date().toLocaleDateString(safeLang === "fr" ? "fr-FR" : "en-US"),
      };
      onChange(updated);
      setPhoneModalOpen(false);
      setPhoneOtp("");
      toast({
        title: safeLang === "fr" ? "Téléphone vérifié avec succès !" : "Phone successfully verified!",
        description:
          safeLang === "fr"
            ? `Le numéro ${fullPhone} est désormais associé à votre compte.`
            : `Phone ${fullPhone} is now verified.`,
      });
    } catch (error) {
      toast({ title: safeLang === "fr" ? "Code invalide" : "Invalid code", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setPhoneVerifying(false);
    }
  }

  // Document uploads
  async function handleFrontUpload(file: File | null) {
    if (!file) return;
    setUploadingFront(true);
    try {
      const url = await uploadFile(file, "id_document_front");
      const updated = {
        ...extras,
        idDocumentUrl: url,
        idDocumentType: selectedDocType,
        idDocumentNumber: docNumber || extras.idDocumentNumber,
        idDocumentCountry: docCountry || extras.idDocumentCountry,
        idExpiryDate: docExpiry || extras.idExpiryDate,
      };
      onChange(updated);
      toast({
        title: safeLang === "fr" ? "Document téléversé" : "Document uploaded",
        description:
          safeLang === "fr"
            ? "Face principale enregistrée."
            : "Front document saved.",
      });
    } catch {
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'importer le fichier.",
        variant: "destructive",
      });
    } finally {
      setUploadingFront(false);
    }
  }

  async function handleBackUpload(file: File | null) {
    if (!file) return;
    setUploadingBack(true);
    try {
      const url = await uploadFile(file, "id_document_back");
      const updated = {
        ...extras,
        idDocumentBackUrl: url,
      };
      onChange(updated);
      toast({
        title: safeLang === "fr" ? "Verso téléversé" : "Back document uploaded",
        description: safeLang === "fr" ? "Face arrière enregistrée." : "Back document saved.",
      });
    } catch {
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'importer le fichier verso.",
        variant: "destructive",
      });
    } finally {
      setUploadingBack(false);
    }
  }

  async function handleCaptureSelfie() {
    if (selfieUploading || verifying) return;
    setSelfieUploading(true);
    try {
      const file = await captureSelfieToFile();
      const selfieUrl = await uploadFile(file, "kyc_selfie");
      const updated = {
        ...extras,
        selfieUrl,
      };
      onChange(updated);
      setCameraOpen(false);
      stopCamera();
      toast({
        title: safeLang === "fr" ? "Selfie enregistré" : "Selfie saved",
        description:
          safeLang === "fr"
            ? "Le contrôle biométrique sera effectué par le service KYC."
            : "Biometric checks will be performed by the KYC service.",
      });
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Capture impossible",
        variant: "destructive",
      });
    } finally {
      setSelfieUploading(false);
    }
  }

  // Full verification check
  async function handleRunKycVerification() {
    if (!extras.idDocumentUrl) {
      toast({
        title: "Document manquant",
        description: "Veuillez d'abord téléverser votre pièce d'identité.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyIdentityDocument(
        extras.idDocumentUrl,
        selectedDocType === "passport"
          ? "PASSPORT"
          : selectedDocType === "driver_license"
          ? "DRIVER_LICENSE"
          : "ID_CARD",
        extras.selfieUrl
      );

      if (!result.valid) throw new Error("Le service KYC a refusé ce document");
      const candidateName = extractIdentityNameCandidate(userName || result.ocr_result?.full_name);

      const updated: ProfileExtras = {
        ...extras,
        idDocumentType: selectedDocType,
        idDocumentNumber: docNumber || result.ocr_result?.document_number || "",
        idDocumentCountry: docCountry,
        idVerified: true,
        idVerifiedAt: new Date().toLocaleDateString(safeLang === "fr" ? "fr-FR" : "en-US"),
        idExpiryDate: docExpiry || result.ocr_result?.expiry_date || "",
        ocrFullName: result.ocr_result?.full_name || userName || "",
      };

      onChange(updated);

      if (candidateName && onIdentityNameDetected) {
        void onIdentityNameDetected(`${candidateName.firstName} ${candidateName.lastName}`.trim());
      }

      toast({
        title: safeLang === "fr" ? "Vérification KYC réussie !" : "KYC verification completed!",
        description:
          safeLang === "fr"
            ? "Votre pièce d'identité et votre conformité financière sont validées."
            : "Your identity document and compliance are verified.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Vérification impossible.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Statut & Jauge KYC ── */}
      <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">
                {safeLang === "fr" ? "Conformité et Vérification KYC" : "KYC Compliance and Verification"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {safeLang === "fr"
                ? "Vérifiez vos coordonnées et votre pièce d'identité pour débloquer toutes les fonctionnalités."
                : "Verify your contact info and official ID to access all platform features."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={kycScore === 100 ? "default" : kycScore >= 60 ? "secondary" : "outline"}
              className={cn(
                "font-semibold text-xs py-1 px-3 gap-1.5",
                kycScore === 100
                  ? "bg-green-600 hover:bg-green-600 text-white"
                  : kycScore >= 60
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "text-muted-foreground"
              )}
            >
              {kycScore === 100 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{safeLang === "fr" ? "KYC Niveau 2 Validé (100%)" : "KYC Level 2 Verified (100%)"}</span>
                </>
              ) : kycScore >= 60 ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{safeLang === "fr" ? `Niveau 1 Partiel (${kycScore}%)` : `Partial Level 1 (${kycScore}%)`}</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{safeLang === "fr" ? `Non vérifié (${kycScore}%)` : `Unverified (${kycScore}%)`}</span>
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Barre de progression visuelle */}
        <div className="space-y-1.5">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                kycScore === 100
                  ? "bg-green-500"
                  : kycScore >= 60
                  ? "bg-amber-500"
                  : "bg-primary"
              )}
              style={{ width: `${kycScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground font-medium pt-1">
            <span className={emailVerified ? "text-green-600 font-semibold" : ""}>
              {emailVerified ? "✓ Email vérifié" : "1. Email"}
            </span>
            <span className={phoneVerified ? "text-green-600 font-semibold" : ""}>
              {phoneVerified ? "✓ Téléphone vérifié" : "2. Téléphone"}
            </span>
            <span className={idVerified ? "text-green-600 font-semibold" : ""}>
              {idVerified ? "✓ Pièce d'identité validée" : "3. Pièce d'identité"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Vérification E-mail et Téléphone ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Carte Email */}
        <div className="bg-card border rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {safeLang === "fr" ? "Adresse E-mail" : "Email Address"}
                </h4>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {userEmail || "email@utilisateur.com"}
                </p>
              </div>
            </div>

            {emailVerified ? (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs font-semibold gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{safeLang === "fr" ? "Vérifié" : "Verified"}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-xs">
                {safeLang === "fr" ? "À vérifier" : "Pending"}
              </Badge>
            )}
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {emailVerified
                ? safeLang === "fr"
                  ? `Authentifié le ${extras.emailVerifiedAt || "récemment"}`
                  : "Authenticated"
                : safeLang === "fr"
                ? "Code OTP de sécurité requis"
                : "OTP code required"}
            </span>
            {!emailVerified && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold h-8 gap-1.5"
                onClick={() => {
                  setEmailModalOpen(true);
                  handleSendEmailOtp();
                }}
              >
                <Send className="w-3 h-3" />
                {safeLang === "fr" ? "Vérifier" : "Verify"}
              </Button>
            )}
          </div>
        </div>

        {/* Carte Téléphone */}
        <div className="bg-card border rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {safeLang === "fr" ? "Numéro de Téléphone" : "Phone Number"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {extras.phone || phoneNumber ? `${extras.phone || phoneNumber}` : "Non renseigné"}
                </p>
              </div>
            </div>

            {phoneVerified ? (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs font-semibold gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{safeLang === "fr" ? "Vérifié" : "Verified"}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-xs">
                {safeLang === "fr" ? "À vérifier" : "Pending"}
              </Badge>
            )}
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {phoneVerified
                ? safeLang === "fr"
                  ? `Vérifié par SMS le ${extras.phoneVerifiedAt || "récemment"}`
                  : "Verified by SMS"
                : safeLang === "fr"
                ? "Code OTP par SMS requis"
                : "SMS OTP required"}
            </span>
            <Button
              size="sm"
              variant={phoneVerified ? "ghost" : "outline"}
              className="text-xs font-semibold h-8 gap-1.5"
              onClick={() => setPhoneModalOpen(true)}
            >
              {phoneVerified ? (
                safeLang === "fr" ? "Modifier" : "Edit"
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  {safeLang === "fr" ? "Vérifier par SMS" : "Verify SMS"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── 3. Pièce d'Identité Officielle (Passeport, CNI, Permis de conduire) ── */}
      <div className="bg-card border rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">
                {safeLang === "fr" ? "Pièce d'Identité Officielle" : "Official Identity Document"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {safeLang === "fr"
                ? "Sélectionnez votre document officiel : Passeport, Carte Nationale d'Identité (CNI) ou Permis de conduire."
                : "Select your ID type: Passport, National ID Card or Driver's License."}
            </p>
          </div>

          {idVerified && (
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs font-semibold gap-1 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{safeLang === "fr" ? "Document Authentifié & Conforme" : "ID Verified & Validated"}</span>
            </Badge>
          )}
        </div>

        {/* Sélecteur des 3 Types de Pièce */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {safeLang === "fr" ? "Type de document d'identité *" : "Identity Document Type *"}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Passeport */}
            <button
              type="button"
              onClick={() => {
                setSelectedDocType("passport");
                onChange({ ...extras, idDocumentType: "passport" });
              }}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                selectedDocType === "passport"
                  ? "bg-primary/10 border-primary text-foreground shadow-xs font-semibold ring-1 ring-primary/30"
                  : "bg-background border-border/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  {safeLang === "fr" ? "Passeport" : "Passport"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {safeLang === "fr" ? "Page photo + MRZ" : "Photo page + MRZ"}
                </div>
              </div>
            </button>

            {/* Carte Nationale d'Identité */}
            <button
              type="button"
              onClick={() => {
                setSelectedDocType("national_id");
                onChange({ ...extras, idDocumentType: "national_id" });
              }}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                selectedDocType === "national_id"
                  ? "bg-primary/10 border-primary text-foreground shadow-xs font-semibold ring-1 ring-primary/30"
                  : "bg-background border-border/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <HeroUserIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  {safeLang === "fr" ? "Carte d'Identité (CNI)" : "National ID Card"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {safeLang === "fr" ? "Recto et Verso" : "Front and Back"}
                </div>
              </div>
            </button>

            {/* Permis de conduire */}
            <button
              type="button"
              onClick={() => {
                setSelectedDocType("driver_license");
                onChange({ ...extras, idDocumentType: "driver_license" });
              }}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                selectedDocType === "driver_license"
                  ? "bg-primary/10 border-primary text-foreground shadow-xs font-semibold ring-1 ring-primary/30"
                  : "bg-background border-border/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <HeroCameraIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  {safeLang === "fr" ? "Permis de conduire" : "Driver's License"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {safeLang === "fr" ? "Recto et Verso" : "Front and Back"}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Détails du document */}
        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">
              {safeLang === "fr"
                ? selectedDocType === "passport"
                  ? "Numéro de passeport *"
                  : selectedDocType === "driver_license"
                  ? "Numéro de permis *"
                  : "Numéro de CNI / Identifiant *"
                : "Document Number *"}
            </Label>
            <Input
              value={docNumber}
              onChange={(e) => {
                setDocNumber(e.target.value);
                onChange({ ...extras, idDocumentNumber: e.target.value });
              }}
              placeholder={
                selectedDocType === "passport"
                  ? "Ex: 22AA12345"
                  : selectedDocType === "driver_license"
                  ? "Ex: 14AB987654"
                  : "Ex: CI003920194"
              }
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              {safeLang === "fr" ? "Pays d'émission *" : "Issuing Country *"}
            </Label>
            <div>
              <Select
                value={docCountry}
                onValueChange={(v) => {
                  setDocCountry(v);
                  onChange({ ...extras, idDocumentCountry: v });
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <SelectValue placeholder={safeLang === "fr" ? "Ex: RD Congo, Côte d'Ivoire..." : "Ex: RD Congo, Côte d'Ivoire..."} />
                </SelectTrigger>
                <SelectContent className="min-w-[12rem] rounded-xl border border-border bg-popover p-1">
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code} value={c.label}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              {safeLang === "fr" ? "Date d'expiration *" : "Expiration Date *"}
            </Label>
            <Input
              type="date"
              value={docExpiry}
              onChange={(e) => {
                setDocExpiry(e.target.value);
                onChange({ ...extras, idExpiryDate: e.target.value });
              }}
              className="text-xs"
            />
          </div>
        </div>

        {/* Zones de Téléversement adaptées au type */}
        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {safeLang === "fr" ? "Fichiers et Photos du document" : "Document Files and Images"}
          </Label>

          {selectedDocType === "passport" ? (
            /* Upload unique pour Passeport */
            <div className="border-2 border-dashed rounded-2xl p-6 text-center hover:border-primary/50 transition bg-muted/10 space-y-3">
              {extras.idDocumentUrl ? (
                <div className="space-y-3">
                  <div className="relative max-w-sm mx-auto h-40 rounded-xl overflow-hidden border shadow-xs bg-card">
                    <img
                      src={extras.idDocumentUrl}
                      alt="Passeport"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600 text-white text-[10px]">
                        ✓ {safeLang === "fr" ? "Passeport importé" : "Uploaded"}
                      </Badge>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold cursor-pointer hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{safeLang === "fr" ? "Remplacer la page du passeport" : "Replace file"}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(e) => handleFrontUpload(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold">
                    {safeLang === "fr"
                      ? "Téléverser la page d'identité du Passeport"
                      : "Upload Passport Identity Page"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {safeLang === "fr"
                      ? "Assurez-vous que la photo, le nom et les 2 lignes de codes MRZ en bas sont bien nets."
                      : "Ensure photo, full name and MRZ lines are clearly visible."}
                  </p>
                  <label className="inline-block pt-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={uploadingFront}
                      className="font-semibold pointer-events-none"
                    >
                      {uploadingFront ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-1.5" />
                      )}
                      {safeLang === "fr" ? "Sélectionner le fichier" : "Choose file"}
                    </Button>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(e) => handleFrontUpload(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              )}
            </div>
          ) : (
            /* Upload Recto / Verso pour CNI et Permis */
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Recto */}
              <div className="border-2 border-dashed rounded-2xl p-5 text-center hover:border-primary/50 transition bg-muted/10 space-y-3">
                {extras.idDocumentUrl ? (
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-xl overflow-hidden border shadow-xs bg-card">
                      <img
                        src={extras.idDocumentUrl}
                        alt="Recto"
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white text-[10px]">
                        ✓ Recto
                      </Badge>
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold cursor-pointer hover:underline">
                      <Upload className="w-3 h-3" />
                      <span>{safeLang === "fr" ? "Remplacer le recto" : "Replace front"}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => handleFrontUpload(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-bold">
                      {safeLang === "fr" ? "Face Avant (Recto) *" : "Front Side *"}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {safeLang === "fr" ? "Photo et nom lisibles" : "Readable photo and name"}
                    </p>
                    <label className="inline-block pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingFront}
                        className="text-xs font-semibold pointer-events-none"
                      >
                        {uploadingFront && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                        {safeLang === "fr" ? "Choisir Recto" : "Select Front"}
                      </Button>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => handleFrontUpload(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Verso */}
              <div className="border-2 border-dashed rounded-2xl p-5 text-center hover:border-primary/50 transition bg-muted/10 space-y-3">
                {extras.idDocumentBackUrl ? (
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-xl overflow-hidden border shadow-xs bg-card">
                      <img
                        src={extras.idDocumentBackUrl}
                        alt="Verso"
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white text-[10px]">
                        ✓ Verso
                      </Badge>
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold cursor-pointer hover:underline">
                      <Upload className="w-3 h-3" />
                      <span>{safeLang === "fr" ? "Remplacer le verso" : "Replace back"}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => handleBackUpload(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-bold">
                      {safeLang === "fr" ? "Face Arrière (Verso) *" : "Back Side *"}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {safeLang === "fr" ? "Mentions légales et signature" : "Signature and legal details"}
                    </p>
                    <label className="inline-block pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingBack}
                        className="text-xs font-semibold pointer-events-none"
                      >
                        {uploadingBack && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                        {safeLang === "fr" ? "Choisir Verso" : "Select Back"}
                      </Button>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => handleBackUpload(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Option Selfie / Vivacité biométrique */}
        <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">
                  {safeLang === "fr" ? "Selfie de Vivacité Biométrique" : "Biometric Liveness Selfie"}
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {safeLang === "fr"
                  ? "Permet la comparaison faciale instantanée avec la photo de votre pièce."
                  : "Enables instant face match with the photo on your official ID."}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5"
              onClick={openCameraForSelfie}
            >
              <Camera className="w-3.5 h-3.5" />
              {extras.selfieUrl
                ? safeLang === "fr" ? "Reprendre le selfie" : "Retake selfie"
                : safeLang === "fr" ? "Ouvrir la caméra" : "Open camera"}
            </Button>
          </div>

          {extras.selfieUrl && (
            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full overflow-hidden border">
                <img src={extras.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ {safeLang === "fr" ? "Selfie biométrique prêt pour validation" : "Selfie ready for verification"}
              </span>
            </div>
          )}
        </div>

        {/* Bouton de validation KYC */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t">
          <div className="text-xs text-muted-foreground">
            {idVerified ? (
              <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {safeLang === "fr"
                  ? `Pièce validée (${extras.idDocumentNumber || "N° enregistré"})`
                  : "Document approved"}
              </span>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={handleRunKycVerification}
            disabled={verifying || !extras.idDocumentUrl}
            className="w-full sm:w-auto font-semibold gap-2 shadow-xs"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{safeLang === "fr" ? "Analyse OCR et biométrie..." : "Verifying..."}</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                <span>
                  {idVerified
                    ? safeLang === "fr" ? "Re-vérifier la pièce" : "Re-verify document"
                    : safeLang === "fr" ? "Lancer la vérification KYC" : "Run KYC Verification"}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── 4. Coordonnées & Paiement ── */}
      <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          {safeLang === "fr" ? "Adresse et Coordonnées Financières" : "Address and Financial Details"}
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">
              {safeLang === "fr" ? "Adresse physique complète" : "Full Physical Address"}
            </Label>
            <Input
              value={extras.address ?? ""}
              onChange={(e) => onChange({ ...extras, address: e.target.value })}
              placeholder="Rue, quartier, ville, pays"
              className="text-xs"
            />
          </div>

          {universe === "porteur" ? (
            <div className="space-y-1.5">
              <Label className="text-xs">
                {safeLang === "fr" ? "Réception des fonds de levée" : "Payout Method"}
              </Label>
              <Input
                value={extras.paymentReceive ?? ""}
                onChange={(e) => onChange({ ...extras, paymentReceive: e.target.value })}
                placeholder="Ex: Virement bancaire entreprise, Mobile Money..."
                className="text-xs"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs">
                {safeLang === "fr" ? "Moyen d'investissement privilégié" : "Preferred Payment Method"}
              </Label>
              <Input
                value={extras.paymentSend ?? ""}
                onChange={(e) => onChange({ ...extras, paymentSend: e.target.value })}
                placeholder="Ex: Carte bancaire, Virement Swift, Wave..."
                className="text-xs"
              />
            </div>
          )}
        </div>

        {userType === "morale" && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                {safeLang === "fr" ? "Nom de l'entité / Société" : "Company Name"}
              </Label>
              <Input
                value={extras.companyName ?? ""}
                onChange={(e) => onChange({ ...extras, companyName: e.target.value })}
                placeholder="Ex: Holding ZIRA SAS"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                {safeLang === "fr" ? "N° RCCM / SIRET / Immatriculation" : "Registration Number"}
              </Label>
              <Input
                value={extras.companyRegistrationNumber ?? ""}
                onChange={(e) => onChange({ ...extras, companyRegistrationNumber: e.target.value })}
                placeholder="Ex: CI-ABJ-2024-B-12345"
                className="text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Vérification Email ── */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {safeLang === "fr" ? "Vérification de l'adresse e-mail" : "Email Verification"}
            </DialogTitle>
            <DialogDescription>
              {safeLang === "fr"
                ? `Un code de sécurité à 6 chiffres a été envoyé à ${userEmail || "votre compte"}.`
                : `A 6-digit security code was sent to your email.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs">
                {safeLang === "fr" ? "Saisir le code à 6 chiffres" : "Enter 6-digit code"}
              </Label>
              <Input
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="Ex: 482915"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest font-bold"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSendEmailOtp}
              className="text-xs text-muted-foreground"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {safeLang === "fr" ? "Renvoyer le code" : "Resend code"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEmailModalOpen(false)}>
                {safeLang === "fr" ? "Annuler" : "Cancel"}
              </Button>
              <Button type="button" onClick={handleVerifyEmailOtp} disabled={emailVerifying}>
                {emailVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {safeLang === "fr" ? "Valider l'email" : "Validate email"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Vérification Téléphone ── */}
      <Dialog open={phoneModalOpen} onOpenChange={setPhoneModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              {safeLang === "fr" ? "Vérification du numéro de téléphone" : "Phone Verification"}
            </DialogTitle>
            <DialogDescription>
              {safeLang === "fr"
                ? "Saisissez votre indicatif et votre numéro pour recevoir un code SMS."
                : "Enter your phone number to receive an SMS verification code."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Indicatif</Label>
                <select
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="w-full h-9 rounded-md border bg-background px-2 text-xs"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Numéro</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07 01 02 03 04"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">
                  {safeLang === "fr" ? "Code SMS reçu" : "Received SMS code"}
                </Label>
                <button
                  type="button"
                  onClick={handleSendPhoneOtp}
                  className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Send className="w-2.5 h-2.5" />
                  {safeLang === "fr" ? "Envoyer le SMS" : "Send SMS"}
                </button>
              </div>
              <Input
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                placeholder="Ex: 591402"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest font-bold"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setPhoneModalOpen(false)}>
              {safeLang === "fr" ? "Annuler" : "Cancel"}
            </Button>
            <Button type="button" onClick={handleVerifyPhoneOtp} disabled={phoneVerifying}>
              {phoneVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {safeLang === "fr" ? "Valider le téléphone" : "Validate phone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Caméra Selfie ── */}
      <Dialog
        open={cameraOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCameraOpen(false);
            stopCamera();
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              {safeLang === "fr" ? "Selfie de Vivacité Biométrique" : "Biometric Liveness Selfie"}
            </DialogTitle>
            <DialogDescription>
              {safeLang === "fr"
                ? "Centrez votre visage dans le cadre avec une bonne lumière, puis cliquez sur Capturer."
                : "Center your face in good light, then click Capture."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border bg-black/90 overflow-hidden relative flex items-center justify-center min-h-[300px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-[50vh] object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none m-6" />
            </div>

            {cameraStarting && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Initialisation de la caméra...</span>
              </p>
            )}

            {cameraError && (
              <p className="text-xs text-destructive text-center">{cameraError}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCameraOpen(false);
                stopCamera();
              }}
            >
              {safeLang === "fr" ? "Fermer" : "Close"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startCamera()}
              disabled={cameraStarting || selfieUploading}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              {safeLang === "fr" ? "Relancer caméra" : "Restart"}
            </Button>
            <Button
              type="button"
              onClick={handleCaptureSelfie}
              disabled={cameraStarting || !!cameraError || selfieUploading}
            >
              {selfieUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              {safeLang === "fr" ? "Capturer et valider" : "Capture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
