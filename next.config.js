/** @type {import('next').NextConfig} */
const CSP = `
  default-src 'self';
  script-src 'self';
  connect-src 'self' https://api.simli.ai wss:;
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