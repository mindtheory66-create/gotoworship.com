/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    workerThreads: false,
    cpus: 1,
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'streetviewpixels-pa.googleapis.com',
      },
    ],
  },
  async redirects() {
    // Singular and alternate religion URLs -> canonical plural short URLs.
    return [
      { source: '/church', destination: '/churches', permanent: true },
      { source: '/mosque', destination: '/mosques', permanent: true },
      { source: '/synagogue', destination: '/synagogues', permanent: true },
      { source: '/temple', destination: '/temples', permanent: true },
      { source: '/buddhist-temple', destination: '/buddhist-temples', permanent: true },
      { source: '/gurdwara', destination: '/gurdwaras', permanent: true },
      { source: '/islam', destination: '/mosques', permanent: true },
      { source: '/christianity', destination: '/churches', permanent: true },
      { source: '/judaism', destination: '/synagogues', permanent: true },
      { source: '/hinduism', destination: '/temples', permanent: true },
      { source: '/buddhism', destination: '/buddhist-temples', permanent: true },
      { source: '/sikhism', destination: '/gurdwaras', permanent: true },
    ];
  },
  async rewrites() {
    // Public short URLs for major religions -> dynamic religion filter route.
    // Keep in sync with src/lib/config/religions.ts RELIGION_SLUGS.
    const religionRewrites = [
      { source: '/churches', destination: '/worship/churches' },
      { source: '/mosques', destination: '/worship/mosques' },
      { source: '/synagogues', destination: '/worship/synagogues' },
      { source: '/temples', destination: '/worship/temples' },
      { source: '/buddhist-temples', destination: '/worship/buddhist-temples' },
      { source: '/gurdwaras', destination: '/worship/gurdwaras' },
    ];
    return religionRewrites;
  },
};

module.exports = nextConfig;
