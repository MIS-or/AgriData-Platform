# ====================================================================
# AgriData Platform - Multi-Stage Production & Test Dockerfile
# Modular Monolith: @agridata/contracts + @agridata/api + @agridata/web
# Zero secrets baked into layers; secrets injected at runtime from root /.env
# ====================================================================

# --------------------------------------------------------------------
# STAGE 1: Base Monorepo Environment (Node 22 Alpine + pnpm)
# --------------------------------------------------------------------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app

# --------------------------------------------------------------------
# STAGE 2: Dependencies Installation (Cached Layer)
# --------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile=false

# --------------------------------------------------------------------
# STAGE 3: Isolated Test & Architecture Verification Stage
# --------------------------------------------------------------------
FROM deps AS test
COPY .env.example ./
COPY scripts ./scripts
COPY packages ./packages
COPY apps ./apps
RUN pnpm --filter @agridata/contracts build && pnpm typecheck && pnpm test

# --------------------------------------------------------------------
# STAGE 4: Production Builder (Contracts + Edge API + Web PWA)
# --------------------------------------------------------------------
FROM deps AS builder
COPY packages ./packages
COPY apps ./apps
RUN pnpm build

# --------------------------------------------------------------------
# STAGE 5: Edge API Runtime (Cloudflare Workers / Wrangler Runtime)
# Receives secrets at runtime via `env_file: ./.env` in docker-compose
# --------------------------------------------------------------------
FROM base AS api-runner
ENV NODE_ENV=production
COPY --from=builder /app /app
WORKDIR /app/apps/api
EXPOSE 8787
CMD ["pnpm", "exec", "wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]

# --------------------------------------------------------------------
# STAGE 6: Web PWA & Analytics Dashboard Runtime (Nginx 1.27 Alpine)
# Includes Security Headers, SPA routing, and /api reverse proxy
# --------------------------------------------------------------------
FROM nginx:1.27-alpine AS web-runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  add_header X-Content-Type-Options "nosniff" always;\n\
  add_header X-Frame-Options "DENY" always;\n\
  add_header X-XSS-Protection "1; mode=block" always;\n\
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
  location /api/ {\n\
    proxy_pass http://api:8787/api/;\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
  }\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

