/** @type {import('next').NextConfig} */

const nextConfig =
  process.env.BUILD_STANDALONE === 'true'
    ? {
        output: 'standalone',
      }
    : {}

module.exports = nextConfig
