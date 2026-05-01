# --- STAGE 1: Build Frontend (portal-ui) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY app/portal-ui/package*.json ./app/portal-ui/

# Install workspace dependencies
RUN npm install

COPY app/portal-ui ./app/portal-ui

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# ✅ UPDATE: Build using the workspace flag instead of 'cd'
RUN npm run build -w portal-ui

# --- STAGE 2: Build Backend (portal-api) ---
FROM node:20-alpine AS backend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY prisma ./prisma 
COPY app/portal-api/package*.json ./app/portal-api/

RUN npm install
COPY app/portal-api ./app/portal-api

# Generate Prisma client for your ADMIN/PARENT roles
RUN npx prisma generate --schema=./prisma/schema.prisma

# ✅ UPDATE: Build using the workspace flag
RUN npm run build -w portal-api

# --- STAGE 3: Final Production Image ---
FROM node:20-alpine
WORKDIR /app

# 1. Copy dependencies from the workspace root
COPY --from=backend-builder /app/node_modules ./node_modules

# 2. ✅ UPDATE: Copy from the workspace-aware dist path
# Note: Ensure this path matches the 'outDir' in your apps/portal-api/tsconfig.json
COPY --from=backend-builder /app/dist/apps/portal-api ./dist

# 3. Copy Prisma for production migrations
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/package*.json ./

# 4. Copy Frontend static files
COPY --from=frontend-builder /app/app/portal-ui/dist ./client 

ENV NODE_ENV=production
EXPOSE 4000

# Your NestJS entry point
CMD ["node", "dist/main"]