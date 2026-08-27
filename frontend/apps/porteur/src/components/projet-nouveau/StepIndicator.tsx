import React from "react";
import { Check } from "@/lib/hero-icons-compat";

interface StepItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StepIndicatorProps {
  steps: StepItem[];
  currentStep: number;
  maxStepReached: number;
  onStepClick: (stepIndex: number) => void;
}

/**
 * Indicateur visuel d'étapes horizontales pour le tunnel de création de projet.
 */
export function StepIndicator({
  steps,
  currentStep,
  maxStepReached,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-1 overflow-x-auto py-2">
      {steps.map((s, idx) => {
        const Icon = s.icon;
        const isCurrent = idx === currentStep;
        const isPassed = idx < currentStep;
        const isClickable = idx <= maxStepReached;

        return (
          <button
            key={idx}
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onStepClick(idx)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              isCurrent
                ? "bg-primary text-primary-foreground shadow-xs"
                : isPassed
                ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                : "bg-muted/40 text-muted-foreground opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-background/20 text-xs">
              {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
            </div>
            <Icon className="w-3.5 h-3.5 hidden sm:inline" />
            <span>{s.title}</span>
          </button>
        );
      })}
    </div>
  );
}
