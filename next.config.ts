import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Organiser + event cover images served from the CityTales CDN
        protocol: "https",
        hostname: "d20k5uz2q15f9b.cloudfront.net",
        pathname: "/**",
      },
      {
        // Origin bucket behind the CDN (some records expose the S3 URL directly)
        protocol: "https",
        hostname: "citytales-media-prod.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
