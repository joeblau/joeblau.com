/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Import *.md files as raw strings, inlined into the bundle at build time.
    // This keeps the memo content out of the runtime filesystem (unavailable on
    // the Cloudflare Workers runtime).
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
};

module.exports = nextConfig;
