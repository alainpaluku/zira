import {
  Project,
  UserProfile,
  Investment,
  KycRequest,
  AppNotification,
  Universe,
  ProjectSector,
  ProjectStatus,
} from "../types";
import type { ProfileExtras } from "./profile-completion";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const TOKEN_KEY = "zira_auth_token";
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
export const isApiConfigured = Boolean(API_BASE_URL);

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage may be unavailable in private browsing; the in-memory session
    // still remains valid for the current request lifecycle.
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  new Headers(options.headers).forEach((value, key) => { headers[key] = value; });
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    let errMsg = `Erreur HTTP ${res.status}`;
    try {
      const json = await res.json();
      if (json.error?.message) errMsg = json.error.message;
      else if (json.error) errMsg = typeof json.error === "string" ? json.error : JSON.stringify(json.error);
      else if (json.message) errMsg = json.message;
    } catch {
      // Non-JSON response
    }
    throw new ApiError(errMsg, res.status);
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json();
  if (json && typeof json === "object" && "data" in json && "success" in json) {
    return json.data as T;
  }
  return json as T;
}

// ─── DTO Converters ───────────────────────────────────────────────────

export function fromGoProject(raw: any): Project {
  if (!raw) return raw;
  // The Go API returns funding fields at the project root; nested funding is
  // accepted for compatibility with older API responses.
  const funding = raw.funding || raw;
  const statusStr = (raw.status || "DRAFT").toUpperCase();
  let mappedStatus: ProjectStatus = "draft";
  if (statusStr === "PUBLISHED" || statusStr === "FUNDING" || statusStr === "ACTIVE") {
    mappedStatus = "active";
  } else if (statusStr === "SUBMITTED" || statusStr === "UNDER_REVIEW" || statusStr === "PENDING") {
    mappedStatus = "pending";
  } else if (statusStr === "FUNDED" || statusStr === "COMPLETED") {
    mappedStatus = "funded";
  } else if (statusStr === "SUSPENDED") {
    mappedStatus = "suspended";
  }

  const numberOr = (value: unknown, fallback: number) => {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const targetAmountUSD = numberOr(funding.target_amount_usd ?? funding.targetAmountUSD, 0);
  const equityPercent = numberOr(funding.equity_percent ?? funding.equityPercent, 0);
  const minInvestment = numberOr(funding.min_investment_usd ?? funding.minInvestment, 0);
  const maxInvestment = numberOr(funding.max_investment_usd ?? funding.maxInvestment, targetAmountUSD);
  const raisedAmount = numberOr(funding.raised_amount_usd ?? funding.raisedAmount, 0);

  return {
    id: raw.id || "",
    porteurId: String(raw.owner_id || raw.porteurId || ""),
    name: raw.name || "",
    logo: raw.logo_url || raw.logo || "",
    poster: raw.poster_url || raw.poster || "",
    shortDescription: raw.short_description || raw.shortDescription || "",
    fullDescription: raw.full_description || raw.fullDescription || "",
    sector: (raw.sector || "Tech") as ProjectSector,
    targetMarket: raw.target_market || raw.targetMarket || "",
    stage: raw.stage || "",
    country: raw.country || "",
    city: raw.city || "",
    videoUrl: raw.video_url || raw.videoUrl || "",
    team: Array.isArray(raw.team)
      ? raw.team.map((member: any) => ({
          name: String(member?.name || ""),
          role: String(member?.role || ""),
          bio: member?.bio,
          photo: member?.photo,
          linkedin: member?.linkedin || member?.linkedIn,
        }))
      : [],
    equityBreakdown: raw.equityBreakdown || {
      porteur: 100 - equityPercent,
      investors: equityPercent,
      available: 0,
    },
    fundraising: {
      targetAmountUSD,
      equityPercent,
      minInvestment,
      maxInvestment,
      raisedAmount,
    },
    status: mappedStatus,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export function toGoProjectPayload(project: Partial<Project>): any {
  const targetAmount = project.fundraising?.targetAmountUSD ?? 0;
  const equityPercent = project.fundraising?.equityPercent ?? 0;
  const minInvestment = project.fundraising?.minInvestment ?? 0;
  const maxInvestment = project.fundraising?.maxInvestment ?? 0;

  return {
    name: project.name || "",
    short_description: project.shortDescription || project.name || "",
    full_description: project.fullDescription || project.shortDescription || undefined,
    sector: project.sector || "Tech",
    stage: "Growth",
    target_market: project.targetMarket || "",
    country: project.country || "",
    city: project.city || "",
    video_url: project.videoUrl?.trim() || undefined,
    // The API stores object keys, not data URLs. Keep empty values omitted so
    // an edit cannot accidentally replace an existing media URL.
    logo_url: project.logo?.trim() || undefined,
    poster_url: project.poster?.trim() || undefined,
    team: project.team || [],
    target_amount_usd: targetAmount,
    min_investment_usd: minInvestment,
    max_investment_usd: maxInvestment,
    equity_percent: equityPercent,
  };
}

// ─── Authentification ──────────────────────────────────────────────────

export async function loginUser(payload: {
  identifier?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserProfile["role"];
}): Promise<{ token: string; user: UserProfile }> {
  try {
    const data = await request<{ token: string; user: UserProfile }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAuthToken(data.token);
    return data;
  } catch (err) {
		if (isApiConfigured) throw err;
    throw err;
  }
}

export async function registerUser(payload: {
  username: string;
  name: string;
  email: string;
  password?: string;
  role: UserProfile["role"];
  type?: string;
  companyName?: string;
}): Promise<UserProfile> {
  try {
    const data = await request<{ token: string; user: UserProfile }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAuthToken(data.token);
    return data.user;
	  } catch (err) {
		if (isApiConfigured) throw err;
    throw err;
  }
}

export async function fetchMe(): Promise<{ user: UserProfile; extras?: ProfileExtras }> {
  try {
    const res = await request<any>("/api/me");
    const user: UserProfile = {
      id: String(res.id || ""),
      username: res.username || res.email?.split("@")[0] || "utilisateur",
      name: res.display_name || res.name || "Utilisateur",
      email: res.email || "",
      role: res.role,
      kycStatus: res.kyc_status || "not_submitted",
      title: res.title,
      bio: res.bio,
      photo: res.avatar_url,
      companyName: res.company_name,
      status: res.status || "active",
      joinedAt: res.created_at,
    };
    if (!user.id || !user.role) throw new ApiError("Réponse utilisateur invalide");
    return { user, extras: res.profile_extras || {} };
  } catch {
		if (isApiConfigured) throw new ApiError("Session utilisateur invalide ou backend indisponible");
    throw new ApiError("Session utilisateur indisponible");
  }
}

export async function logoutUser(): Promise<void> {
  setAuthToken(null);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  if (!currentPassword || newPassword.length < 8) throw new ApiError("Mot de passe invalide");
  await request("/api/me/password", {
    method: "PATCH",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  return request("/api/auth/password/forgot", { method: "POST", body: JSON.stringify({ identifier: identifier.trim() }) });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  return request("/api/auth/password/reset", { method: "POST", body: JSON.stringify({ token, new_password: newPassword }) });
}

export async function verifyEmail(token: string): Promise<{ success: boolean }> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  return request("/api/auth/email/verify", { method: "POST", body: JSON.stringify({ token }) });
}

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  return request(`/api/auth/username-availability?username=${encodeURIComponent(username.trim().toLowerCase())}`);
}

export async function updateUserProfile(
  id: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  if (!isApiConfigured) throw new ApiError("API non configurée");

  try {
    const goPayload = {
      display_name: data.name || "Porteur",
      title: data.title ? data.title : undefined,
      bio: data.bio ? data.bio : undefined,
      avatar_url: data.photo ? data.photo : undefined,
      company_name: data.companyName ? data.companyName : undefined,
      city: "Kinshasa",
      country: "RDC",
      is_public: true,
    };
    const res = await request<any>("/api/me/profile", {
      method: "PATCH",
      body: JSON.stringify(goPayload),
    });
    const updated: UserProfile = {
      id: res.id || id,
      username: res.username || id,
      name: res.display_name || data.name || "Porteur",
      email: res.email || "porteur@zira-invest.cd",
      role: res.role || "porteur",
      title: res.title || data.title,
      bio: res.bio || data.bio,
      photo: res.avatar_url || data.photo,
      companyName: res.company_name || data.companyName,
      status: res.status || "active",
    };
    return updated;
	  } catch (err) {
		throw err;
  }
}

export async function fetchProfileExtras(): Promise<ProfileExtras> {
  if (!isApiConfigured) throw new ApiError("API non configurée"); const res = await request<any>("/api/me"); return res.profile_extras || {};
}

export async function saveProfileExtras(extras: ProfileExtras): Promise<ProfileExtras> {
  if (!isApiConfigured) throw new ApiError("API non configurée"); const res = await request<any>("/api/me/profile", { method: "PATCH", body: JSON.stringify({ profile_extras: extras }) }); return res.profile_extras || extras;
}

// ─── Projets ───────────────────────────────────────────────────────────

export async function fetchActiveProjects(
  _status = "active",
): Promise<Project[]> {
  try {
    const res = await request<any>("/api/public/projects");
    const list = Array.isArray(res) ? res : res?.data || [];
    return Array.isArray(list) ? list.map(fromGoProject) : [];
  } catch (err) {
    if (isApiConfigured) throw err;
  }
  if (isApiConfigured) throw new ApiError("Impossible de charger les projets depuis le serveur");
  throw new ApiError("API non configurée");
}

export async function fetchMyProjects(): Promise<Project[]> {
  if (!isApiConfigured) throw new ApiError("API non configurée");

  const res = await request<any>("/api/me/projects");
  const rawList = Array.isArray(res) ? res : res?.data || [];
  return rawList.map(fromGoProject);
}

export async function fetchModerationProjects(): Promise<Project[]> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  const res = await request<any>("/api/moderation/projects");
  const list = Array.isArray(res) ? res : res?.data || [];
  return list.map(fromGoProject);
}

export async function fetchModerationUsers(): Promise<UserProfile[]> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  const res = await request<any>("/api/moderation/users");
  const list = Array.isArray(res) ? res : res?.data || [];
  return list.map((raw: any) => ({
    id: String(raw.id || raw.clerk_id || ""),
    username: raw.username || raw.email?.split("@")[0] || "utilisateur",
    name: raw.display_name || raw.name || "Utilisateur",
    email: raw.email || "",
    role: raw.role || "investisseur",
    kycStatus: raw.kyc_status || "not_submitted",
    companyName: raw.company_name,
    title: raw.title,
    bio: raw.bio,
    photo: raw.avatar_url,
    status: raw.status || "active",
    joinedAt: raw.created_at,
  }));
}

export async function fetchProjectById(id: string): Promise<Project> {
  if (!isApiConfigured) throw new ApiError("API non configurée");

  const raw = await request<any>(`/api/projects/${id}`);
  return fromGoProject(raw);
}

export async function createProject(
  payload: Project | Record<string, unknown>,
): Promise<Project> {
  if (!isApiConfigured) throw new ApiError("API non configurée");

  const goPayload = toGoProjectPayload(payload as Partial<Project>);
  const raw = await request<any>("/api/projects", {
    method: "POST",
    body: JSON.stringify(goPayload),
  });
  return fromGoProject(raw);
}

export async function updateProject(
  id: string,
  payload: Partial<Project>,
): Promise<Project> {
  if (!isApiConfigured) throw new ApiError("API non configurée");

  const goPayload = toGoProjectPayload(payload);
  const raw = await request<any>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(goPayload),
  });
  return fromGoProject(raw);
}

