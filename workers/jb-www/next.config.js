/** @type {import('next').NextConfig} */
const nextConfig = {
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
