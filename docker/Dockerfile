# ==========================================
# Synapse - Multi-stage Docker Build (Simplified)
# ==========================================

# ------------------------------
# Stage 1: Builder
# ------------------------------
FROM node:22-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    ca-certificates \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files (only essential ones)
COPY packages/protocol/package.json ./packages/protocol/
COPY packages/client/package.json ./packages/client/
COPY packages/unified-daemon/package.json ./packages/unified-daemon/
COPY packages/cli/package.json ./packages/cli/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code (only essential packages)
COPY packages/protocol ./packages/protocol
COPY packages/client ./packages/client
COPY packages/unified-daemon ./packages/unified-daemon
COPY packages/cli ./packages/cli

# Build only essential packages
RUN npm run build --workspace=@synapse/protocol
RUN npm run build --workspace=@synapse/client
RUN npm run build --workspace=@synapse/unified-daemon
RUN npm run build --workspace=@synapse/cli

# ------------------------------
# Stage 2: Runtime (Unified Daemon)
# ------------------------------
FROM node:22-slim AS unified-daemon

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN groupadd -r synapse && useradd -r -g synapse synapse

# Set working directory
WORKDIR /app

# Install runtime system dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    tini \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/turbo.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built packages
COPY --from=builder /app/packages/protocol/dist ./packages/protocol/dist
COPY --from=builder /app/packages/protocol/package.json ./packages/protocol/
COPY --from=builder /app/packages/client/dist ./packages/client/dist
COPY --from=builder /app/packages/client/package.json ./packages/client/
COPY --from=builder /app/packages/unified-daemon/dist ./packages/unified-daemon/dist
COPY --from=builder /app/packages/unified-daemon/package.json ./packages/unified-daemon/

# Switch to non-root user
USER synapse

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Expose ports
EXPOSE 8080

# Use tini as init system
ENTRYPOINT ["/usr/bin/tini", "--"]

# Default command
CMD ["node", "packages/unified-daemon/dist/index.js"]
