import React, { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { PortalProviders, AuthGuard, LoadingState } from "@zira/ui";

import { InvestorLayout } from "./layouts/InvestorLayout";
const InvestorOnboarding = lazy(() => import("./pages/Onboarding"));
const InvestorDashboard = lazy(() => import("./pages/Dashboard"));
const InvestorProfile = lazy(() => import("./pages/Profile"));
const InvestorNotifications = lazy(() => import("./pages/Notifications"));
const InvestorExplorer = lazy(() => import("./pages/Explorer"));
const InvestorProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const InvestorWallet = lazy(() => import("./pages/Wallet"));
const InvestorLogin = lazy(() => import("./pages/auth/InvestorLogin"));
const InvestorSettings = lazy(() => import("./pages/Settings"));
const InvestorKyc = lazy(() => import("./pages/Kyc"));

function Router() {
  return (
    <Suspense fallback={<LoadingState fullScreen label="Chargement du Portail Investisseur..." />}>
      <Switch>
        <Route path="/investisseur/login" component={InvestorLogin} />
        <Route path="/login" component={InvestorLogin} />

        <Route path="/investisseur/onboarding">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorOnboarding />
          </AuthGuard>
        </Route>
        <Route path="/onboarding">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorOnboarding />
          </AuthGuard>
        </Route>

        <Route path="/investisseur/dashboard">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorDashboard /></InvestorLayout>
          </AuthGuard>
        </Route>
        <Route path="/dashboard">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorDashboard /></InvestorLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/profil">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorProfile /></InvestorLayout>
          </AuthGuard>
        </Route>
        <Route path="/profil">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorProfile /></InvestorLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/notifications">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorNotifications /></InvestorLayout>
          </AuthGuard>
        </Route>
        <Route path="/notifications">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorNotifications /></InvestorLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/explorer">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorExplorer /></InvestorLayout>
          </AuthGuard>
        </Route>
        <Route path="/explorer">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorExplorer /></InvestorLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/projets/:id">
          {(params: { id: string } = { id: "" }) => (
            <AuthGuard universe="investisseur" loginPath="/investisseur/login">
              <InvestorLayout><InvestorProjectDetail id={params.id} /></InvestorLayout>
            </AuthGuard>
          )}
        </Route>
        <Route path="/projets/:id">
          {(params: { id: string } = { id: "" }) => (
            <AuthGuard universe="investisseur" loginPath="/investisseur/login">
              <InvestorLayout><InvestorProjectDetail id={params.id} /></InvestorLayout>
            </AuthGuard>
          )}
        </Route>

        <Route path="/investisseur/wallet">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorWallet /></InvestorLayout>
          </AuthGuard>
        </Route>
        <Route path="/wallet">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorWallet /></InvestorLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/kyc">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorKyc /></InvestorLayout>
          </AuthGuard>
        </Route>
        <Route path="/kyc">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorKyc /></InvestorLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/settings">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorSettings /></InvestorLayout>
          </AuthGuard>
        </Route>
        <Route path="/settings">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestorLayout><InvestorSettings /></InvestorLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur">
          <Redirect to="/investisseur/dashboard" />
        </Route>
        <Route path="/investisseur/">
          <Redirect to="/investisseur/dashboard" />
        </Route>
        <Route path="/">
          <Redirect to="/investisseur/dashboard" />
        </Route>
      </Switch>
    </Suspense>
  );
}

export default function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return <PortalProviders apiBaseUrl={apiBaseUrl} publishableKey={publishableKey}>
    <WouterRouter><Router /></WouterRouter>
  </PortalProviders>;
}
