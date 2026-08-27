import React, { useState } from "react";
import { useSignIn, useClerk } from "@clerk/react";
import { useLocation } from "wouter";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@zira/ui";
import { useLang } from "@zira/shared/lib/i18n";
import {
  ShieldCheckIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";

export default function ModeratorLogin() {
	const clerk: any = useClerk(); const signInState: any = useSignIn(); const signIn: any = signInState.signIn?.value || signInState.signIn;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
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
      navigate("/moderateur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalidCredentials", "Accès refusé ou identifiants invalides"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl font-black mb-2 shadow-sm">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t("common.appName", "ZIRA INVEST")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("auth.moderatorPortalSubtitle", "Vérification KYC, audits réglementaires et gouvernance des projets.")}
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-xl">
                {t("auth.moderatorPortal", "Espace Modération & Conformité")}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {lang === "fr"
                ? "Espace de supervision réservé aux agents de conformité"
                : "Supervision console restricted to compliance officers"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mod-ident">{t("auth.identifier", "Email ou nom d'utilisateur")}</Label>
                <Input
                  id="mod-ident"
                  type="text"
                  placeholder="admin@zira-invest.cd ou admin_compliance"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mod-password">{t("auth.password", "Mot de passe")}</Label>
                <div className="relative">
                  <Input
                    id="mod-password"
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
                className="w-full font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? t("common.loading", "Vérification...") : t("auth.login", "Se connecter")}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2 border-t">
            <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
              <LockClosedIcon className="w-3.5 h-3.5" />
              {t("auth.secureNotice", "Accès sécurisé et chiffré de bout en bout.")}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