export async function submitProjectForReview(id: string): Promise<Project> {
  if (!isApiConfigured) throw new ApiError("API non configurée");

  const raw = await request<any>(`/api/projects/${id}/submit`, {
    method: "POST",
  });
  return fromGoProject(raw);
}

// ─── Investissements & Portefeuille ───────────────────────────────────

export async function fetchMyInvestments(): Promise<Investment[]> {
	if (isApiConfigured) {
		const res = await request<any>("/api/me/investments");
		const list = Array.isArray(res) ? res : res?.data || [];
    return list.map(fromGoInvestment);
	}
	throw new ApiError("API non configurée");
}

export async function fetchProjectInvestments(projectId: string): Promise<Investment[]> {
  if (!isApiConfigured) throw new ApiError("Le serveur d'investissements n'est pas configuré");
  const res = await request<any>(`/api/projects/${projectId}/investments`);
  const list = Array.isArray(res) ? res : res?.data || [];
  return list.map(fromGoInvestment);
}

export async function fetchMyProjectInvestments(): Promise<{
  investments: Investment[];
  totalRaised: number;
  projectsCount: number;
}> {
  const invs = await fetchMyInvestments();
  return { investments: invs, totalRaised: invs.reduce((s, i) => s + i.amountUSD, 0), projectsCount: new Set(invs.map(i => i.projectId)).size };
}

