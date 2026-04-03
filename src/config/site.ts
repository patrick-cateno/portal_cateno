export const siteConfig = {
  name: 'Portal Cateno',
  description: 'Portal centralizado de aplicações Cateno',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;
