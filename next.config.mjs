/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/login',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/product/category/:storeSlug/:productSlug',
        destination: '/products/:storeSlug/product/:productSlug',
        permanent: true,
      },
      {
        source: '/product/category/:storeSlug/:category/:productSlug',
        destination: '/products/:storeSlug/:category/:productSlug',
        permanent: true,
      },
      {
        source: '/products/:storeSlug/:productSlug',
        destination: '/products/:storeSlug/product/:productSlug',
        permanent: true,
      },
      {
        source: '/store/:storeSlug/products/:productSlug',
        destination: '/store/:storeSlug/products/product/:productSlug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
