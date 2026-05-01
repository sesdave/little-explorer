# --- STAGE 1: Frontend ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
COPY app/portal-ui/package*.json ./app/portal-ui/
COPY packages ./packages

RUN npm install

COPY app/portal-ui ./app/portal-ui

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build -w portal-ui


# --- STAGE 2: Backend ---
FROM node:22-alpine AS backend-builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY app/portal-api/package*.json ./app/portal-api/
COPY packages ./packages
COPY prisma ./prisma

RUN npm install

COPY app/portal-api ./app/portal-api

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build -w portal-api


# --- STAGE 3: Production ---
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=backend-builder /app/dist/app/portal-api ./dist
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=frontend-builder /app/app/portal-ui/dist ./client

RUN npx prisma generate --schema=./prisma/schema.prisma

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main.js"]