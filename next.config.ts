import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  output: 'standalone',
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  experimental: {
    authInterrupts: true,
  },
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [['rehype-highlight', {}]],
  },
});

export default withMDX(nextConfig);
