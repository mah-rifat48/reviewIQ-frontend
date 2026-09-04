# 1. BUILD STAGE
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2. PRODUCTION STAGE
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]

# ---------- 1) Build stage ----------
# FROM node:20-alpine AS builder
# WORKDIR /app

# # Install deps
# COPY package*.json ./
# RUN npm ci

# # Copy code and build
# COPY . .
# RUN npm run build

# # ---------- 2) Run stage ----------
# FROM node:20-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production

# # Only copy needed files
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.* ./
# # If you use it:
# # COPY --from=builder /app/.env.production ./.env.production

# EXPOSE 3000
# CMD ["npm", "run", "start"]