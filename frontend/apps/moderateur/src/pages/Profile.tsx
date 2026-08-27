import { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  Shield,
  Languages,
  Sun,
  Moon,
  Laptop,
  Check,
  Activity,
  Lock,
  Calendar,
  Save,
} from "@zira/ui/lib/hero-icons-compat";
import { Button, Input, Label, Textarea, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@zira/ui";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/data-context";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/components/ThemeProvider";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export default function ModerateurProfil() {
  const { refreshProfile, updateProfile, user: rawUser } = useAuth();
  const { kycRequests, projects } = useAppData();
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [name, setName] = useState(rawUser?.name || "Modérateur ZIRA");
  const [title, setTitle] = useState(rawUser?.title || "Agent de Conformité & Risque");
  const [bio, setBio] = useState(
    rawUser?.bio ||
      "Responsable de l'analyse réglementaire, de la vérification d'identité (KYC/KYB) et de la validation des levées de fonds sur Zira."
  );
  const [photo, setPhoto] = useState(rawUser?.photo || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rawUser) {
      setName(rawUser.name || "Modérateur ZIRA");
      setTitle(rawUser.title || "Agent de Conformité & Risque");
      if (rawUser.bio) setBio(rawUser.bio);
      if (rawUser.photo) setPhoto(rawUser.photo);
    }
  }, [rawUser]);

  const reviewedKycCount = kycRequests.filter((k) => k.status !== "pending").length;
  const moderatedProjectsCount = projects.filter((p) => p.status === "active" || p.status === "suspended").length;

  async function handleSaveProfile() {
    setIsSaving(true);
    try {
      await updateProfile({ name, title, bio, photo });
      await refreshProfile();
      toast({
        title: "Profil mis à jour",
        description: "Vos informations de modérateur ont été enregistrées avec succès.",
      });
    } catch (e) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le profil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t.profileMenuTitle || "Mon Compte"} — Modérateur
            </h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Accrédité Admin
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos informations de conformité, vos préférences de langue et le thème d'affichage.
          </p>
        </div>

        <Button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="gap-2 shadow-xs"
          id="btn-save-mod-profile"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Enregistrement..." : t.save || "Enregistrer"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity Card & Settings */}
        <div className="space-y-6">
          {/* Identity Card */}
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto relative mb-3">
                <UserAvatar name={name} photo={photo} size="xl" className="w-24 h-24 mx-auto ring-4 ring-primary/20 shadow-md" />
                <span className="absolute bottom-1 right-1/2 translate-x-8 p-1 rounded-full bg-emerald-500 text-white ring-2 ring-background">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{title}</CardDescription>
              <div className="flex justify-center mt-2">
                <Badge variant="outline" className="text-xs">
                  {rawUser?.email || "moderation@zira-invest.com"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 border-t space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-primary" /> Rôle
                </span>
                <span className="font-semibold text-foreground">Super Modérateur</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" /> Sécurité 2FA
                </span>
                <span className="text-emerald-600 font-semibold">Activée</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Membre depuis
                </span>
                <span className="font-semibold text-foreground">Janvier 2026</span>
              </div>
            </CardContent>
          </Card>

          {/* Preferences: Language & Theme */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                {t.profileMenuLanguage || "Langue de l'interface"}
              </CardTitle>
              <CardDescription>
                Choisissez votre langue de travail préférée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLang("fr")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                    lang === "fr"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "bg-card text-muted-foreground hover:text-foreground border-border"
                  )}
                >
                  <span className="text-base">🇫🇷</span>
                  <span>Français</span>
                  {lang === "fr" && <Check className="w-3.5 h-3.5 ml-1" />}
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                    lang === "en"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "bg-card text-muted-foreground hover:text-foreground border-border"
                  )}
                >
                  <span className="text-base">🇬🇧</span>
                  <span>English</span>
                  {lang === "en" && <Check className="w-3.5 h-3.5 ml-1" />}
                </button>
              </div>

              <div className="pt-3 border-t">
                <Label className="text-xs font-semibold mb-2 block text-muted-foreground">
                  {t.profileMenuTheme || "Thème d'affichage"}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all",
                      theme === "light"
                        ? "bg-card text-foreground border-primary ring-2 ring-primary/20 font-bold"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
                    )}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>{t.profileThemeLight || "Clair"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all",
                      theme === "dark"
                        ? "bg-card text-foreground border-primary ring-2 ring-primary/20 font-bold"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
                    )}
                  >
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span>{t.profileThemeDark || "Sombre"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all",
                      theme === "system"
                        ? "bg-card text-foreground border-primary ring-2 ring-primary/20 font-bold"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
                    )}
                  >
                    <Laptop className="w-4 h-4 text-purple-400" />
                    <span>{t.profileThemeSystem || "Auto"}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile & Activity Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informations du compte
              </CardTitle>
              <CardDescription>
                Ces informations sont visibles sur les rapports d'audit et les décisions de modération.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mod-name">Nom complet</Label>
                  <Input
                    id="mod-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nom du modérateur"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mod-title">Fonction / Titre</Label>
                  <Input
                    id="mod-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Responsable Conformité & KYC"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-photo">URL Photo de profil</Label>
                <Input
                  id="mod-photo"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-bio">Bio & Spécialité</Label>
                <Textarea
                  id="mod-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Décrivez vos compétences réglementaires..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Statistiques de modération & impact
              </CardTitle>
              <CardDescription>
                Vue d'ensemble de vos actions de conformité sur la plateforme ZIRA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border/60">
                  <p className="text-xs text-muted-foreground font-medium">Dossiers KYC analysés</p>
                  <p className="text-2xl font-black text-foreground mt-1">{reviewedKycCount}</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Vérifications traitées</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border/60">
                  <p className="text-xs text-muted-foreground font-medium">Projets audités</p>
                  <p className="text-2xl font-black text-foreground mt-1">{moderatedProjectsCount}</p>
                  <p className="text-[11px] text-blue-600 font-medium mt-0.5">Campagnes validées</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border/60">
                  <p className="text-xs text-muted-foreground font-medium">Actions au journal</p>
                  <p className="text-2xl font-black text-foreground mt-1">—</p>
                  <p className="text-[11px] text-purple-600 font-medium mt-0.5">Journal d’audit à connecter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
