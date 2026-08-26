/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Local dev only — production uses NEXT_PUBLIC_PLATFORM_API_URL (https://api.force42.com)
    // and CORS on the API. Never expose an internal proxy on the live platform site.
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    const apiProxyTarget =
      process.env.PLATFORM_API_PROXY_TARGET ?? "http://127.0.0.1:4002";

    return [
      {
        source: "/platform-api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
