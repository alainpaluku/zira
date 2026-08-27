import React, { createElement, type ComponentType, type ReactNode } from "react";
import type { Universe } from "@zira/shared";
import { AuthGuard } from "./AuthGuard";

export interface PortalRouteProps {
  universe: Universe;
  loginPath: string;
  children: ReactNode;
  layout?: ComponentType<{ children: ReactNode }>;
}

export function PortalRoute({ universe, loginPath, children, layout: Layout }: PortalRouteProps) {
  return <AuthGuard universe={universe} loginPath={loginPath}>
    {Layout ? createElement(Layout, { children }) : children}
  </AuthGuard>;
}
