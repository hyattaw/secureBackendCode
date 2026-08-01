FROM node:24

ENV CI=true

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY .npmrc ./
COPY package.json pnpm-lock.yaml ./
COPY . .

RUN pnpm install --prod

CMD ["node", "src/index.js"]
