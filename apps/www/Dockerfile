# ---------- Build Stage ----------
FROM node:24 AS build

ENV CI=true

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files
COPY .npmrc ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy only what www needs
COPY apps/www ./apps/www
COPY packages ./packages

# Install only www dependencies
RUN pnpm install --filter www --prod

# Build the landing page
RUN pnpm --filter www build


# ---------- Runtime Stage ----------
FROM caddy:2

# Copy built static files into Caddy's serving directory
COPY --from=build /app/apps/www/dist /srv/www
