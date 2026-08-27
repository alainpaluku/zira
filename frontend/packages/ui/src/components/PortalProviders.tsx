import React, { useEffect, type ReactNode } from "react";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppDataProvider, AuthProvider, LangProvider } from "@zira/shared";
import { ThemeProvider } from "./ThemeProvider";
import { TooltipProvider } from "./ui/Tooltip";
import { Toaster } from "./ui/Toaster";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

function ClerkSessionBridge() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();

  useEffect(() => {
    if (!isLoaded) return;
    void getToken().then((token) => {
      if (token) localStorage.setItem("zira_auth_token", token);
      else localStorage.removeItem("zira_auth_token");
      window.dispatchEvent(new Event("zira-auth-ready"));
    }).catch(() => window.dispatchEvent(new Event("zira-auth-ready")));
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}

export interface PortalProvidersProps {
  children: ReactNode;
  publishableKey?: string;
  apiBaseUrl?: string;
}

function ConfigurationError() { return <main className="min-h-screen grid place-items-center p-6 text-center"><section>
  <h1 className="text-xl font-bold">Configuration serveur obligatoire</h1>
  <p className="mt-2 text-muted-foreground">Configurez VITE_API_BASE_URL et VITE_CLERK_PUBLISHABLE_KEY.</p>
</section></main>; }

export function PortalProviders({ children, publishableKey, apiBaseUrl }: PortalProvidersProps) {
  if (!apiBaseUrl || !publishableKey?.startsWith("pk_")) return <ConfigurationError />;
  return <ClerkProvider publishableKey={publishableKey}>
    <ClerkSessionBridge />
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme"><LangProvider>
      <AuthProvider><QueryClientProvider client={queryClient}>
        <AppDataProvider><TooltipProvider>{children}<Toaster /></TooltipProvider></AppDataProvider>
      </QueryClientProvider></AuthProvider>
    </LangProvider></ThemeProvider>
  </ClerkProvider>;
}
