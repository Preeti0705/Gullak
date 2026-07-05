# ─── Backend Dockerfile ──────────────────────────────
# Multi-layer build optimized for Docker cache
FROM node:20-alpine AS base

# Security: non-root user
RUN addgroup -g 1001 -S fintrack && \
    adduser -S fintrack -u 1001 -G fintrack

WORKDIR /app

# Layer 1: Dependencies (cached unless package.json changes)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Layer 2: Application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chown -R fintrack:fintrack /app

USER fintrack

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
