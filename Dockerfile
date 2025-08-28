# Base image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install all dependencies for Linux (skip copying node_modules from host)
RUN npm install --omit=dev

# Copy remaining source files
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev --ignore-scripts --prefer-offline

CMD ["npm", "start"]
