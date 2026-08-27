import type { UserProfile } from "../types";

export type ProfileUniverse = "porteur" | "investisseur" | "moderation";
export type IdDocumentType = "PASSPORT" | "ID_CARD" | "DRIVER_LICENSE" | "national_id" | "passport" | "driver_license";

export interface ProfileExtras {
	 notificationsEnabled?: boolean;
  phone?: string;
  country?: string;
  city?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  legalStatus?: string;
  rccmNumber?: string;
  taxNumber?: string;
  address?: string;
  experienceYears?: number;
  sectorsOfInterest?: string[];
  investmentCapacity?: string;
  bankName?: string;
  bankIban?: string;
  idVerified?: boolean;
  idVerifiedAt?: string;
  phoneCountryCode?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  idDocumentUrl?: string;
  idDocumentBackUrl?: string;
  selfieUrl?: string;
  idDocumentType?: IdDocumentType;
  idDocumentNumber?: string;
  idDocumentCountry?: string;
  idExpiryDate?: string;
  paymentReceive?: string;
  paymentSend?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  residentialAddress?: string;
  ocrFullName?: string;
  ocrAge?: number;
}

export function getProfileExtras(userId?: string): ProfileExtras {
  if (!userId) return {};
  try {
    const data = localStorage.getItem(`zira-profile-extras-${userId}`);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveProfileExtras(userId: string, extras: Partial<ProfileExtras>): ProfileExtras {
  const current = getProfileExtras(userId);
  const updated = { ...current, ...extras };
  try {
    localStorage.setItem(`zira-profile-extras-${userId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function dismissProfileBanner(userId: string): void {
  try {
    localStorage.setItem(`zira-dismiss-profile-banner-${userId}`, "true");
  } catch {}
}

export function isProfileBannerDismissed(userId: string): boolean {
  try {
    return localStorage.getItem(`zira-dismiss-profile-banner-${userId}`) === "true";
  } catch {
    return false;
  }
}

export function getProfileBannerFields(_universe: ProfileUniverse): string[] {
  return ["phone", "country", "city", "address", "rccmNumber"];
}

type ProfileCompletionUser = Pick<UserProfile, "id"> &
  Partial<Pick<UserProfile, "phone" | "country">> &
  Partial<Pick<ProfileExtras, "city" | "address" | "rccmNumber">>;

export function getMissingFields(
  profile: ProfileCompletionUser | null | undefined,
  universe: ProfileUniverse,
): string[] {
  const fields = getProfileBannerFields(universe);
  const missing: string[] = [];
  if (!profile) return fields;
  const extras = getProfileExtras(profile.id);
  fields.forEach((f) => {
    const profileValue = profile[f as keyof ProfileCompletionUser];
    const extraValue = extras[f as keyof ProfileExtras];
    if (!profileValue && !extraValue) {
      missing.push(f);
    }
  });
  return missing;
}

export function getFieldLabel(field: string, lang: string = "fr"): string {
  const labels: Record<string, { fr: string; en: string }> = {
    phone: { fr: "Numéro de téléphone", en: "Phone number" },
    country: { fr: "Pays", en: "Country" },
    city: { fr: "Ville", en: "City" },
    address: { fr: "Adresse", en: "Address" },
    rccmNumber: { fr: "Numéro RCCM / Immatriculation", en: "RCCM Number" },
  };
  return labels[field]?.[lang === "fr" ? "fr" : "en"] || field;
}

export function calculateProfileScore(
  user?: Pick<UserProfile, "name" | "email" | "title" | "bio">,
  extras?: ProfileExtras,
): number {
  if (!user) return 0;
  let score = 20; // base score for account creation
  if (user.name) score += 15;
  if (user.email) score += 15;
  if (user.title) score += 10;
  if (user.bio) score += 10;
  if (extras?.phone) score += 10;
  if (extras?.country || extras?.city) score += 10;
  if (extras?.rccmNumber || extras?.linkedin) score += 10;
  return Math.min(100, score);
}
