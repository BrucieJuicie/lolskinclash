/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        "ddragon.leagueoflegends.com", // Riot image server
      ],
    },
  };
  
  export default nextConfig;
  