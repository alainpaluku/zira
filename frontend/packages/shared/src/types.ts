export type Universe =
  | "porteur"
  | "investisseur"
  | "moderation"
  | "landing"
  | "project_owner"
  | "investor"
  | "moderator";

export type UserRole =
  | "porteur"
  | "investisseur"
  | "moderateur"
  | "admin"
  | "project_owner"
  | "investor"
  | "moderator";

export type ProjectSector =
  | "Tech"
  | "Fintech"
  | "Agritech"
  | "Santé"
  | "Énergie"
  | "Éducation"
  | "Logistique"
  | "Autre";

export type ProjectStatus = "draft" | "pending" | "active" | "funded" | "suspended";

export type KycStatus =
  | "not_started"
  | "not_submitted"
  | "in_progress"
  | "pending"
  | "approved"
  | "rejected"
  | "requires_action";

export interface WorkExperience {
  company: string;
  role: string;
  period: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  year: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  kycStatus?: KycStatus;
  type?: "physique" | "morale";
  companyName?: string;
  title?: string;
  bio?: string;
  photo?: string;
  phone?: string;
  country?: string;
  status: "active" | "suspended" | "pending";
  joinedAt?: string;
  skills?: string[];
  experience?: WorkExperience[];
  education?: EducationEntry[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  linkedin?: string;
}

export interface FundraisingGoal {
  targetAmountUSD: number;
  equityPercent: number;
  minInvestment: number;
  maxInvestment: number;
  raisedAmount: number;
}

export interface EquityBreakdown {
  porteur: number;
  investors: number;
  available: number;
}

export interface Project {
  id: string;
  porteurId: string;
  ownerId?: string;
  name: string;
  logo?: string;
  poster?: string;
  shortDescription: string;
  fullDescription?: string;
  sector: ProjectSector;
  targetMarket?: string;
  stage?: string;
  country?: string;
  city?: string;
  videoUrl?: string;
  team: TeamMember[];
  equityBreakdown?: EquityBreakdown;
  fundraising: FundraisingGoal;
  status: ProjectStatus;
  createdAt: string;
}

export interface Investment {
  id: string;
  projectId: string;
  investorId: string;
  amountUSD: number;
  equityReceived: number;
  date: string;
  status: "completed" | "pending" | "refunded";
  investorName?: string;
  investorEmail?: string;
}

export interface KycDocument {
  type: string;
  url: string;
  name?: string;
  document_type?: string;
  document_url?: string;
}

export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  submittedAt: string;
  type: "investisseur" | "porteur" | "investor" | "project_owner";
  documents: KycDocument[] | { document_type: string; document_url: string }[];
  status: KycStatus;
  rejectionReason?: string;
}

export interface ModerationAction {
  id: string;
  moderatorId?: string;
  targetType?: "project" | "user" | "kyc";
  targetId?: string;
  action: string;
  reason?: string;
  timestamp?: string;
  date?: string;
  target?: string;
  targetName?: string;
  by?: string;
  byEmail?: string;
  details?: string;
}

export type NotificationType = "project" | "investment" | "kyc" | "system" | "warning";

export interface AppNotification {
  id: string;
  userId?: string;
  universe: Universe;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

// Aliases for unified English naming
export type Investor = UserProfile;
export type ProjectOwner = UserProfile;
export type Moderator = UserProfile;
