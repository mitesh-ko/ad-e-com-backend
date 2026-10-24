# ==========================================
# Stage 1: Build stage
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Compile TypeScript into optimized bundle in dist/
RUN npm run build

# Prune devDependencies to keep production dependencies
RUN npm prune --production

# ==========================================
# Stage 2: Production runtime stage
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled code and production modules from builder
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Switch to non-root user
USER appuser

# Expose API port
EXPOSE 4000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/healthz || exit 1

# Start production server
CMD ["node", "dist/server.js"]
