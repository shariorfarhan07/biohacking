/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output produces a self-contained server bundle
  // (.next/standalone) so the production Docker image doesn't need
  // node_modules or the full source tree copied in.
  output: "standalone",
  // Lets the browser call same-origin `/api/...` paths, which this server
  // then forwards to the backend over the internal Docker network — so the
  // backend never needs its own publicly reachable port. Dormant in local
  // dev, where NEXT_PUBLIC_API_URL points the browser straight at the
  // backend and these paths are never hit.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.INTERNAL_API_URL || "http://backend:8000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
