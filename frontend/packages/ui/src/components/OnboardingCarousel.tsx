import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check } from "@/lib/hero-icons-compat";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface OnboardingSlide {
  image: string;
  title: string;
  description: string;
}

interface OnboardingCarouselProps {
  universe: "porteur" | "investisseur" | "moderation";
  slides: OnboardingSlide[];
  finishHref: string;
  brandTone: "primary" | "accent" | "muted";
}

const STORAGE_PREFIX = "zira_onboarded_";

export function isOnboarded(universe: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + universe) === "1";
  } catch {
    // Private browsing/storage policies must not make the app crash. In that
    // case the safest behaviour is to show onboarding again.
    return false;
  }
}

export function setOnboarded(universe: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + universe, "1");
  } catch {
    // Ignore storage errors; navigation can still continue.
  }
}

export function OnboardingCarousel({ universe, slides, finishHref, brandTone }: OnboardingCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, navigate] = useLocation();
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleNext = () => {
    if (!emblaApi) return;
    if (selectedIndex < slides.length - 1) {
      emblaApi.scrollNext();
    } else {
      setOnboarded(universe);
      navigate(finishHref);
    }
  };

  const handleSkip = () => {
    setOnboarded(universe);
    navigate(finishHref);
  };

  const isLast = selectedIndex === slides.length - 1;
  const accent =
    brandTone === "primary" ? "bg-primary" : brandTone === "accent" ? "bg-accent" : "bg-foreground";
  const accentText =
    brandTone === "primary" ? "text-primary-foreground" : brandTone === "accent" ? "text-accent-foreground" : "text-background";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="font-bold text-xl text-primary">ZIRA</div>
        <Button variant="ghost" onClick={handleSkip} data-testid="button-skip-onboarding">
          Passer
        </Button>
      </header>
      <div className="flex-1 flex flex-col">
        <div className="overflow-hidden flex-1" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0 h-full px-4 md:px-12">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-md mx-auto h-full flex flex-col items-center justify-center text-center gap-6 py-8"
                >
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted/30 border border-border/60 shadow-md relative flex items-center justify-center">
                    <img
                      src={slide.image.startsWith("http") ? slide.image : `${baseUrl}${slide.image}`}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{slide.title}</h2>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{slide.description}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-10 pt-4 max-w-md mx-auto w-full">
          <div className="flex items-center justify-center gap-2 mb-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Aller à la diapositive ${idx + 1}`}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === selectedIndex ? "w-8 bg-primary" : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
          <Button
            size="lg"
            className={cn("w-full h-12 text-base gap-2", accent, accentText, "hover:opacity-90")}
            onClick={handleNext}
            data-testid="button-next-onboarding"
          >
            {isLast ? (
              <>
                Commencer <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Suivant <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
