# --- STAGE 1: Build Frontend (portal-ui) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY libs ./libs
COPY portal-ui/package*.json ./portal-ui/
RUN npm install
COPY portal-ui ./portal-ui
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN cd portal-ui && npm run build

# --- STAGE 2: Build Backend (portal-api) ---
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY libs ./libs

# 🏛️ Copy the ROOT Prisma folder
COPY prisma ./prisma 

COPY portal-api/package*.json ./portal-api/
RUN npm install
COPY portal-api ./portal-api

# Generate client using the root schema path and build to /app/dist/apps/portal-api
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN cd portal-api && npm run build

# --- STAGE 3: Final Production Image ---
FROM node:20-alpine
WORKDIR /app

# 1. Production dependencies
COPY --from=backend-builder /app/portal-api/node_modules ./node_modules

# 2. 🏛️ Copy compiled code from the root dist (as per backend tsconfig outDir)
COPY --from=backend-builder /app/dist/apps/portal-api ./dist

# 3. Copy root Prisma folder for runtime engine/schema access
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/portal-api/package*.json ./

# 4. Copy Frontend static files into the 'client' folder
COPY --from=frontend-builder /app/portal-ui/dist ./client 

ENV NODE_ENV=production
EXPOSE 4000

# NestJS main.js will be at /app/dist/main.js
CMD ["node", "dist/main"]