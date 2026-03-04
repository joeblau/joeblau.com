/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/ncb",
        destination: "/non-custodial-bank.pdf",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
