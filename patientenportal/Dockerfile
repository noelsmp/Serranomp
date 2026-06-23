FROM node:22-alpine AS base

# Abhängigkeiten installieren
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Platzhalter-Werte für Build (echte Werte kommen zur Laufzeit)
ENV NEXT_PUBLIC_APP_URL=https://portal.naturheilpraxis-hilfreich.de
ENV DB_PATH=/data/portal.db
ENV UPLOADS_PATH=/data/uploads

RUN npm run build

# Produktion
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Dateiverzeichnis für SQLite + Uploads
RUN mkdir -p /data/uploads && chown -R nextjs:nodejs /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]
