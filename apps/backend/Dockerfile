# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Disable Nx daemon for Docker builds
ENV NX_DAEMON=false
ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true

# Generate Prisma client directly
RUN npx prisma generate --schema=apps/backend/src/app/prisma/schema.prisma

# Build the application
RUN pnpm nx build backend --configuration=production

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy built assets
COPY --from=builder /app/dist/apps/backend ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/src/app/prisma ./prisma

# Set environment
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
