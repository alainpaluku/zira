import { useEffect } from "react";
import { useLocation } from "wouter";
import { OnboardingCarousel, isOnboarded } from "@zira/ui";
import { INVESTISSEUR_ONBOARDING_SLIDES as slides } from "@zira/shared";

export default function InvestisseurOnboarding() {
  const [, navigate] = useLocation();
  useEffect(() => {
    if (isOnboarded("investisseur")) navigate("/investisseur/dashboard");
  }, [navigate]);

  return (
    <OnboardingCarousel
      universe="investisseur"
      slides={slides}
      finishHref="/investisseur/dashboard"
      brandTone="accent"
    />
  );
}
