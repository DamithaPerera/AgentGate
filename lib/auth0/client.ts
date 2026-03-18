// Auth0 client configuration
// The @auth0/nextjs-auth0 package handles session management automatically
// via the Auth0Provider and route handlers.

export const auth0Config = {
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.AUTH0_BASE_URL ?? 'http://localhost:3000',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
};