export async function createInvestment(
  projectId: string,
  amountUSD: number,
  equityPercent?: number,
): Promise<Investment> {
	if (isApiConfigured) {
		const raw = await request<any>(`/api/projects/${projectId}/invest`, { method: "POST", body: JSON.stringify({ amount_usd: amountUSD, equity_percent: equityPercent ?? 0 }) });
    const item = raw?.data || raw;
    return fromGoInvestment(item);
	}
  throw new ApiError("API non configurée");
}

function fromGoInvestment(item: any): Investment {
  const amount = Number(item?.amount_usd ?? item?.amountUSD);
  const equity = Number(item?.equity_received ?? item?.equityReceived);
  return {
    id: String(item?.id || ""),
    projectId: String(item?.project_id ?? item?.projectId ?? ""),
    investorId: String(item?.investor_id ?? item?.investorId ?? ""),
    amountUSD: Number.isFinite(amount) ? amount : 0,
    equityReceived: Number.isFinite(equity) ? equity : 0,
    date: item?.created_at ?? item?.date ?? new Date().toISOString(),
    status: item?.status === "completed" || item?.status === "refunded" || item?.status === "pending" ? item.status : "pending",
    investorName: item?.investor_name ?? item?.investorName,
    investorEmail: item?.investor_email ?? item?.investorEmail,
  };
}

