# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================

# IMPORTANT: Node.js Version Maintenance
# The Node.js version specified in this Dockerfile should be kept in sync 
# with the version defined in the .nvmrc file at the root of the project.
ARG NODE_VERSION=24.7.0-slim

FROM node:${NODE_VERSION} AS dependencies

# Set working directory
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Install project dependencies with frozen lockfile for reproducible builds
RUN --mount=type=cache,target=/root/.npm \
  if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund; \
  else \
    echo "No lockfile found." && exit 1; \
  fi

# ============================================
# Stage 2: Run worker application
# ============================================

FROM node:${NODE_VERSION} AS runner

# Set working directory
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production

# Copy project dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy worker script
COPY . .

# Start the worker application
CMD ["node", "index.ts"]
