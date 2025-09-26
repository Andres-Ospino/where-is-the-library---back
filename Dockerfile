# Multi-stage build for production optimization
FROM node:18-alpine AS base

RUN apk add --no-cache libc6-compat \
  && corepack enable

WORKDIR /app

# Install all dependencies for building the project
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN corepack pnpm install --frozen-lockfile

# Install only production dependencies for the runtime image
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml* ./
RUN corepack pnpm install --frozen-lockfile --prod

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

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
COPY --from=builder /app/prisma ./prisma

# Change ownership to nestjs user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["pnpm", "run", "start:prod"]
