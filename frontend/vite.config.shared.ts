import path from "path";
import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";

export function createPortalViteConfig(appDir: string, port: number): UserConfig {
  const root = (target: string) => path.resolve(appDir, target);
  return {
    plugins: [react()],
    resolve: { alias: {
      "@/lib/hero-icons-compat": root("../../packages/ui/src/lib/hero-icons-compat.tsx"),
      "@zira/ui/lib/hero-icons-compat": root("../../packages/ui/src/lib/hero-icons-compat.tsx"),
      "@zira/shared/lib/hero-icons-compat": root("../../packages/ui/src/lib/hero-icons-compat.tsx"),
      "@/components": root("../../packages/ui/src/components"),
      "@/hooks": root("../../packages/ui/src/hooks"),
      "@/contexts": root("../../packages/shared/src/contexts"),
      "@/lib": root("../../packages/shared/src/lib"),
      "@/types": root("../../packages/shared/src/types.ts"),
      "@": root("./src"),
      "@zira/shared": root("../../packages/shared/src"),
      "@zira/ui": root("../../packages/ui/src"),
    } },
    server: { host: "0.0.0.0", port, allowedHosts: true },
  };
}
