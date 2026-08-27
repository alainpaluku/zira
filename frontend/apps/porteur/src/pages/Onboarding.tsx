import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { OnboardingCarousel, isOnboarded } from "@zira/ui";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    title: "Donnez vie à votre projet",
    description: "Présentez votre startup à une communauté d'investisseurs régionaux et de la diaspora prêts à vous financer."
  },
  {
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    title: "Valorisez votre équipe",
    description: "Ajoutez les profils clés et l'expertise de vos co-fondateurs pour maximiser la confiance des investisseurs."
  },
  {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    title: "Configurez votre levée de fonds",
    description: "Définissez votre objectif de capital, le pourcentage d'équité cédé et les montants minimums par ticket."
  },
  {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    title: "Suivez vos performances en temps réel",
    description: "Tableau de bord interactif pour suivre les engagements, les souscriptions et la répartition de votre capital."
  }
];

/**
 * Carrousel d'accueil et d'onboarding pour les nouveaux porteurs de projets.
 */
export default function PorteurOnboarding() {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isOnboarded("porteur")) navigate("/porteur/dashboard");
  }, [navigate]);

  return (
    <OnboardingCarousel
      universe="porteur"
      slides={SLIDES}
      finishHref="/porteur/dashboard"
      brandTone="primary"
    />
  );
}
