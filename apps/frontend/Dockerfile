# ─── Build stage ─────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/package.json ./libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Accept API URL as build argument (NEXT_PUBLIC_* must be set at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Nx daemon for Docker builds
ENV NX_DAEMON=false
ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the frontend
RUN pnpm nx build frontend --configuration=production

# ─── Production stage ───────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/frontend/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 4200

ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/frontend/server.js"]
