import { cn } from "../lib/utils";
import { SectorImage } from "@/components/SectorImage";
import type { Sector } from "@zira/shared";

interface ProjectRowProps {
  name: string;
  sector: Sector | string;
  meta?: string;
  statusLabel: string;
  statusClass: string;
  percent: number;
  raisedLabel: string;
  percentLabel: string;
  logo?: string | null;
  poster?: string | null;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function ProjectRow({
  name,
  sector,
  meta,
  statusLabel,
  statusClass,
  percent,
  raisedLabel,
  percentLabel,
  logo,
  poster,
  onClick,
  className,
  children,
}: ProjectRowProps) {
  const imgSrc = (logo ?? poster) || "";

  return (
    <div
      className={cn("bg-card border rounded-2xl p-3.5 sm:p-4 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="flex items-center sm:items-start gap-3 sm:gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden shrink-0 bg-muted">
          <SectorImage
            src={imgSrc}
            alt={name}
            sector={sector}
            variant="logo"
            initial={name.slice(0, 1)}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">{name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {sector}{meta ? ` · ${meta}` : ""}
              </p>
            </div>
            <span className={cn("text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0 self-start sm:self-auto", statusClass)}>
              {statusLabel}
            </span>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1.5 text-muted-foreground font-medium">
              <span className="truncate mr-2">{raisedLabel}</span>
              <span className="font-semibold text-foreground shrink-0">{percentLabel}</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
