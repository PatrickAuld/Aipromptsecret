/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@nulldiary/db"],
  webpack: (config) => {
    // The db package uses .js extensions in TS imports (ESM convention).
    // Tell webpack to also try .ts when resolving .js imports.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".js"],
    };
    return config;
  },
};

export default nextConfig;
