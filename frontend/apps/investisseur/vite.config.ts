import { defineConfig } from "vite";
import { createPortalViteConfig } from "../../vite.config.shared";

export default defineConfig(createPortalViteConfig(__dirname, 3000));
