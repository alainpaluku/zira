import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const CHART_COLORS = ["#D4A843", "#3B82F6", "#10B981", "#F97316", "#8B5CF6"];

interface PieDataItem {
  name: string;
  value: number;
}

interface WalletBreakdownChartProps {
  data: PieDataItem[];
  formatUSD: (val: number) => string;
}

/**
 * Graphique circulaire illustrant la répartition des capitaux par projet.
 */
export function WalletBreakdownChart({ data, formatUSD }: WalletBreakdownChartProps) {
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="bg-card border rounded-2xl p-5">
      <h2 className="text-base font-semibold mb-4">Répartition par projet</h2>
      {hasData ? (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={55} outerRadius={85} strokeWidth={2}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatUSD(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">{d.name}</span>
                </div>
                <span className="font-medium shrink-0 ml-2">{formatUSD(d.value)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-muted-foreground py-8 text-sm">Aucun investissement reçu</p>
      )}
    </div>
  );
}
