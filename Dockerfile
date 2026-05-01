# --- STAGE 1: Build Frontend (portal-ui) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY app/portal-ui/package*.json ./app/portal-ui/

RUN npm install

COPY app/portal-ui ./app/portal-ui

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# ✅ Fix: Use --root for Vite
RUN ./node_modules/.bin/vite build --root app/portal-ui

# --- STAGE 2: Build Backend (portal-api) ---
FROM node:20-alpine AS backend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY prisma ./prisma 
COPY app/portal-api/package*.json ./app/portal-api/

RUN npm install

COPY app/portal-api ./app/portal-api

RUN npx prisma generate --schema=./prisma/schema.prisma

# ✅ Fix: Direct binary call for Nest
RUN ./node_modules/.bin/nest build portal-api

# --- STAGE 3: Final Production Image ---
FROM node:20-alpine
WORKDIR /app

COPY --from=backend-builder /app/node_modules ./node_modules

# Ensure this matches your actual build output directory
COPY --from=backend-builder /app/dist/apps/portal-api ./dist

COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/package*.json ./

# ✅ Update: Vite build --root app/portal-ui puts dist inside that folder
COPY --from=frontend-builder /app/app/portal-ui/dist ./client 

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main"]