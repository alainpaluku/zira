import React, { useRef } from "react";
import { Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from "@zira/ui";
import { Upload, Image as ImageIcon, Globe, Video } from "@/lib/hero-icons-compat";
import { SECTORS, useLang, type ProjectSector } from "@zira/shared";
import { SUGGESTED_MARKETS } from "./types";

interface StepInfoProps {
  name: string;
  setName: (v: string) => void;
  sector: ProjectSector;
  setSector: (v: ProjectSector) => void;
  targetMarket: string;
  setTargetMarket: (v: string) => void;
  shortDescription: string;
  setShortDescription: (v: string) => void;
  logo: string;
  setLogo: (v: string) => void;
  poster: string;
  setPoster: (v: string) => void;
  videoUrl: string;
  setVideoUrl: (v: string) => void;
  onUpload: (file: File, type: "logo" | "poster") => Promise<void>;
  errors: Record<string, string>;
}

/**
 * Étape 1 : Informations générales, pitch, médias et positionnement marché.
 */
export function StepInfo({
  name, setName, sector, setSector, targetMarket, setTargetMarket,
  shortDescription, setShortDescription, logo, setLogo, poster, setPoster,
  videoUrl, setVideoUrl, onUpload, errors,
}: StepInfoProps) {
  const { t } = useLang();
  const logoInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-5 shadow-xs">
      <div className="space-y-1.5">
        <Label htmlFor="p-name">{t.porteurFormName} *</Label>
        <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: AgriFlow Côte d'Ivoire" className={errors.name ? "border-destructive" : ""} />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{t.porteurFormSector} *</Label>
          <Select value={sector} onValueChange={(v) => setSector(v as ProjectSector)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-market">{t.porteurFormMarket} *</Label>
          <Input id="p-market" value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Ex: Afrique de l'Ouest" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
        <Globe className="w-3.5 h-3.5 mr-1" />
        {SUGGESTED_MARKETS.slice(0, 4).map((m) => (
          <button key={m} type="button" onClick={() => setTargetMarket(m)} className="px-2 py-0.5 rounded-full border bg-muted/40 hover:bg-muted text-[11px]">
            {m}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="p-desc">{t.porteurFormDesc} (Pitch) *</Label>
        <Textarea id="p-desc" rows={3} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder={t.porteurFormDescPlaceholder} />
        {errors.shortDescription && <p className="text-xs text-destructive">{errors.shortDescription}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-muted/30 shrink-0">
            {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div className="space-y-1">
            <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "logo")} />
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => logoInput.current?.click()}><Upload className="w-3 h-3 mr-1" /> Logo</Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20 h-14 rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-muted/30 shrink-0">
            {poster ? <img src={poster} alt="Bannière" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div className="space-y-1">
            <input ref={posterInput} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "poster")} />
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => posterInput.current?.click()}><Upload className="w-3 h-3 mr-1" /> Bannière</Button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t">
        <Label htmlFor="p-video" className="flex items-center gap-1.5 text-xs"><Video className="w-3.5 h-3.5" />{t.porteurFormVideo}</Label>
        <Input id="p-video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
      </div>
    </div>
  );
}