// ─── KYC ──────────────────────────────────────────────────────────────

export async function submitKyc(
  payload: {
    fullName?: string;
    documentType?: string;
    documentNumber?: string;
    documentFile?: File | string;
    proofAddressFile?: File | string;
    selfieFile?: File | string;
    phone?: string;
  } | { document_type: string; document_url: string }[],
): Promise<KycRequest> {
  if (isApiConfigured) {
    const document = Array.isArray(payload)
      ? payload[0]
      : {
          document_type: payload.documentType || "national_id",
          document_number: payload.documentNumber,
          document_url: typeof payload.documentFile === "string" ? payload.documentFile : "",
          document_back_url: typeof payload.proofAddressFile === "string" ? payload.proofAddressFile : "",
          selfie_url: typeof payload.selfieFile === "string" ? payload.selfieFile : "",
        };
    const res = await request<any>("/api/me/kyc/submit", {
      method: "POST",
      body: JSON.stringify(document),
    });
    return res as KycRequest;
  }
  throw new ApiError("API non configurée");
}

export async function fetchKycStatus(): Promise<{
  status: string;
  kyc?: KycRequest;
  extras?: ProfileExtras;
}> {
  try {
    const res = await request<any>("/api/me/kyc");
    return { status: res?.status || "pending", kyc: res };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Impossible de charger le statut KYC");
  }
}

export async function fetchModeratorKyc(status = "pending"): Promise<KycRequest[]> {
  if (!isApiConfigured) {
    throw new ApiError("API non configurée");
  }
  const res = await request<any>(`/api/moderation/kyc?status=${encodeURIComponent(status)}`);
  const list = Array.isArray(res) ? res : res?.data || [];
  return list.map((raw: any) => ({
    id: raw.id,
    userId: raw.user_id || raw.userId,
    userName: raw.user_name || raw.userName || "Utilisateur",
    userEmail: raw.user_email || raw.userEmail || "",
    submittedAt: raw.submitted_at || raw.submittedAt,
    status: raw.status,
    rejectionReason: raw.rejection_reason || raw.rejectionReason,
    documents: raw.document
      ? [{
          document_type: raw.document.document_type,
          document_url: raw.document.document_url,
          name: raw.document.document_number,
        }]
      : raw.documents || [],
    type: raw.type || "investisseur",
  })) as KycRequest[];
}

export async function verifyIdentityDocument(
  documentUrl: string,
  documentType: "PASSPORT" | "DRIVER_LICENSE" | "ID_CARD" | string,
  selfieUrl?: string,
): Promise<{
  valid: boolean;
  ocr_result?: {
    full_name?: string;
    document_number?: string;
    expiry_date?: string;
    country?: string;
  };
  face_match?: boolean;
}> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  return request("/api/me/kyc/verify", {
    method: "POST",
    body: JSON.stringify({ document_url: documentUrl, document_type: documentType, selfie_url: selfieUrl }),
  });
}

export async function requestVerificationCode(channel: "email" | "phone", destination?: string): Promise<void> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  await request(`/api/me/verifications/${channel}`, {
    method: "POST",
    body: JSON.stringify(destination ? { destination } : {}),
  });
}

