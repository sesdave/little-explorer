# --- STAGE 1: Build Frontend (portal-ui) ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY app/portal-ui/package*.json ./app/portal-ui/

RUN npm install
COPY app/portal-ui ./app/portal-ui

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build -w portal-ui

# --- STAGE 2: Build Backend (portal-api) ---
FROM node:22-alpine AS backend-builder
WORKDIR /app

# Required for Prisma engine stability
RUN apk add --no-cache openssl

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY prisma ./prisma 
COPY app/portal-api/package*.json ./app/portal-api/

# This installs the Nest CLI from your root package.json devDependencies
RUN npm install

COPY app/portal-api ./app/portal-api

# Generate Prisma Client (supports your PostgreSQL models)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Clean workspace build
RUN npm run build -w portal-api

# --- STAGE 3: Final Production Image ---
FROM node:22-alpine
WORKDIR /app

# Copy production node_modules
COPY --from=backend-builder /app/node_modules ./node_modules

# Copy compiled NestJS code (ensure path matches nest-cli.json outDir)
COPY --from=backend-builder /app/dist/app/portal-api ./dist

# Copy Prisma and static Frontend assets
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/package*.json ./
COPY --from=frontend-builder /app/app/portal-ui/dist ./client

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main"]