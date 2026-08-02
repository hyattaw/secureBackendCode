FROM node:24

# Ensure CI-friendly pnpm behavior
ENV CI=true

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files first (better caching)
COPY .npmrc ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy only what the API needs from the monorepo
COPY apps/api ./apps/api
COPY packages ./packages

# Install ONLY the API dependencies (workspace-aware)
RUN pnpm install --filter api --prod

# Switch into the API app directory
WORKDIR /app/apps/api

# Start the API
CMD ["node", "src/index.js"]
