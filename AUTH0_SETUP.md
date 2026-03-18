# Auth0 Setup Guide for AgentGate

## 1. Create Auth0 Tenant

1. Sign up at [auth0.com](https://auth0.com) (free tier — 25K MAU)
2. Create a new tenant (e.g., `agentgate-dev`)

## 2. Create a Regular Web Application

1. Go to **Applications → Applications → Create Application**
2. Choose **Regular Web Applications**
3. Name it `AgentGate`

### Configure URLs

In the application settings:

| Setting | Value |
|---------|-------|
| Allowed Callback URLs | `http://localhost:3000/api/auth/callback, https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback` |
| Allowed Logout URLs | `http://localhost:3000, https://YOUR-VERCEL-DOMAIN.vercel.app` |
| Allowed Web Origins | `http://localhost:3000, https://YOUR-VERCEL-DOMAIN.vercel.app` |

### Copy Credentials to `.env.local`

From the **Settings** tab, copy:
- **Domain** → `AUTH0_ISSUER_BASE_URL` (prepend `https://`)
- **Client ID** → `AUTH0_CLIENT_ID`
- **Client Secret** → `AUTH0_CLIENT_SECRET`

## 3. Enable Token Vault for GitHub

1. Go to **Authentication → Social**
2. Find or create a **GitHub** connection
3. Click the connection → **Advanced Settings**
4. Enable **Token Storage** (Token Vault)
5. Set scopes: `repo`, `read:user`, `user:email`

## 4. Enable Token Vault for Google

1. Go to **Authentication → Social**
2. Find or create a **Google** connection
3. Click the connection → **Advanced Settings**
4. Enable **Token Storage** (Token Vault)
5. Set scopes: `email`, `profile`, `https://www.googleapis.com/auth/gmail.modify`, `https://www.googleapis.com/auth/calendar`

## 5. Enable CIBA Grant Type

1. Go to **Applications → Your Application → Settings**
2. Scroll to **Advanced Settings → Grant Types**
3. Enable **CIBA** (Client Initiated Backchannel Authentication)

## 6. Enable Guardian Push Notifications (CIBA)

1. Go to **Security → Multi-factor Auth**
2. Enable **Push Notifications (via Auth0 Guardian)**
3. Go to **Actions → Library** and enable CIBA

## 7. Configure Management API (for Token Vault)

1. Go to **Applications → APIs**
2. Find **Auth0 Management API**
3. Copy the **Identifier** (audience URL) → `AUTH0_TOKEN_VAULT_AUDIENCE`

## 8. Generate Agent JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy output → `AGENT_JWT_SECRET`

## 9. Final `.env.local`

```env
AUTH0_SECRET='[run: openssl rand -hex 32]'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR-TENANT.auth0.com'
AUTH0_CLIENT_ID='your_client_id_here'
AUTH0_CLIENT_SECRET='your_client_secret_here'
AUTH0_TOKEN_VAULT_AUDIENCE='https://YOUR-TENANT.auth0.com/api/v2/'
AGENT_JWT_SECRET='your_32_char_random_secret'
NEXT_PUBLIC_APP_URL='http://localhost:3000'

# Optional (in-memory fallback used if not set)
UPSTASH_REDIS_REST_URL='https://your-redis.upstash.io'
UPSTASH_REDIS_REST_TOKEN='your_upstash_token'

# Optional (fallback NLP policy compiler)
OPENROUTER_API_KEY='your_key'
OPENROUTER_MODEL='deepseek/deepseek-chat-v3-0324:free'
```

## 10. Start Development Server

```bash
npm run dev
# Navigate to http://localhost:3000
# Click "Run Demo" to see the full flow
```
