# --- deps ---
FROM node:22-alpine AS deps
WORKDIR /app
# npm-installed pnpm (corepack's signature checks break in CI/containers)
RUN npm install -g pnpm@10.4.1
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- build ---
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10.4.1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- run ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app

# Next.js standalone output bundles only what it needs.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Drizzle migrations (run on container start).
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts

USER app
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
