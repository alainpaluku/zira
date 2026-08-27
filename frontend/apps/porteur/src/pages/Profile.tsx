import React, { useEffect, useRef, useState } from "react";
import { useAppData, useAuth, useLang, updateUserProfile, uploadFile, submitKyc, type ProfileExtras } from "@zira/shared";
import { fetchProfileExtras, saveProfileExtras } from "@zira/shared/lib/api-client";
import { RedirectIfNotOnboarded, isOnboarded, useToast, ProfileExtrasForm, ProfilePreferencesCard } from "@zira/ui";
import { ProfileCoverHeader } from "../components/profil/ProfileCoverHeader";
import { ProfileSkillsSection } from "../components/profil/ProfileSkillsSection";
import { ProfileExperienceSection } from "../components/profil/ProfileExperienceSection";
import { ProfileEditDialog } from "../components/profil/ProfileEditDialog";

/**
 * Page de gestion du profil porteur de projet et conformité KYC.
 */
export default function PorteurProfil() {
  const { toast } = useToast();
  const { t } = useLang();
  const { profile, refreshProfile } = useAuth();
  const { currentPorteurId, getUser } = useAppData();
  const rawUser = getUser(currentPorteurId) ?? profile;

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileState, setProfileState] = useState({ name: "", title: "", bio: "", skills: [] as string[], photo: "" });
  const [extras, setExtras] = useState<ProfileExtras>({});
  const [submittedDocument, setSubmittedDocument] = useState<string | null>(null);
  const extrasSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (extrasSaveTimer.current) clearTimeout(extrasSaveTimer.current);
  }, []);

  useEffect(() => {
    if (!rawUser) return;
    setProfileState({
      name: rawUser.name ?? "",
      title: rawUser.title ?? "",
      bio: rawUser.bio ?? "",
      skills: rawUser.skills ?? [],
      photo: rawUser.photo ?? "",
    });
    void fetchProfileExtras().then(setExtras).catch(() => setExtras({}));
  }, [rawUser]);

  if (!isOnboarded("porteur")) {
    return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;
  }
  if (!rawUser) return null;

  const persist = async (nextState: typeof profileState, nextExtras: ProfileExtras): Promise<boolean> => {
    setSaving(true);
    try {
      await updateUserProfile(rawUser.id, nextState);
      await saveProfileExtras(nextExtras);
      setProfileState(nextState);
      setExtras(nextExtras);
      await refreshProfile();
      toast({ title: t.porteurProfileTitle, description: t.save });
      return true;
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const url = await uploadFile(file, "avatar");
      void persist({ ...profileState, photo: url }, extras);
    } catch {
      toast({ title: "Erreur", description: "Upload impossible", variant: "destructive" });
    }
  };

  return (
    <div className="pb-8 space-y-6">
      <ProfileCoverHeader
        displayName={profileState.name || rawUser.name}
        username={rawUser.username || rawUser.email?.split("@")[0]}
        title={profileState.title}
        address={extras.address || ""}
        bio={profileState.bio}
        photo={profileState.photo}
        onEditClick={() => setOpen(true)}
        onPhotoUpload={handlePhotoUpload}
      />
      <div className="px-4 md:px-6 space-y-6">
        <ProfilePreferencesCard universe="porteur" isKycApproved={extras.idVerified} isKycPending={!extras.idVerified && !!extras.idDocumentUrl} />
        <ProfileExtrasForm
          extras={extras}
          onChange={(next) => {
            setExtras(next);
            if (extrasSaveTimer.current) clearTimeout(extrasSaveTimer.current);
            extrasSaveTimer.current = setTimeout(() => { void saveProfileExtras(next).catch(() => undefined); }, 400);
            if (next.idDocumentUrl && submittedDocument !== next.idDocumentUrl) {
              setSubmittedDocument(next.idDocumentUrl);
              void submitKyc({
                documentType: next.idDocumentType,
                documentNumber: next.idDocumentNumber,
                documentFile: next.idDocumentUrl,
                proofAddressFile: next.idDocumentBackUrl,
                selfieFile: next.selfieUrl,
              }).catch((error) => toast({ title: "Dossier KYC non envoyé", description: error instanceof Error ? error.message : "Réessayez plus tard.", variant: "destructive" }));
            }
          }}
          universe="porteur"
          userEmail={rawUser.email}
          userName={profileState.name || rawUser.name}
          userType={rawUser.type ?? "physique"}
        />
      </div>
      <ProfileSkillsSection
        skills={profileState.skills}
        onAddSkill={(s) => !profileState.skills.includes(s) && void persist({ ...profileState, skills: [...profileState.skills, s] }, extras)}
        onRemoveSkill={(s) => void persist({ ...profileState, skills: profileState.skills.filter((sk) => sk !== s) }, extras)}
      />
      <ProfileExperienceSection experience={rawUser.experience} education={rawUser.education} />
      <ProfileEditDialog open={open} onOpenChange={setOpen} initialData={profileState} saving={saving} onSave={(data) => persist({ ...profileState, ...data }, extras)} />
    </div>
  );
}
