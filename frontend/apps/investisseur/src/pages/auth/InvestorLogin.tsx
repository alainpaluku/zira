import React, { useState } from "react";
import { useSignIn, useSignUp, useClerk } from "@clerk/react";
import { useLocation } from "wouter";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zira/ui";
import { useLang } from "@zira/shared/lib/i18n";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";

export default function InvestorLogin() {
	const clerk: any = useClerk(); const signInState: any = useSignIn(); const signUpState: any = useSignUp();
	const signIn: any = signInState.signIn?.value || signInState.signIn; const signUp: any = signUpState.signUp?.value || signUpState.signUp;
  const [tab, setTab] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [investorType, setInvestorType] = useState<"individual" | "institutional">("individual");

  const [, navigate] = useLocation();
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError(t("auth.requiredFields", "Veuillez remplir tous les champs obligatoires"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!signIn) throw new Error("Authentification indisponible");
      const result = await signIn.create({ identifier: identifier.trim(), password });
      if (result.status !== "complete" || !result.createdSessionId) throw new Error("Vérification supplémentaire requise");
      await clerk.setActive({ session: result.createdSessionId }); window.dispatchEvent(new Event("zira-auth-ready"));
      navigate("/investisseur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalidCredentials", "Identifiants incorrects"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError(t("auth.requiredFields", "Veuillez remplir tous les champs obligatoires"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch", "Les mots de passe ne correspondent pas"));
      return;
    }
    if (password.length < 8) {
      setError(t("auth.passwordTooShort", "Le mot de passe doit comporter au moins 8 caractères"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!signUp) throw new Error("Authentification indisponible");
      const result = await signUp.create({
        username: username.trim().toLowerCase(),
        emailAddress: email.trim().toLowerCase(),
        firstName: (fullName.trim() || username.trim()).split(" ")[0],
        lastName: (fullName.trim() || username.trim()).split(" ").slice(1).join(" ") || undefined,
        password,
        unsafeMetadata: { role: "investisseur", investorType },
      });
      if (result.status !== "complete" || !result.createdSessionId) { await signUp.verifications.prepareEmailAddress({ strategy: "email_code" }); throw new Error("Un code de vérification a été envoyé par e-mail"); }
      await clerk.setActive({ session: result.createdSessionId }); window.dispatchEvent(new Event("zira-auth-ready"));
      navigate("/investisseur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error", "Erreur lors de la création du compte"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground text-2xl font-black mb-2 shadow-sm">
            Z
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t("common.appName", "ZIRA INVEST")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("auth.investorPortalSubtitle", "Investissez dans des pépites à fort impact et pilotez votre portefeuille.")}
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">
              {t("auth.investorPortal", "Espace Investisseur")}
            </CardTitle>
            <CardDescription>
              {lang === "fr"
                ? "Connexion sécurisée par nom d'utilisateur ou e-mail"
                : "Secure authentication by username or email"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "register"); setError(""); }}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="flex items-center gap-1.5">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  {t("auth.login", "Connexion")}
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1.5">
                  <UserPlusIcon className="w-4 h-4" />
                  {t("auth.register", "Créer un compte")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-login-ident">{t("auth.identifier", "Email ou nom d'utilisateur")}</Label>
                    <Input
                      id="inv-login-ident"
                      type="text"
                      placeholder={t("auth.identifierPlaceholder", "nom_utilisateur ou email@domaine.com")}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="inv-login-password">{t("auth.password", "Mot de passe")}</Label>
                      <button
                        type="button"
                        onClick={() => setError("La réinitialisation du mot de passe doit être activée dans Clerk.")}
                        className="text-xs text-primary hover:underline"
                      >
                        {t("auth.forgotPassword", "Mot de passe oublié ?")}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="inv-login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 text-center">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full font-semibold"
                    disabled={loading}
                  >
                    {loading ? t("common.loading", "Connexion...") : t("auth.login", "Se connecter")}
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-reg-username">{t("auth.username", "Nom d'utilisateur")}</Label>
                    <Input
                      id="inv-reg-username"
                      type="text"
                      placeholder={t("auth.usernamePlaceholder", "nom_utilisateur")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inv-reg-email">{t("auth.email", "Adresse email")}</Label>
                    <Input
                      id="inv-reg-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder", "investisseur@domaine.com")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inv-reg-name">{t("auth.fullName", "Nom complet / Raison sociale")}</Label>
                    <Input
                      id="inv-reg-name"
                      type="text"
                      placeholder={t("auth.fullNamePlaceholder", "ex: Amina Diallo ou Sahel Fund")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{lang === "fr" ? "Type d'investisseur" : "Investor Type"}</Label>
                    <Select value={investorType} onValueChange={(v) => setInvestorType(v as "individual" | "institutional")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">{lang === "fr" ? "Particulier / Business Angel" : "Individual / Angel"}</SelectItem>
                        <SelectItem value="institutional">{lang === "fr" ? "Personne Morale / Fonds" : "Institution / Fund"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="inv-reg-password">{t("auth.password", "Mot de passe")}</Label>
                      <Input
                        id="inv-reg-password"
                        type="password"
                        placeholder="Min 8 car."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="inv-reg-confirm">{t("auth.confirmPassword", "Confirmer")}</Label>
                      <Input
                        id="inv-reg-confirm"
                        type="password"
                        placeholder="Min 8 car."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 text-center">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full font-semibold"
                    disabled={loading}
                  >
                    {loading ? t("common.loading", "Création...") : t("auth.register", "Créer mon compte investisseur")}
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="pt-2 text-center">
              <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
                <LockClosedIcon className="w-3.5 h-3.5" />
                {t("auth.secureNotice", "Accès sécurisé et chiffré de bout en bout.")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