export async function verifyVerificationCode(channel: "email" | "phone", code: string): Promise<void> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  if (!/^\d{6}$/.test(code)) throw new ApiError("Le code doit contenir 6 chiffres");
  await request(`/api/me/verifications/${channel}/verify`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

// ─── Notifications ───────────────────────────────────────────────────

export async function fetchNotifications(universe?: Universe): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  if (isApiConfigured) {
    const res = await request<any>("/api/me/notifications");
    return res?.notifications
      ? res
      : res?.data || { notifications: [], unreadCount: 0 };
  }
  throw new ApiError("API non configurée");
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (isApiConfigured) {
    await request(`/api/me/notifications/${id}/read`, { method: "PATCH" });
    return;
  }
  throw new ApiError("API non configurée");
}

export async function deleteNotification(id: string): Promise<void> {
  if (!isApiConfigured) throw new ApiError("Le serveur de notifications n'est pas configuré");
  await request(`/api/me/notifications/${id}`, { method: "DELETE" });
}
export async function clearNotifications(): Promise<void> {
  if (!isApiConfigured) throw new ApiError("Le serveur de notifications n'est pas configuré");
  await request(`/api/me/notifications`, { method: "DELETE" });
}

export async function markAllNotificationsAsRead(universe?: Universe): Promise<void> {
  if (isApiConfigured) {
    const { notifications } = await fetchNotifications(universe);
    await Promise.all(
      notifications.filter((item) => !item.read).map((item) => markNotificationAsRead(item.id)),
    );
    return;
  }
  throw new ApiError("API non configurée");
}

// ─── Upload de fichiers ───────────────────────────────────────────────

export async function uploadFile(file: File, _type: string): Promise<string> {
  if (!isApiConfigured) throw new ApiError("Le stockage serveur n'est pas configuré");
  if (!file || typeof file.size !== "number" || file.size <= 0) throw new ApiError("Fichier invalide");
  if (file.size > 10 * 1024 * 1024) throw new ApiError("Le fichier ne doit pas dépasser 10 Mo");
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) throw new ApiError("Format de fichier non pris en charge");
  const presign = await request<{ upload_url: string; public_url: string }>("/api/uploads/presign", { method: "POST", body: JSON.stringify({ filename: file.name, content_type: file.type }) });
  const upload = await fetch(presign.upload_url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!upload.ok) throw new ApiError(`Échec de l'upload (${upload.status})`, upload.status);
  return presign.public_url;
}

// ─── Modération ───────────────────────────────────────────────────────

export async function approveKyc(kycId: string): Promise<{ success: boolean }> {
  if (isApiConfigured) {
    await request(`/api/moderation/kyc/${kycId}/decision`, {
      method: "POST",
      body: JSON.stringify({ approved: true }),
    });
    return { success: true };
  }
  throw new ApiError("API non configurée");
}

export async function rejectKyc(kycId: string, reason?: string): Promise<{ success: boolean }> {
  if (isApiConfigured) {
    await request(`/api/moderation/kyc/${kycId}/decision`, {
      method: "POST",
      body: JSON.stringify({ approved: false, reason: reason || "" }),
    });
    return { success: true };
  }
  throw new ApiError("API non configurée");
}

export async function approveProject(projectId: string): Promise<{ success: boolean }> {
	if (isApiConfigured) { await request(`/api/moderation/projects/${projectId}/decision`, { method: "POST", body: JSON.stringify({ status: "active" }) }); return { success: true }; }
	throw new ApiError("API non configurée");
}

export async function suspendProject(projectId: string, _reason?: string): Promise<{ success: boolean }> {
	if (isApiConfigured) { await request(`/api/moderation/projects/${projectId}/decision`, { method: "POST", body: JSON.stringify({ status: "suspended" }) }); return { success: true }; }
	throw new ApiError("API non configurée");
}

export async function suspendUser(userId: string, _reason?: string): Promise<{ success: boolean }> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  await request(`/api/moderation/users/${encodeURIComponent(userId)}/status`, { method: "POST", body: JSON.stringify({ status: "suspended" }) });
  return { success: true };
}

export async function activateUser(userId: string): Promise<{ success: boolean }> {
  if (!isApiConfigured) throw new ApiError("API non configurée");
  await request(`/api/moderation/users/${encodeURIComponent(userId)}/status`, { method: "POST", body: JSON.stringify({ status: "active" }) });
  return { success: true };
}
