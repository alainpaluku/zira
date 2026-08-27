import React from "react";
import { cn } from "../lib/utils";
import { Loader2 } from "../lib/hero-icons-compat";

export interface LoadingStateProps {
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  label = "Chargement...",
  className,
  fullScreen = false,
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
