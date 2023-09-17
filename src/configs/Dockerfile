# Stage 1: install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 2: build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY public ./public
COPY package.json next.config.js tsconfig.json .env.production ./
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else yarn build; \
  fi

# Stage 3: run
FROM node:18-alpine as runner
WORKDIR /app

ARG NEXT_PORT
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


COPY --from=builder --chown=nextjs:nodejs /app/.env.$NODE_ENV ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./


USER nextjs


EXPOSE $NEXT_PORT
ENV PORT $NEXT_PORT

ENV HOSTNAME localhost


CMD ["npm", "start"]



 
