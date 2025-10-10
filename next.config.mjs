/** @type {import('next').NextConfig} */
const nextConfig = {

    // output: "export",

    eslint: {
    // Warning: Điều này cho phép build thành công ngay cả khi có lỗi ESLint
    ignoreDuringBuilds: true,
    
  },
  images: {
    remotePatterns: [
     {
        protocol: 'https',
        hostname: 'your-backend-domain.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
