import type { NextConfig } from "next";

/**
 * Build modes
 * -----------
 * 1. GitHub Pages (static export)  -> STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/spanishcafe
 * 2. Node host (Vercel/Railway/VPS) -> no STATIC_EXPORT, full API routes + Postgres + SMTP
 *
 * The base path is required for GitHub Pages project sites, which are served
 * from https://<user>.github.io/<repo>/ instead of the domain root.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  ...(isStaticExport
    ? {
        output: "export" as const,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
