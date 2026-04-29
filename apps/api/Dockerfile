FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm --filter @plataforma/shared build
RUN pnpm --filter @plataforma/api exec prisma generate
RUN pnpm --filter @plataforma/api build

EXPOSE 3333
CMD ["sh", "-c", "pnpm --filter @plataforma/api exec prisma migrate deploy && pnpm --filter @plataforma/api start"]
