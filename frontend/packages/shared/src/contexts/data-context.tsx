import { createContext, useContext, type ReactNode } from "react";
import { useDataContextController } from "./use-data-context-controller";
import type { DataContextValue } from "./data-context-types";

export type { DataContextValue } from "./data-context-types";

export const AppDataContext = createContext<DataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const value = useDataContextController();
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): DataContextValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("useAppData must be used inside an AppDataProvider");
  return value;
}

export const useProjects = useAppData;
export const useKyc = useAppData;
export const useInvestments = useAppData;
export const useNotifications = useAppData;
export const useUsers = useAppData;
