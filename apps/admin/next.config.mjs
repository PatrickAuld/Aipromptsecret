/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@nulldiary/db"],
  // NOTE: Do not externalize the Postgres driver in Workers builds.
  // We want the bundler to pick the correct conditional export for workerd.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".js"],
    };
    return config;
  },
};

export default nextConfig;
