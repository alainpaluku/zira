import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { LoadingState } from "@zira/ui";
import { ProtectedRoute } from "./ProtectedRoute";

// Pages
const ProjectOwnerLogin = lazy(() => import("../pages/auth/ProjectOwnerLogin"));
const ProjectOwnerOnboarding = lazy(() => import("../pages/Onboarding"));
const ProjectOwnerDashboard = lazy(() => import("../pages/Dashboard"));
const ProjectOwnerProfile = lazy(() => import("../pages/Profile"));
const ProjectOwnerNotifications = lazy(() => import("../pages/Notifications"));
const ProjectOwnerWallet = lazy(() => import("../pages/Wallet"));
const ProjectOwnerProjects = lazy(() => import("../pages/Projects"));
const ProjectOwnerNewProject = lazy(() => import("../pages/NewProject"));
const ProjectOwnerProjectDetail = lazy(() => import("../pages/ProjectDetail"));

/**
 * Routeur principal de l'application Porteur.
 * Gère les routes publiques et sécurisées avec alias de compatibilité.
 */
export function AppRouter() {
  return (
    <Suspense fallback={<LoadingState fullScreen label="Chargement du Portail Porteur..." />}>
      <Switch>
        {/* Auth & Onboarding */}
        <Route path="/porteur/login" component={ProjectOwnerLogin} />
        <Route path="/login" component={ProjectOwnerLogin} />
        <Route path="/porteur/onboarding">
          <ProtectedRoute withLayout={false}><ProjectOwnerOnboarding /></ProtectedRoute>
        </Route>
        <Route path="/onboarding">
          <ProtectedRoute withLayout={false}><ProjectOwnerOnboarding /></ProtectedRoute>
        </Route>

        {/* Dashboard & Profile */}
        <Route path="/porteur/dashboard"><ProtectedRoute><ProjectOwnerDashboard /></ProtectedRoute></Route>
        <Route path="/dashboard"><ProtectedRoute><ProjectOwnerDashboard /></ProtectedRoute></Route>
        <Route path="/porteur/profil"><ProtectedRoute><ProjectOwnerProfile /></ProtectedRoute></Route>
        <Route path="/profil"><ProtectedRoute><ProjectOwnerProfile /></ProtectedRoute></Route>

        {/* Notifications & Wallet */}
        <Route path="/porteur/notifications"><ProtectedRoute><ProjectOwnerNotifications /></ProtectedRoute></Route>
        <Route path="/notifications"><ProtectedRoute><ProjectOwnerNotifications /></ProtectedRoute></Route>
        <Route path="/porteur/portefeuille"><ProtectedRoute><ProjectOwnerWallet /></ProtectedRoute></Route>
        <Route path="/portefeuille"><ProtectedRoute><ProjectOwnerWallet /></ProtectedRoute></Route>
        <Route path="/porteur/wallet"><ProtectedRoute><ProjectOwnerWallet /></ProtectedRoute></Route>
        <Route path="/wallet"><ProtectedRoute><ProjectOwnerWallet /></ProtectedRoute></Route>

        {/* Projects Management */}
        <Route path="/porteur/projets/nouveau"><ProtectedRoute><ProjectOwnerNewProject /></ProtectedRoute></Route>
        <Route path="/projets/nouveau"><ProtectedRoute><ProjectOwnerNewProject /></ProtectedRoute></Route>
        <Route path="/porteur/projets/:id">
          {(params = { id: "" }) => (
            <ProtectedRoute><ProjectOwnerProjectDetail id={params.id} /></ProtectedRoute>
          )}
        </Route>
        <Route path="/projets/:id">
          {(params = { id: "" }) => (
            <ProtectedRoute><ProjectOwnerProjectDetail id={params.id} /></ProtectedRoute>
          )}
        </Route>
        <Route path="/porteur/projets"><ProtectedRoute><ProjectOwnerProjects /></ProtectedRoute></Route>
        <Route path="/projets"><ProtectedRoute><ProjectOwnerProjects /></ProtectedRoute></Route>

        {/* Redirections racine */}
        <Route path="/porteur"><Redirect to="/porteur/dashboard" /></Route>
        <Route path="/porteur/"><Redirect to="/porteur/dashboard" /></Route>
        <Route path="/"><Redirect to="/porteur/dashboard" /></Route>
      </Switch>
    </Suspense>
  );
}
