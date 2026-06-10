// initChatModel resolves providers via a variable dynamic import that nft cannot
// trace, so Vercel prunes these packages from the lambda unless force-included.
// Includes are not re-traced, so the providers' SDK deps must be listed too.
const langchainProviderIncludes = [
  "node_modules/@langchain/openai/**/*",
  "node_modules/@langchain/anthropic/**/*",
  "node_modules/@langchain/google-genai/**/*",
  "node_modules/openai/**/*",
  "node_modules/@anthropic-ai/sdk/**/*",
  "node_modules/@google/generative-ai/**/*",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/chat": langchainProviderIncludes,
    "/api/generate-title": langchainProviderIncludes,
  },
  serverExternalPackages: [
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
