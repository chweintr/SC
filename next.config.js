/** @type {import('next').NextConfig} */
const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
  connect-src 'self' https://api.simli.ai https://*.simli.ai wss: https://*.daily.co;
  img-src 'self' data: blob: https://www.simli.com https://app.simli.com;
  style-src 'self' 'unsafe-inline';
  media-src 'self' blob:;
  frame-src 'self' https://*.daily.co;
`.replace(/\s{2,}/g, ' ').trim();

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  /**
   * The app relies on dynamic API routes (e.g. /api/simli/session) to inject
   * secrets at request-time, so static export cannot work. Force a standalone
   * server build to keep Docker and Railway deployments from switching to the
   * incompatible `output: "export"` mode.
   */
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/(.*)', headers: [{ key: 'Content-Security-Policy', value: CSP }] }];
  },
};
