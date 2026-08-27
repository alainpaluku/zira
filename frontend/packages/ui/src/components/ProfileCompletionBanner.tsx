import { useLocation } from "wouter";
import { AlertCircle, X } from "@/lib/hero-icons-compat";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { useLang } from "@/lib/i18n";
import {
  dismissProfileBanner,
  getFieldLabel,
  getMissingFields,
  getProfileBannerFields,
  isProfileBannerDismissed,
  type ProfileUniverse,
} from "@/lib/profile-completion";
import { useMemo, useState } from "react";

interface ProfileCompletionBannerProps {
  universe: ProfileUniverse;
}

export function ProfileCompletionBanner({ universe }: ProfileCompletionBannerProps) {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [, navigate] = useLocation();
  const [dismissed, setDismissed] = useState(() =>
    profile ? isProfileBannerDismissed(profile.id) : false,
  );

  const missing = useMemo(() => {
    if (!profile) return getProfileBannerFields(universe);
    return getMissingFields(profile, universe);
  }, [profile, universe]);

  if (!profile || missing.length === 0 || dismissed) return null;

  const profileHref = universe === "porteur" ? "/porteur/profil" : "/investisseur/profil";

  function handleDismiss() {
    if (profile) dismissProfileBanner(profile.id);
    setDismissed(true);
  }

  function goToProfile() {
    navigate(profileHref);
  }

  return (
    <div className="px-4 md:px-6 pt-4">
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          {lang === "fr" ? "Profil incomplet" : "Incomplete profile"}
        </AlertTitle>
        <AlertDescription className="text-amber-900/90 dark:text-amber-100/90">
          <p className="mb-2">
            {lang === "fr"
              ? "Complétez votre profil pour utiliser toutes les fonctionnalités de la plateforme."
              : "Complete your profile to use all platform features."}
          </p>
          <ul className="list-disc list-inside text-sm space-y-0.5 mb-3">
            {missing.slice(0, 5).map((field) => (
              <li key={field}>{getFieldLabel(field, lang)}</li>
            ))}
            {missing.length > 5 && (
              <li className="list-none text-muted-foreground">
                +{missing.length - 5} {lang === "fr" ? "autre(s)" : "more"}
              </li>
            )}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="default" type="button" onClick={goToProfile}>
              {lang === "fr" ? "Compléter mon profil" : "Complete my profile"}
            </Button>
            <Button size="sm" variant="ghost" className="gap-1" type="button" onClick={handleDismiss}>
              <X className="w-3.5 h-3.5" />
              {lang === "fr" ? "Plus tard" : "Later"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
