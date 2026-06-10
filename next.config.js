/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    // langchain must run unbundled: Turbopack compiles its variable dynamic
    // import (initChatModel) into a stub that throws at runtime
    "langchain",
    "@langchain/openai",
    "@langchain/anthropic",
    "@langchain/google-genai",
    "@google/generative-ai",
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
