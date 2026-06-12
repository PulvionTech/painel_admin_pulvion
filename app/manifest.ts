import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PulviOn Admin',
    short_name: 'PulviOn',
    description: 'Painel administrativo e operacional PulviOn',
    start_url: '/login',
    display: 'standalone',
    background_color: '#F1F5F9',
    theme_color: '#0E5162',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logos/pulvion-symbol-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logos/pulvion-symbol-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logos/pulvion-symbol-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
