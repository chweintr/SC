/** @type {import('next').NextConfig} */
const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  connect-src 'self' https://api.simli.ai https://*.simli.ai wss://*.simli.ai;
  img-src 'self' data: blob:;
  style-src 'self' 'unsafe-inline';
  media-src 'self' blob:;
`.replace(/\s{2,}/g, ' ').trim();

module.exports = {
  eslint: {
    ignoreDuringBuilds: true
  },
  async headers() {
    return [{ source: '/(.*)', headers: [{ key: 'Content-Security-Policy', value: CSP }] }];
  },
};