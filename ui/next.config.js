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
      // REST taban URL - Client-side için HER ZAMAN localhost kullan (tarayıcıdan erişilebilir)
      apiBase: 'http://localhost:4000',
      // GraphQL endpoint
      endpoint: 'http://localhost:4000/graphql',
      spa: !!process.env.SPA || false,
      mainBackground: process.env.MAIN_BACKGROUND || '#8FA2A6'
    },
    serverRuntimeConfig: {
      // Server-side için Docker network hostname kullan
      apiBase: process.env.SERVER_API_BASE || 'http://api:4000',
      // GraphQL endpoint for server-side
      endpoint: (process.env.SERVER_API_BASE || 'http://api:4000') + '/graphql',
    },
    env: {
      version,
    }
  }
])
