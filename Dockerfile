# Use Debian-based image for faster SWC installation
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Use npm ci for clean, faster, reproducible installs
RUN npm ci --ignore-scripts

# Copy full source and env file
COPY . .
COPY .env.local .env

# Build the Next.js app
RUN npm run build

# Runner stage
FROM node:20-bullseye-slim AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./.env

RUN npm ci --omit=dev --ignore-scripts

EXPOSE 3000
CMD ["npm", "start"]
