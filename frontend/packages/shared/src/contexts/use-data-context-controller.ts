import { useCallback, useEffect, useMemo, useState } from "react";
import type { Investment, Project, UserProfile } from "../types";
import {
  activateUser, approveKyc, approveProject, clearNotifications, createInvestment, createProject,
  deleteNotification, fetchActiveProjects, fetchKycStatus, fetchModerationProjects, fetchModerationUsers,
  fetchModeratorKyc, fetchMyInvestments, fetchMyProjects, fetchNotifications, fetchProjectInvestments,
  isApiConfigured, markNotificationAsRead, rejectKyc, submitKyc, suspendProject, suspendUser, updateProject,
} from "../lib/api-client";
import { useAuth } from "./auth-context";
import type { DataContextValue } from "./data-context-types";
import { isInvestorRole, isModeratorRole, matchesUniverse, mergeProjects } from "./data-context-utils";
import { useDataCommands } from "./data-context-actions";
export function useDataContextController(): DataContextValue {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]); const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]); const [kycRequests, setKycRequests] = useState<Awaited<ReturnType<typeof fetchModeratorKyc>>>([]);
  const [notifications, setNotifications] = useState<Awaited<ReturnType<typeof fetchNotifications>>["notifications"]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = profile?.id || "";
  const reload = useCallback(async () => {
    if (!isApiConfigured) { setProjects([]); setInvestments([]); setNotifications([]); setKycRequests([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [publicResult, ownResult, invResult, notifResult, kycResult] = await Promise.allSettled([
        fetchActiveProjects(), fetchMyProjects(), fetchMyInvestments(), fetchNotifications(), fetchKycStatus(),
      ]);
      const own = ownResult.status === "fulfilled" ? ownResult.value : [];
      const isModerator = isModeratorRole(profile?.role);
      const moderationProjects = isModerator ? await fetchModerationProjects().catch(() => []) : [], moderationKyc = isModerator ? await fetchModeratorKyc("pending").catch(() => []) : [];
      setUsers(isModerator ? await fetchModerationUsers().catch(() => []) : []);
      const publicProjects = publicResult.status === "fulfilled" ? publicResult.value : [];
      const visible = isInvestorRole(profile?.role) ? publicProjects : isModerator ? moderationProjects : mergeProjects(own, publicProjects.filter((p) => p.porteurId === currentUserId));
      const investmentProjects = isModerator ? moderationProjects : own;
      const projectInvestments = await Promise.all(investmentProjects.map((p) => fetchProjectInvestments(p.id).catch(() => [])));
      const mine = invResult.status === "fulfilled" ? invResult.value : [];
      setProjects(visible); setInvestments([...new Map([...mine, ...projectInvestments.flat()].map((i) => [i.id, i])).values()]);
      setNotifications(notifResult.status === "fulfilled" ? notifResult.value.notifications : []);
      const ownKyc = kycResult.status === "fulfilled" ? kycResult.value.kyc : undefined;
      setKycRequests(isModerator ? moderationKyc : ownKyc?.id ? [ownKyc] : []);
    } finally { setLoading(false); }
  }, [currentUserId, profile?.role]);
  useEffect(() => { void reload().catch((error) => console.error("[AppDataProvider] load failed", error)); }, [reload]);
  const getProject = useCallback((id: string) => projects.find((p) => p.id === id), [projects]);
  const getUser = useCallback((id: string) => users.find((u) => u.id === id) || (profile?.id === id ? profile : undefined), [profile, users]);
  const myProjects = useMemo(() => projects.filter((p) => p.porteurId === currentUserId), [currentUserId, projects]);
  const myInvestments = useMemo(() => investments.filter((i) => i.investorId === currentUserId), [currentUserId, investments]);
  return useDataCommands({ users, setUsers, projects, setProjects, investments, kycRequests, setKycRequests, notifications, loading, currentUserId, myProjects, myInvestments, getUser, getProject, reload });
}
