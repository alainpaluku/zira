import type { Dispatch, SetStateAction } from "react";
import type { AppNotification, Investment, KycRequest, Project, Universe, UserProfile } from "../types";
import type { formatDate, formatUSD } from "../lib/formatters";

export type DataCollections = {
  users: UserProfile[]; projects: Project[]; investments: Investment[];
  kycRequests: KycRequest[]; notifications: AppNotification[];
  unreadNotificationsCount: number; loading: boolean;
  currentPorteurId: string; currentInvestorId: string; currentModeratorId: string;
  myProjects: Project[]; myInvestments: Investment[];
  totalInvested: number; totalRaisedPorteur: number; totalRaisedOverall: number;
};

export type DataQueries = {
  getUser: (id: string) => UserProfile | undefined;
  getProject: (id: string) => Project | undefined;
  getInvestmentsByInvestor: (id: string) => Investment[];
  getInvestmentsByProject: (id: string) => Investment[];
  getProjectsByPorteur: (id: string) => Project[];
  getNotificationsForUser: (universe?: Universe, userId?: string) => AppNotification[];
};

export type DataCommands = {
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (universe?: Universe, userId?: string) => void;
  deleteNotification: (id: string) => void; clearAllNotifications: (universe?: Universe, userId?: string) => void;
  formatUSD: typeof formatUSD; formatDate: typeof formatDate;
  setUsers: Dispatch<SetStateAction<UserProfile[]>>; setKycRequests: Dispatch<SetStateAction<KycRequest[]>>;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  addProject: (project: Project) => Promise<Project>;
  updateProject: (project: Partial<Project> & { id: string }) => Promise<Project>;
  investInProject: (projectId: string, amountUSD: number, equityPercent: number) => Promise<Investment>;
  addInvestment: (projectId: string, amountUSD: number, equityPercent: number) => Promise<Investment>;
  submitKyc: (documents: unknown) => Promise<KycRequest>;
  moderateProject: (projectId: string, status: Project["status"]) => Promise<void>;
  approveProject: (projectId: string) => Promise<void>; suspendProject: (projectId: string) => Promise<void>;
  approveKyc: (kycId: string, userId?: string) => Promise<void>;
  rejectKyc: (kycId: string, userId?: string, reason?: string) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>; activateUser: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
};

export type DataContextValue = DataCollections & DataQueries & DataCommands;
