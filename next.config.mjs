/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },

  // Pengalihan URL lama (/dashboard/member/* & /dashboard/curator/*) ke rute baru
  async redirects() {
    return [
      {
        source: '/dashboard/member',
        has: [{ type: 'query', key: 'tab', value: 'artworks' }],
        destination: '/me/artworks',
        permanent: false,
      },
      {
        source: '/dashboard/member',
        has: [{ type: 'query', key: 'tab', value: 'submissions' }],
        destination: '/me/submissions',
        permanent: false,
      },
      {
        source: '/dashboard/member',
        has: [{ type: 'query', key: 'tab', value: 'favorites' }],
        destination: '/me/favorites',
        permanent: false,
      },
      {
        source: '/dashboard/member',
        destination: '/',
        permanent: false,
      },
      {
        source: '/dashboard/member/artworks/new',
        destination: '/me/artworks/new',
        permanent: false,
      },
      {
        source: '/dashboard/member/artworks/:id/edit',
        destination: '/me/artworks/:id/edit',
        permanent: false,
      },
      {
        source: '/dashboard/member/challenges',
        destination: '/challenges',
        permanent: false,
      },
      {
        source: '/dashboard/member/profile',
        destination: '/me/profile',
        permanent: false,
      },
      {
        source: '/dashboard/curator',
        has: [
          {
            type: 'query',
            key: 'view',
            value: '(challenges|submissions|winners|announcements)',
          },
        ],
        destination: '/curator/challenges',
        permanent: false,
      },
      {
        source: '/dashboard/curator',
        destination: '/',
        permanent: false,
      },
      {
        source: '/dashboard/curator/challenges',
        destination: '/curator/challenges',
        permanent: false,
      },
      {
        source: '/dashboard/curator/challenges/new',
        destination: '/curator/challenges/new',
        permanent: false,
      },
      {
        source: '/dashboard/curator/challenges/:id/edit',
        destination: '/curator/challenges/:id/edit',
        permanent: false,
      },
      {
        source: '/dashboard/curator/challenges/:id/submissions',
        destination: '/curator/challenges/:id/submissions',
        permanent: false,
      },
      {
        source: '/dashboard/curator/challenges/:id/winners',
        destination: '/curator/challenges/:id/winners',
        permanent: false,
      },
      {
        source: '/dashboard/curator/verification',
        destination: '/curator/verification',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
