import { useState } from "react";
import { Sector, SECTOR_COLORS } from "@zira/shared";
import { cn } from "../lib/utils";

interface SectorImageProps {
  src?: string | null;
  alt: string;
  sector: Sector | string;
  className?: string;
  variant?: "poster" | "logo" | "cover";
  initial?: string;
}

export function SectorImage({ src, alt, sector, className, variant = "poster", initial }: SectorImageProps) {
  const [errored, setErrored] = useState(false);
  const baseUrl = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  const color = SECTOR_COLORS[sector as Sector] || SECTOR_COLORS.Autre;

  if (!src || errored) {
    return (
      <div
        className={cn(
          "flex items-center justify-center font-bold text-white",
          variant === "logo" ? "text-xl" : "text-3xl",
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}80)`,
        }}
      >
        {initial ?? alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  const fullSrc = src.startsWith("/") ? `${baseUrl}${src}` : src;

  return (
    <img
      src={fullSrc}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
