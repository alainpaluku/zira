import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useLang } from "@zira/shared";

interface EquityBreakdown {
  porteur: number;
  investors: number;
  available: number;
}

interface ProjectEquitySectionProps {
  equityBreakdown: EquityBreakdown;
}

/**
 * Visualisation de la table de capitalisation (Cap Table) du projet en Recharts.
 */
export function ProjectEquitySection({ equityBreakdown }: ProjectEquitySectionProps) {
  const { t } = useLang();

  const equityData = [
    { name: t.porteurEquityBreakdown, value: equityBreakdown.porteur, color: "hsl(var(--primary))" },
    { name: t.porteurEquityInvestors, value: equityBreakdown.investors, color: "hsl(142 76% 36%)" },
    { name: t.porteurEquityAvailable, value: equityBreakdown.available, color: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <h2 className="text-base font-semibold">Table de capitalisation (Cap Table)</h2>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={equityData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
            >
              {equityData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
            <Tooltip formatter={(v: number) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
