import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AppNotification, Investment, KycRequest, Project, UserProfile } from "../types";
import { formatDate, formatUSD } from "../lib/formatters";
import { activateUser, approveKyc, approveProject, clearNotifications, createInvestment, createProject, deleteNotification, markNotificationAsRead, rejectKyc, submitKyc, suspendProject, suspendUser, updateProject } from "../lib/api-client";
import type { DataContextValue } from "./data-context-types";
import { matchesUniverse } from "./data-context-utils";

type Input = {
  users: UserProfile[]; setUsers: Dispatch<SetStateAction<UserProfile[]>>; projects: Project[]; setProjects: Dispatch<SetStateAction<Project[]>>;
  investments: Investment[]; kycRequests: KycRequest[]; setKycRequests: Dispatch<SetStateAction<KycRequest[]>>; notifications: AppNotification[];
  loading: boolean; currentUserId: string; myProjects: Project[]; myInvestments: Investment[];
  getUser: (id: string) => UserProfile | undefined; getProject: (id: string) => Project | undefined; reload: () => Promise<void>;
};

export function useDataCommands(input: Input): DataContextValue {
  const { users, setUsers, projects, setProjects, investments, kycRequests, setKycRequests, notifications, loading, currentUserId, myProjects, myInvestments, getUser, getProject, reload } = input;
  return useMemo(() => ({
    users, projects, investments, kycRequests, notifications, loading, currentPorteurId: currentUserId, currentInvestorId: currentUserId, currentModeratorId: currentUserId,
    myProjects, myInvestments, unreadNotificationsCount: notifications.filter((n) => !n.read).length,
    totalInvested: myInvestments.reduce((s, i) => s + i.amountUSD, 0), totalRaisedPorteur: myProjects.reduce((s, p) => s + (p.fundraising?.raisedAmount || 0), 0), totalRaisedOverall: projects.reduce((s, p) => s + (p.fundraising?.raisedAmount || 0), 0), getUser, getProject,
    getInvestmentsByInvestor: (id) => investments.filter((i) => i.investorId === id), getInvestmentsByProject: (id) => investments.filter((i) => i.projectId === id), getProjectsByPorteur: (id) => projects.filter((p) => p.porteurId === id),
    getNotificationsForUser: (universe, userId) => notifications.filter((n) => matchesUniverse(n, universe) && (!userId || n.userId === userId)),
    markNotificationAsRead: (id) => { void markNotificationAsRead(id).then(reload).catch(console.error); }, markAllNotificationsAsRead: (universe, userId) => { void Promise.all(notifications.filter((n) => !n.read && matchesUniverse(n, universe) && (!userId || n.userId === userId)).map((n) => markNotificationAsRead(n.id))).then(reload).catch(console.error); },
    deleteNotification: (id) => { void deleteNotification(id).then(reload).catch(console.error); }, clearAllNotifications: (_universe, _userId) => { void clearNotifications().then(reload).catch(console.error); },
    formatUSD, formatDate, setUsers, setKycRequests, setProjects,
    addProject: async (p) => { const result = await createProject(p); await reload(); return result; }, updateProject: async (p) => { const result = await updateProject(p.id, p); await reload(); return result; },
    investInProject: async (id, amount, equity) => { const result = await createInvestment(id, amount, equity); await reload(); return result; }, addInvestment: async (id, amount, equity) => { const result = await createInvestment(id, amount, equity); await reload(); return result; },
    submitKyc: async (docs) => { const result = await submitKyc(docs as never); await reload(); return result; }, moderateProject: async (id, status) => { if (status === "active") await approveProject(id); if (status === "suspended") await suspendProject(id); await reload(); }, approveProject: async (id) => { await approveProject(id); await reload(); }, suspendProject: async (id) => { await suspendProject(id); await reload(); },
    approveKyc: async (id) => { await approveKyc(id); await reload(); }, rejectKyc: async (id, _user, reason) => { await rejectKyc(id, reason); await reload(); }, suspendUser: async (id) => { await suspendUser(id); await reload(); }, activateUser: async (id) => { await activateUser(id); await reload(); }, refreshData: reload,
  }), [users, projects, investments, kycRequests, notifications, loading, currentUserId, myProjects, myInvestments, getUser, getProject, setUsers, setKycRequests, setProjects, reload]);
}
