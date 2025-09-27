# Multi-stage build for production optimization
FROM node:18-alpine3.18 AS base

RUN apk add --no-cache libc6-compat openssl openssl1.1-compat curl \
  && corepack enable \
  && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

# Install all dependencies for building the project
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Install only production dependencies for the runtime image
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile \
  && pnpm prisma generate \
  && pnpm prune --prod

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm run build

# Production image, copy all the files and run the app
FROM base AS runner

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Change ownership to nestjs user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application without relying on the package manager at runtime
CMD ["node", "dist/main"]
