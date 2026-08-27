import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button, RedirectIfNotOnboarded, isOnboarded, useToast } from "@zira/ui";
import { FileText, Users, PieChart as PieChartIcon, DollarSign, CheckCircle2, ArrowLeft, ArrowRight } from "@/lib/hero-icons-compat";
import { completeProjectSchema, extractZodErrors, infoFields, stepEquitySchema, stepFundingSchema, stepTeamSchema, submitProjectForReview, useAppData, useAuth, useLang, uploadFile, type ProjectSector, type ProjectStatus } from "@zira/shared";
import { StepIndicator } from "../components/projet-nouveau/StepIndicator";
import { StepInfo } from "../components/projet-nouveau/StepInfo";
import { StepTeam } from "../components/projet-nouveau/StepTeam";
import { StepEquity } from "../components/projet-nouveau/StepEquity";
import { StepFunding } from "../components/projet-nouveau/StepFunding";
import { StepReview } from "../components/projet-nouveau/StepReview";
import type { FormTeamMember } from "../components/projet-nouveau/types";

/**
 * Assistant de création de projet d'investissement en 5 étapes.
 */
export default function PorteurProjetNouveau() {
  const { addProject, refreshData, currentPorteurId } = useAppData();
  const { profile } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { lang } = useLang();

  if (!isOnboarded("porteur")) return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;

  const STEPS = [
    { title: lang === "fr" ? "Infos" : "Info", icon: FileText },
    { title: lang === "fr" ? "Équipe" : "Team", icon: Users },
    { title: lang === "fr" ? "Cap Table" : "Equity", icon: PieChartIcon },
    { title: lang === "fr" ? "Financement" : "Funding", icon: DollarSign },
    { title: lang === "fr" ? "Revue" : "Review", icon: CheckCircle2 },
  ];

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [poster, setPoster] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [sector, setSector] = useState<ProjectSector>("Tech");
  const [targetMarket, setTargetMarket] = useState("Afrique de l'Ouest et Diaspora");
  const [videoUrl, setVideoUrl] = useState("");
  const [team, setTeam] = useState<FormTeamMember[]>([{ name: profile?.name || "Fondateur", role: "CEO & Fondateur" }]);
  const [porteurEquity, setPorteurEquity] = useState(75);
  const [targetAmount, setTargetAmount] = useState(100000);
  const [equityPercent, setEquityPercent] = useState(15);
  const [minInvestment, setMinInvestment] = useState(500);
  const [maxInvestment, setMaxInvestment] = useState(25000);
  // A project must pass moderation before it becomes publicly investable.
  const [status, setStatus] = useState<ProjectStatus>("pending");

  const handleUpload = async (file: File, type: "logo" | "poster") => {
    try {
      const url = await uploadFile(file, type === "logo" ? "project-logo" : "project-poster");
      if (type === "logo") setLogo(url); else setPoster(url);
    } catch { toast({ title: "Erreur upload", variant: "destructive" }); }
  };

  const handleNext = () => {
    let result;
    if (step === 0) result = infoFields.name.safeParse(name.trim());
    if (step === 1) result = stepTeamSchema.safeParse({ team: team.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), role: m.role.trim() })) });
    if (step === 2) result = stepEquitySchema.safeParse({ porteurEquity });
    if (step === 3) result = stepFundingSchema.safeParse({ targetAmountUSD: targetAmount, equityPercent, minInvestment, maxInvestment });
    if (result && !result.success) {
      const issue = result.error.issues[0];
      setErrors({ [issue.path.join(".") || "form"]: issue.message });
      return;
    }
    if (step === 3 && porteurEquity + equityPercent > 100) {
      setErrors({ equityPercent: "La part fondateurs et la part proposée ne peuvent pas dépasser 100 %" });
      return;
    }
    if (step === 3 && maxInvestment < minInvestment) {
      setErrors({ maxInvestment: "Le ticket maximum doit être supérieur ou égal au ticket minimum" });
      return;
    }
    if (step === 3 && minInvestment > targetAmount) {
      setErrors({ minInvestment: "Le ticket minimum ne peut pas dépasser l'objectif de financement" });
      return;
    }
    setErrors({});
    const nxt = Math.min(step + 1, STEPS.length - 1);
    setStep(nxt);
    setMaxStep((m) => Math.max(m, nxt));
  };

  const handleSubmit = async () => {
    const validation = completeProjectSchema.safeParse({
      name: name.trim(), shortDescription: shortDescription.trim(), sector, targetMarket: targetMarket.trim(), videoUrl: videoUrl.trim() || undefined,
      logo: logo || undefined, poster: poster || undefined,
      team: team.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), role: m.role.trim() })),
      porteurEquity,
      fundraising: { targetAmountUSD: Number(targetAmount), equityPercent: Number(equityPercent), minInvestment: Number(minInvestment), maxInvestment: Number(maxInvestment) },
    });
    if (!validation.success) {
      setErrors(extractZodErrors(validation));
      return;
    }
    setSubmitting(true);
    try {
      const created = await addProject({
        id: "", porteurId: profile?.id || currentPorteurId, name: name.trim(),
        logo, poster,
        shortDescription: shortDescription.trim(), sector, targetMarket: targetMarket.trim(), videoUrl: videoUrl.trim(),
        team: team.filter(m => m.name.trim()).map((m, i) => ({ id: `tm_${i}`, name: m.name.trim(), role: m.role.trim() })),
        equityBreakdown: { porteur: porteurEquity, investors: equityPercent, available: Math.max(0, 100 - porteurEquity - equityPercent) },
        fundraising: { targetAmountUSD: targetAmount, equityPercent, minInvestment, maxInvestment, raisedAmount: 0 },
        status, createdAt: new Date().toISOString(),
      });
      if (status === "pending" && created?.id) await submitProjectForReview(created.id);
      await refreshData();
      toast({ title: "Projet créé avec succès !" });
      navigate(created?.id ? `/porteur/projets/${created.id}` : "/porteur/projets");
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="py-6 px-4 md:px-6 max-w-4xl mx-auto space-y-6">
      <StepIndicator steps={STEPS} currentStep={step} maxStepReached={maxStep} onStepClick={setStep} />
      {step === 0 && <StepInfo name={name} setName={setName} sector={sector} setSector={setSector} targetMarket={targetMarket} setTargetMarket={setTargetMarket} shortDescription={shortDescription} setShortDescription={setShortDescription} logo={logo} setLogo={setLogo} poster={poster} setPoster={setPoster} videoUrl={videoUrl} setVideoUrl={setVideoUrl} onUpload={handleUpload} errors={errors} />}
      {step === 1 && <StepTeam team={team} onAddMember={() => setTeam([...team, { name: "", role: "" }])} onRemoveMember={(i) => setTeam(team.filter((_, idx) => idx !== i))} onUpdateMember={(i, k, v) => { const c = [...team]; c[i] = { ...c[i], [k]: v }; setTeam(c); }} errors={errors} />}
      {step === 2 && <StepEquity porteurEquity={porteurEquity} setPorteurEquity={setPorteurEquity} equityPercent={equityPercent} errors={errors} />}
      {step === 3 && <StepFunding targetAmount={targetAmount} setTargetAmount={setTargetAmount} equityPercent={equityPercent} setEquityPercent={setEquityPercent} minInvestment={minInvestment} setMinInvestment={setMinInvestment} maxInvestment={maxInvestment} setMaxInvestment={setMaxInvestment} porteurEquity={porteurEquity} errors={errors} />}
      {step === 4 && <StepReview name={name} sector={sector} targetMarket={targetMarket} shortDescription={shortDescription} poster={poster} logo={logo} team={team} targetAmount={targetAmount} equityPercent={equityPercent} minInvestment={minInvestment} maxInvestment={maxInvestment} projectStatusToCreate={status} setProjectStatusToCreate={setStatus} submitting={submitting} onSubmit={handleSubmit} />}
      <div className="flex justify-between">
        {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Précédent</Button>}
        {step < STEPS.length - 1 && <Button className="ml-auto" onClick={handleNext}>Suivant <ArrowRight className="w-4 h-4 ml-2" /></Button>}
      </div>
    </div>
  );
}
