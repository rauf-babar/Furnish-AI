/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/generate',
        destination: 'http://localhost:5000/generate',
      },
    ];
  },
};

module.exports = nextConfig;
