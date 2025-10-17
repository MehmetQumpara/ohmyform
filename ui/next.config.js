const p = require('./package.json')
const optimizedImages = require('next-optimized-images')
const withPlugins = require('next-compose-plugins')

const environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
const version = p.version;

module.exports = withPlugins([
  optimizedImages({

  }),
  {
    eslint: {
      // Disable lint errors during production builds to unblock Docker image builds
      ignoreDuringBuilds: true,
    },
    images: {
      disableStaticImages: true,
    },
    poweredByHeader: true,
    productionBrowserSourceMaps: true,
    publicRuntimeConfig: {
      environment,
      // REST taban URL (GraphQL yerine)
      apiBase: process.env.API_BASE || 'http://localhost:4000',
      spa: !!process.env.SPA || false,
      mainBackground: process.env.MAIN_BACKGROUND || '#8FA2A6'
    },
    serverRuntimeConfig: {
      apiBase: process.env.SERVER_API_BASE || process.env.API_BASE || 'http://localhost:4000',
    },
    env: {
      version,
    }
  }
])
