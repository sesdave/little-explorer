# --- STAGE 1: Build Frontend (portal-ui) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy workspace configuration and shared packages first
COPY package*.json tsconfig.base.json ./
COPY packages ./packages

# Copy the specific app folder using the 'apps/' prefix
COPY app/portal-ui/package*.json ./app/portal-ui/

# Install dependencies for the whole workspace
RUN npm install

# Copy the rest of the frontend source
COPY app/portal-ui ./app/portal-ui

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN cd app/portal-ui && npm run build

# --- STAGE 2: Build Backend (portal-api) ---
FROM node:20-alpine AS backend-builder
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages ./packages
COPY prisma ./prisma 

COPY app/portal-api/package*.json ./app/portal-api/
RUN npm install
COPY app/portal-api ./app/portal-api

# Generate Prisma client and build backend
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN cd app/portal-api && npm run build

# --- STAGE 3: Final Production Image ---
FROM node:20-alpine
WORKDIR /app

# Copy production node_modules from the root (where workspaces installs them)
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/dist/app/portal-api ./dist
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/package*.json ./

# Copy Frontend static files into the 'client' folder
COPY --from=frontend-builder /app/app/portal-ui/dist ./client 

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main"]