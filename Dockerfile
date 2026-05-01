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

# ✅ Fix: Call Vite binary directly from the root node_modules
RUN ./node_modules/.bin/vite build --prefix app/portal-ui

# --- STAGE 2: Build Backend (portal-api) ---
FROM node:20-alpine AS backend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY prisma ./prisma 
COPY app/portal-api/package*.json ./app/portal-api/

RUN npm install

COPY app/portal-api ./app/portal-api

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# ✅ Fix: Call Nest binary directly from the root node_modules
RUN ./node_modules/.bin/nest build portal-api

# --- STAGE 3: Final Production Image ---
FROM node:20-alpine
WORKDIR /app

# Copy production dependencies
COPY --from=backend-builder /app/node_modules ./node_modules

# ✅ Fix: Ensure this matches your Nest outDir (usually dist/apps/portal-api)
COPY --from=backend-builder /app/dist/apps/portal-api ./dist

COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/package*.json ./
COPY --from=frontend-builder /app/app/portal-ui/dist ./client 

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main"]