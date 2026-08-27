import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@zira/ui";
import {
  UserIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/auth-context";
import { RedirectIfNotOnboarded, isOnboarded } from "@zira/ui";
import { useToast } from "@/hooks/useToast";
import { useLang } from "@/lib/i18n";
import { updateUserProfile, uploadFile } from "@/lib/api-client";

export default function InvestisseurProfil() {
  const { toast } = useToast();
  const { t, lang } = useLang();
  const { profile, refreshProfile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    title: "",
    bio: "",
    photo: "",
    companyName: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name ?? "",
      username: profile.username ?? profile.email?.split("@")[0] ?? "",
      title: profile.title ?? "",
      bio: profile.bio ?? "",
      photo: profile.photo ?? "",
      companyName: profile.companyName ?? "",
    });
  }, [profile]);

  if (!isOnboarded("investisseur")) {
    return (
      <RedirectIfNotOnboarded
        universe="investisseur"
        to="/investisseur/onboarding"
      />
    );
  }

  if (!profile) {
    return (
      <div className="py-20 px-6 text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
          <UserIcon className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">{t("profile.title", "Profil Utilisateur")}</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          {t("common.loading", "Chargement de votre session...")}
        </p>
      </div>
    );
  }

  const username = profile.username || profile.email?.split("@")[0] || "investor";

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.id, {
        name: form.name,
        title: form.title,
        bio: form.bio,
        companyName: form.companyName,
        photo: form.photo,
      });
      await refreshProfile();
      setOpen(false);
      toast({
        title: t("common.success", "Opération réussie"),
        description: t("profile.updateSuccess", "Profil mis à jour avec succès"),
      });
    } catch (e) {
      toast({
        title: t("common.error", "Erreur"),
        description: e instanceof Error ? e.message : "Erreur de mise à jour",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(file: File | null) {
    if (!file || !profile) return;
    try {
      const url = await uploadFile(file, "avatar");
      setForm((f) => ({ ...f, photo: url }));
      await updateUserProfile(profile.id, { photo: url });
      await refreshProfile();
      toast({
        title: t("common.success", "Photo mise à jour"),
      });
    } catch {
      toast({
        title: t("common.error", "Erreur"),
        description: "Échec du téléchargement",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="py-6 px-4 md:px-6 max-w-4xl mx-auto space-y-6">
      {/* Header Profile Identity Card */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-inner">
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-primary">
                    {(profile.name || "U").slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <label
                htmlFor="profile-photo-input"
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-lg cursor-pointer shadow hover:opacity-90 transition-opacity"
                title="Changer la photo"
              >
                <CameraIcon className="w-4 h-4" />
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                <Badge variant="secondary" className="font-mono text-xs">
                  @{username}
                </Badge>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {lang === "fr" ? "Investisseur" : "Investor"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                <EnvelopeIcon className="w-4 h-4" />
                {profile.email}
              </p>
              {profile.title && (
                <p className="text-sm text-foreground/80 flex items-center justify-center sm:justify-start gap-1">
                  <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                  {profile.title} {profile.companyName ? `• ${profile.companyName}` : ""}
                </p>
              )}
            </div>

            <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
              <PencilSquareIcon className="w-4 h-4" />
              {t("common.edit", "Modifier")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details & First-Class Username Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IdentificationIcon className="w-5 h-5 text-primary" />
              {t("profile.accountInfo", "Informations du compte")}
            </CardTitle>
            <CardDescription>
              {lang === "fr"
                ? "Identifiants système et données d'authentification"
                : "System identifiers and credentials"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">{t("profile.usernameLabel", "Nom d'utilisateur")}</span>
              <span className="font-semibold font-mono">@{username}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">{t("profile.emailLabel", "Email")}</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">{t("profile.roleLabel", "Rôle")}</span>
              <span className="font-medium capitalize">{profile.role}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">{lang === "fr" ? "Membre depuis" : "Member since"}</span>
              <span className="text-muted-foreground">
                {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : "2025"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KYC Compliance Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              {t("profile.kycStatusLabel", "Statut de conformité KYC")}
            </CardTitle>
            <CardDescription>
              {lang === "fr"
                ? "Niveau de conformité pour les investissements"
                : "Compliance tier for investment operations"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-semibold text-sm">
                    {profile.kycStatus === "approved" || profile.status === "active"
                      ? t("kyc.statusApproved", "Identité Vérifiée")
                      : t("kyc.statusPending", "En cours d'examen")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "fr"
                      ? "Plafond d'investissement débloqué"
                      : "Standard investment limits unlocked"}
                  </p>
                </div>
              </div>
              <a
                href="/investisseur/kyc"
                className="text-xs font-semibold text-primary hover:underline"
              >
                {lang === "fr" ? "Consulter le dossier" : "View Dossier"} &rarr;
              </a>
            </div>

            {profile.bio && (
              <div className="space-y-1 pt-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  {t("profile.bio", "Biographie")}
                </span>
                <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-2.5 rounded-lg border">
                  {profile.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("common.edit", "Modifier")} {t("profile.title", "Mon Profil")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t("profile.fullNameLabel", "Nom complet")}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("profile.companyName", "Organisation / Entreprise")}</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="ex: Sahel Impact Fund"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{lang === "fr" ? "Titre / Fonction" : "Title / Function"}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="ex: Business Angel / Managing Partner"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("profile.bio", "Biographie")}</Label>
              <Textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Décrivez votre expérience et vos critères d'investissement..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel", "Annuler")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("common.loading", "Enregistrement...") : t("common.save", "Enregistrer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
