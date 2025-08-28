# =========================
# Stage 1: Builder
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy all source files
COPY . .

# Pass environment variables as build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY

# Set them as environment variables for build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Build Next.js app
RUN npm run build

# =========================
# Stage 2: Production
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Set environment variables for runtime
ENV NEXT_PUBLIC_SUPABASE_URL=https://tzcqxgcfltegyjwzhkms.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Y3F4Z2NmbHRlZ3lqd3poa21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDE5NTAsImV4cCI6MjA3MTgxNzk1MH0.bZcPx691JnLEtOLVLer30UsmgDYtJ86s2uUtI1oe430
ENV SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Y3F4Z2NmbHRlZ3lqd3poa21zIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0MTk1MCwiZXhwIjoyMDcxODE3OTUwfQ.reKQQxV55h5NtNNGMr5_3VQvSMOhoygmHhajg6MwxDc


# Install production dependencies only
RUN npm install --omit=dev --ignore-scripts

EXPOSE 3000
CMD ["npm", "start"]
