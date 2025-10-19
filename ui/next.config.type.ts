export interface NextConfigType {
  publicRuntimeConfig: {
    environment: string,
    apiBase: string
    endpoint: string
    spa?: boolean
    mainBackground?: string
  }
  serverRuntimeConfig: {
    apiBase: string
    endpoint: string
  }
}
