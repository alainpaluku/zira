import { useEffect } from "react";
import { useLocation } from "wouter";
import { isOnboarded } from "./OnboardingCarousel";

export function RedirectIfNotOnboarded({
  universe,
  to,
}: {
  universe: "porteur" | "investisseur" | "moderation";
  to: string;
}) {
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!isOnboarded(universe)) navigate(to);
  }, [universe, to, navigate]);
  return null;
}
