import React from "react";
import { cn } from "../lib/utils";
import { SectorImage } from "./SectorImage";
import { Progress } from "./ui/Progress";
import { Badge } from "./ui/Badge";
import { TrendingUp, Users, MapPin } from "../lib/hero-icons-compat";

export interface ProjectCardProps {
  id: string;
  name: string;
  tagline?: string;
  sector: string;
  location?: string;
  status?: string;
  statusLabel?: string;
  statusClass?: string;
  raisedAmount: number;
  targetAmount: number;
  equityPercent?: number;
  investorCount?: number;
  logo?: string | null;
  poster?: string | null;
  formattedRaised?: string;
  formattedTarget?: string;
  onClick?: () => void;
  className?: string;
  footer?: React.ReactNode;
}

export function ProjectCard({
  name,
  tagline,
  sector,
  location,
  statusLabel,
  statusClass,
  raisedAmount,
  targetAmount,
  equityPercent,
  investorCount,
  logo,
  poster,
  formattedRaised,
  formattedTarget,
  onClick,
  className,
  footer,
}: ProjectCardProps) {
  const percent = targetAmount > 0 ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100)) : 0;
  const imgSrc = poster || logo || "";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-card border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all flex flex-col cursor-pointer",
        className
      )}
    >
      {/* Poster Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <SectorImage
          src={imgSrc}
          alt={name}
          sector={sector}
          variant="cover"
          initial={name.slice(0, 1)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Sector Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-background/90 text-foreground backdrop-blur-sm shadow-xs">
          {sector}
        </span>

        {/* Status Badge */}
        {statusLabel && (
          <span
            className={cn(
              "absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs",
              statusClass || "bg-primary/90 text-primary-foreground"
            )}
          >
            {statusLabel}
          </span>
        )}

        {/* Location */}
        {location && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-white/90 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
          {tagline && (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {tagline}
            </p>
          )}
        </div>

        {/* Progress & Financials */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-foreground font-semibold">
              {formattedRaised ?? `$${raisedAmount.toLocaleString()}`}
            </span>
            <span className="text-muted-foreground">
              {percent}% sur {formattedTarget ?? `$${targetAmount.toLocaleString()}`}
            </span>
          </div>
          <Progress value={percent} className="h-2 rounded-full" />

          {/* Quick Metrics */}
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            {equityPercent !== undefined && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                {equityPercent}% Equity
              </span>
            )}
            {investorCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {investorCount} investisseurs
              </span>
            )}
          </div>
        </div>

        {footer}
      </div>
    </div>
  );
}
