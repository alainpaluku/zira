import React from "react";
import { Slider, Input, Label } from "@zira/ui";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { useLang } from "@zira/shared";

interface StepEquityProps {
  porteurEquity: number;
  setPorteurEquity: (val: number) => void;
  equityPercent: number;
  errors: Record<string, string>;
}

/**
 * Étape 3 : Configuration de la table de capitalisation (Cap Table).
 */
export function StepEquity({
  porteurEquity,
  setPorteurEquity,
  equityPercent,
  errors,
}: StepEquityProps) {
  const { t } = useLang();

  const equityData = [
    { name: "Fondateurs / Porteur", value: porteurEquity, color: "hsl(var(--primary))" },
    { name: "Investisseurs ZIRA", value: equityPercent, color: "hsl(142 76% 36%)" },
    { name: "Pool Résiduel", value: Math.max(0, 100 - porteurEquity - equityPercent), color: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-6 shadow-xs">
      <div>
        <h2 className="text-base font-semibold">{t.porteurFormEquityTitle} (Cap Table)</h2>
        <p className="text-sm text-muted-foreground">Définissez la répartition du capital de votre société.</p>
      </div>

      <div className="space-y-4 p-4 rounded-xl bg-muted/20 border">
        <div className="flex justify-between items-center text-sm">
          <div>
            <Label className="font-semibold text-sm">{t.porteurFormPorteurShare} (Fondateurs)</Label>
            <p className="text-xs text-muted-foreground">Pourcentage total détenu par l'équipe fondatrice</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={99}
              value={porteurEquity}
              onChange={(e) => setPorteurEquity(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
              className="w-20 text-right font-bold text-base h-9"
            />
            <span className="font-bold text-base">%</span>
          </div>
        </div>

        <Slider
          value={[porteurEquity]}
          onValueChange={(v) => setPorteurEquity(v[0])}
          min={1}
          max={99}
          step={1}
          className="py-2"
        />
        {errors.porteurEquity && <p className="text-xs text-destructive">{errors.porteurEquity}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl border bg-primary/5">
          <div className="text-xs text-muted-foreground font-medium">Part Fondateurs</div>
          <div className="text-xl font-bold text-primary mt-0.5">{porteurEquity}%</div>
        </div>
        <div className="p-3 rounded-xl border bg-green-500/10">
          <div className="text-xs text-muted-foreground font-medium">Levée ZIRA</div>
          <div className="text-xl font-bold text-green-700 dark:text-green-400 mt-0.5">{equityPercent}%</div>
        </div>
        <div className="p-3 rounded-xl border bg-muted/30">
          <div className="text-xs text-muted-foreground font-medium">Pool Résiduel</div>
          <div className="text-xl font-bold mt-0.5">{Math.max(0, 100 - porteurEquity - equityPercent)}%</div>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={equityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
              {equityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
            <Tooltip formatter={(v: number) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
