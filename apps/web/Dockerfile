FROM node:20-alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN pnpm install

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN pnpm --filter @plataforma/shared build

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm --filter @plataforma/web build

EXPOSE 3000
CMD ["pnpm", "--filter", "@plataforma/web", "start"]
