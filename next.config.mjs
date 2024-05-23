/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'laudable-reindeer-794.convex.cloud',
            }
        ]
    }
};

export default nextConfig;
