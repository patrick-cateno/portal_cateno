export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'CatIA Super App',
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME ?? 'CSA',
  description:
    'Super App com assistente inteligente, catálogo de aplicações e orquestração de microsserviços',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
};
