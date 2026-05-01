# --- STAGE 1: Build Frontend (portal-ui) ---
# Updated to Node 22 to satisfy @paystack/inline-js requirements
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY app/portal-ui/package*.json ./app/portal-ui/

# Install dependencies for the workspace
RUN npm install

COPY app/portal-ui ./app/portal-ui

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# ✅ Use the workspace build command from the root
RUN npm run build -w portal-ui

# --- STAGE 2: Build Backend (portal-api) ---
FROM node:22-alpine AS backend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY prisma ./prisma 
COPY app/portal-api/package*.json ./app/portal-api/

RUN npm install
COPY app/portal-api ./app/portal-api

# Generate Prisma Client for ADMIN/PARENT roles
RUN npx prisma generate --schema=./prisma/schema.prisma

# ✅ Fix: Use npx to run the nest build for the specific workspace
RUN npx nest build portal-api

# ✅ Use the workspace build command from the root
#RUN npm run build -w portal-api

# --- STAGE 3: Final Production Image ---
FROM node:22-alpine
WORKDIR /app

# 1. Copy dependencies
COPY --from=backend-builder /app/node_modules ./node_modules

# 2. Copy compiled NestJS code
# Ensure this matches the outDir in your portal-api tsconfig
COPY --from=backend-builder /app/dist/app/portal-api ./dist

# 3. Copy Prisma and static Frontend files
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/package*.json ./
COPY --from=frontend-builder /app/app/portal-ui/dist ./client

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main"]