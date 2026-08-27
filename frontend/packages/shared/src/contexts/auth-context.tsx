import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, UserRole, Universe, KycStatus } from "../types";
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  logoutUser as apiLogout,
  fetchMe,
  updateUserProfile as apiUpdateProfile,
  requestPasswordReset as apiRequestPasswordReset,
  resetPassword as apiResetPassword,
  verifyEmail as apiVerifyEmail,
  checkUsernameAvailability as apiCheckUsernameAvailability,
} from "../lib/api-client";

export type { Universe };

export interface RegisterPayload {
  username: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  companyName?: string;
}

export interface AuthContextValue {
  user: UserProfile | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authLoading: boolean;
  login: (identifier: string, password?: string, role?: UserRole) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  forgotPassword: (emailOrUsername: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean }>;
  verifyEmail: (token: string) => Promise<{ success: boolean }>;
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const remote = await fetchMe();
        if (remote.user) setUser(remote.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
    const onAuthReady = () => { void initAuth(); };
    window.addEventListener("zira-auth-ready", onAuthReady);
    return () => window.removeEventListener("zira-auth-ready", onAuthReady);
  }, []);

  const login = async (identifier: string, password?: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await apiLogin({
        identifier: identifier.trim(),
        email: identifier.includes("@") ? identifier.trim() : undefined,
        username: !identifier.includes("@") ? identifier.trim() : undefined,
        password,
        role,
      });
      setUser(res.user);
      try { if (res.user?.id) localStorage.setItem("zira-current-user-id", res.user.id); } catch { /* storage unavailable */ }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setIsLoading(true);
    try {
      const u = await apiRegister({
        username: data.username.trim().toLowerCase(),
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
        companyName: data.companyName?.trim(),
      });
      setUser(u);
      try { if (u?.id) localStorage.setItem("zira-current-user-id", u.id); } catch { /* storage unavailable */ }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiLogout();
    try { localStorage.removeItem("zira-current-user-id"); } catch { /* storage unavailable */ }
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const remote = await fetchMe();
      if (remote.user) setUser(remote.user);
    } catch {
      // ignore
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await apiUpdateProfile(user.id, data);
    setUser(updated);
  };

  const forgotPassword = async (emailOrUsername: string) => {
    return apiRequestPasswordReset(emailOrUsername);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return apiResetPassword(token, newPassword);
  };

  const verifyEmail = async (token: string) => {
    return apiVerifyEmail(token);
  };

  const checkUsernameAvailability = async (username: string) => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3) return { available: false };
    return apiCheckUsernameAvailability(clean);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        isAuthenticated: !!user,
        isLoading,
        authLoading: isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        forgotPassword,
        resetPassword,
        verifyEmail,
        checkUsernameAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
