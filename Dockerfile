# -----------------------------
# STAGE 1: Build Frontend (portal-ui)
# -----------------------------
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy root configs (IMPORTANT for workspaces + TS paths)
COPY package*.json tsconfig.base.json ./

# Copy shared packages
COPY app/shared-types ./app/shared-types

# Copy UI workspace manifest first (for caching)
COPY app/portal-ui/package*.json ./app/portal-ui/

RUN npm install

# Copy actual UI source
COPY app/portal-ui ./app/portal-ui

# Build-time env (Vite only reads at build time)
ARG VITE_API_URL

# IMPORTANT FIX: ensure env is available during build execution
RUN VITE_API_URL=$VITE_API_URL npm run build -w portal-ui


# -----------------------------
# STAGE 2: Build Backend (portal-api)
# -----------------------------
FROM node:22-alpine AS backend-builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copy root config first
COPY package*.json tsconfig.base.json ./

# Copy shared packages + prisma schema
COPY app/shared-types ./app/shared-types
COPY prisma ./prisma

# Copy backend workspace manifest
COPY app/portal-api/package*.json ./app/portal-api/

RUN npm install

# Copy backend source
COPY app/portal-api ./app/portal-api

# Generate Prisma client (IMPORTANT for runtime + types)
RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npm run build -w @mle/types

# Build NestJS app
RUN npm run build -w portal-api



# -----------------------------
# STAGE 3: Production Runtime
# -----------------------------
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

RUN find /app -type f -name "main.js"

# Copy backend build output
COPY --from=backend-builder /app/dist/app/portal-api ./dist

# Copy Prisma schema (needed for runtime + migrations)
COPY --from=backend-builder /app/prisma ./prisma

# Copy frontend build output
COPY --from=frontend-builder /app/app/portal-ui/dist ./client

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "dist/main.js"]