FROM node:20-alpine AS base

FROM base AS deps

#instalando as dependencias para que o alpine funcione corretamente
RUN apk add --no-cache libc6-compat
WORKDIR /app

#copiando os arquivos das dependencias e baixar as dependencias que o projeto expecifica
COPY package.json package-lock.json* ./
RUN npm ci

#rodando o a nossa bild
COPY . .
RUN npm run build


#iniciarndo a nossa pordução vamos usar a mesma imagem anterior porem em modo de produção
FROM base AS production
WORKDIR /app


ENV NODE_ENV production
ENV NEXT_SHARP_PATH "/app/node_modules/sharp"

#adicionando um grupo para que o root nao seja utilizado(segurança)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


#jogando todos nossos arquivos para a produção
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=deps /app/next.config.mjs ./.next.config.mjs
COPY --from=deps --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=deps --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN mkdir -p /app && chown nextjs:nodejs /app

USER nextjs 

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"


CMD ["node", "server.js"]