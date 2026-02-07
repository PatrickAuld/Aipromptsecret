import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

const nodeBuiltins = [
  "net",
  "tls",
  "crypto",
  "stream",
  "os",
  "path",
  "fs",
  "perf_hooks",
  "events",
  "buffer",
  "util",
  "url",
  "string_decoder",
  "querystring",
  "http",
  "https",
  "zlib",
  "child_process",
  "dns",
  "assert",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@nulldiary/db"],
  serverExternalPackages: ["postgres"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".js"],
    };
    // Provide empty modules for Node.js built-ins in edge bundles.
    // Cloudflare Workers supplies these at runtime via nodejs_compat.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      ...Object.fromEntries(nodeBuiltins.map((m) => [m, false])),
    };
    return config;
  },
};

export default nextConfig;
