export const AppConfig = {
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  ENABLE_DEMO_ACCOUNT: process.env.NEXT_PUBLIC_ENABLE_DEMO_ACCOUNT || false
}