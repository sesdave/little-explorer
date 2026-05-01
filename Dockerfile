# --- STAGE 1: Build Frontend (portal-ui) ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# 1. Copy root configs first
COPY package*.json tsconfig.base.json ./ 
COPY packages ./packages

# 2. Copy the specific workspace
COPY app/portal-ui/package*.json ./app/portal-ui/
RUN npm install

# 3. Copy the rest of the UI source
COPY app/portal-ui ./app/portal-ui

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# ✅ Run build from the root so workspaces resolve relative paths correctly
RUN npm run build -w portal-ui

# --- STAGE 2: Build Backend (portal-api) ---
FROM node:22-alpine AS backend-builder
WORKDIR /app

RUN apk add --no-cache openssl

# 1. Copy root configs
COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY prisma ./prisma 
COPY app/portal-api/package*.json ./app/portal-api/

RUN npm install
COPY app/portal-api ./app/portal-api

# 2. Generate Prisma (Ensure you use Prisma 5 to avoid the v7 URL error)
RUN npx prisma generate --schema=./prisma/schema.prisma

# ✅ Build from root
RUN npm run build -w portal-api