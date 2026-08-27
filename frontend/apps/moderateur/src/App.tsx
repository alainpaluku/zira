import React, { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { PortalProviders, AuthGuard, LoadingState } from "@zira/ui";

import { ModeratorLayout } from "./layouts/ModeratorLayout";
const ModeratorOnboarding = lazy(() => import("./pages/Onboarding"));
const ModeratorDashboard = lazy(() => import("./pages/Dashboard"));
const ModeratorProfile = lazy(() => import("./pages/Profile"));
const ModeratorNotifications = lazy(() => import("./pages/Notifications"));
const ModeratorKyc = lazy(() => import("./pages/Kyc"));
const ModeratorProjects = lazy(() => import("./pages/Projects"));
const ModeratorUsers = lazy(() => import("./pages/Users"));
const ModeratorFinancialFlows = lazy(() => import("./pages/FinancialFlows"));
const ModeratorLogin = lazy(() => import("./pages/auth/ModeratorLogin"));

function Router() {
  return (
    <Suspense fallback={<LoadingState fullScreen label="Chargement du Portail Modération & Admin..." />}>
      <Switch>
        <Route path="/moderateur/login" component={ModeratorLogin} />
        <Route path="/moderation/login" component={ModeratorLogin} />
        <Route path="/login" component={ModeratorLogin} />

        <Route path="/moderateur/onboarding">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorOnboarding />
          </AuthGuard>
        </Route>
        <Route path="/moderation/onboarding">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorOnboarding />
          </AuthGuard>
        </Route>
        <Route path="/onboarding">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorOnboarding />
          </AuthGuard>
        </Route>

        <Route path="/moderateur/dashboard">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorDashboard /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/dashboard">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorDashboard /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/dashboard">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorDashboard /></ModeratorLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/profil">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorProfile /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/profil">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorProfile /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/profil">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorProfile /></ModeratorLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/notifications">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorNotifications /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/notifications">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorNotifications /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/notifications">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorNotifications /></ModeratorLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/kyc">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorKyc /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/kyc">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorKyc /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/kyc">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorKyc /></ModeratorLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/projets">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorProjects /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/projets">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorProjects /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/projets">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorProjects /></ModeratorLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/utilisateurs">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorUsers /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/utilisateurs">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorUsers /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/utilisateurs">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorUsers /></ModeratorLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/flux">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorFinancialFlows /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/flux">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorFinancialFlows /></ModeratorLayout>
          </AuthGuard>
        </Route>
        <Route path="/flux">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModeratorLayout><ModeratorFinancialFlows /></ModeratorLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur">
          <Redirect to="/moderateur/dashboard" />
        </Route>
        <Route path="/moderateur/">
          <Redirect to="/moderateur/dashboard" />
        </Route>
        <Route path="/moderation">
          <Redirect to="/moderateur/dashboard" />
        </Route>
        <Route path="/moderation/">
          <Redirect to="/moderateur/dashboard" />
        </Route>
        <Route path="/">
          <Redirect to="/moderateur/dashboard" />
        </Route>
      </Switch>
    </Suspense>
  );
}

export default function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL; const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return <PortalProviders apiBaseUrl={apiBaseUrl} publishableKey={publishableKey}>
    <WouterRouter><Router /></WouterRouter>
  </PortalProviders>;
}
