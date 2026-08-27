import { cn } from "../lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
  icon?: ReactNode;
  iconBg?: string;
  className?: string;
}

export function StatCard({ label, value, sub, subClass, icon, iconBg, className }: StatCardProps) {
  return (
    <div className={cn("bg-card border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-colors", className)}>
      <div>
        {icon && (
          <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3 shrink-0", iconBg)}>
            {icon}
          </div>
        )}
        <p className={cn("text-xs sm:text-sm text-muted-foreground truncate", icon ? "" : "mb-1")}>{label}</p>
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">{value}</p>
      </div>
      {sub && <p className={cn("text-[11px] sm:text-xs mt-1.5 font-medium truncate", subClass ?? "text-primary")}>{sub}</p>}
    </div>
  );
}

