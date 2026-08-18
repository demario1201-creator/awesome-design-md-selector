/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for GitHub Pages (no server runtime needed).
  output: "export",
  // GitHub Pages serves project sites under /<repo>/ on production builds.
  basePath: process.env.NODE_ENV === "production" ? "/awesome-design-md-selector" : "",
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
