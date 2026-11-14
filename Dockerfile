# ==============================================================================
# Dockerfile Oficial — Sing Viagens e Turismo (SaaS)
# Multi-stage build otimizado para produção (Next.js Standalone)
# ==============================================================================

FROM node:22-alpine AS base

# 1. Instalação de dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 2. Build da aplicação Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Imagem final de execução (Runner leve e seguro)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia arquivos estáticos e públicos (incluindo logo.png oficial)
COPY --from=builder /app/public ./public

# Prepara diretório de dados persistentes (db.json / histórico / regras de markup)
RUN mkdir -p /app/src/data && chown -R nextjs:nodejs /app/src/data
COPY --from=builder --chown=nextjs:nodejs /app/src/data ./src/data

# Copia build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
