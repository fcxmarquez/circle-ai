/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "langchain",
    "@langchain/openai",
    "@langchain/anthropic",
    "@huggingface/transformers",
    "onnxruntime-node",
    "sharp",
  ],
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/api/portraits/men/42.jpg",
      },
      {
        protocol: "https",
        hostname: "freelogopng.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
