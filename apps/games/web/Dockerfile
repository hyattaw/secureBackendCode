# ---------- Build Stage ----------
FROM node:24 AS build

ENV CI=true

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files
COPY .npmrc ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy only what games/web needs
COPY apps/games/web ./apps/games/web
COPY packages ./packages

# Install only games/web dependencies
RUN pnpm install --filter games...web --prod

# Build the games web app
RUN pnpm --filter games...web build


# ---------- Runtime Stage ----------
FROM caddy:2

# Copy built static files into Caddy's serving directory
COPY --from=build /app/apps/games/web/dist /srv/games
