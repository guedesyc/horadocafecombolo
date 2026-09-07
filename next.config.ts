import type { NextConfig } from 'next';

const basePath = process.env.BASE_PATH ?? '';
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  // The hosted version needs server routes for the admin panel. GitHub Pages is
  // static-only, so export HTML only for that workflow.
  output: isGithubPages ? 'export' : undefined,
  basePath: isGithubPages ? '' : basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
