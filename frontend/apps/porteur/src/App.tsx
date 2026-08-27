import React from "react";
import { Router as WouterRouter } from "wouter";
import { PortalProviders } from "@zira/ui";
import { AppRouter } from "./routes/Index";

/**
 * Point d'entrée de l'application Porteur de Projet.
 * Fournit les contextes d'infrastructure (Thème, I18n, Auth, Data, QueryClient).
 */
export default function App() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return <PortalProviders apiBaseUrl={apiBaseUrl} publishableKey={publishableKey}>
    <WouterRouter><AppRouter /></WouterRouter>
  </PortalProviders>;
}
