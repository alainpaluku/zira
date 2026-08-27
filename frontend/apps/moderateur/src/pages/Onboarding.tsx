import { useEffect } from "react";
import { useLocation } from "wouter";
import { OnboardingCarousel, isOnboarded } from "@zira/ui";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    title: "Espace Conformité et Modération",
    description: "Outils de supervision avancés pour garantir la conformité réglementaire et la sécurité de l'écosystème ZIRA."
  },
  {
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    title: "Vérification KYC et Identité",
    description: "Examinez les pièces d'identité, justificatifs d'activité et statuts légaux des investisseurs et porteurs."
  },
  {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    title: "Audit et Validation des Campagnes",
    description: "Analysez les plans financiers, l'équipe fondatrice et validez la mise en ligne des levées de fonds."
  },
  {
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    title: "Surveillance des Flux et Séquestre",
    description: "Contrôlez les souscriptions, les déblocages de tranches et les remboursements en temps réel."
  }
];

export default function ModerationOnboarding() {
  const [, navigate] = useLocation();
  useEffect(() => {
    if (isOnboarded("moderation")) navigate("/moderation/dashboard");
  }, [navigate]);

  return (
    <OnboardingCarousel
      universe="moderation"
      slides={slides}
      finishHref="/moderation/dashboard"
      brandTone="muted"
    />
  );
}
