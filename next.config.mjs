/** @type {import('next').NextConfig} */
const nextConfig = {};

// configure image optimization
nextConfig.images = {
  remotePatterns: [
    {
      // match any image URL on a domain
      hostname: "static-cdn.jtvnw.net",
    },
    {
      hostname: "clips-media-assets2.twitch.tv"
    }
  ],
  deviceSizes: [320, 420, 768, 1024, 1200],
  imageSizes: [16, 32, 48, 64, 96],
  path: "/_next/image",
  loader: "default",
};

export default nextConfig;
