# Dockerfile

# --- Stage 1: Build the application ---
# Use a specific Node.js version for consistency and security
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}


# Build the application with the standalone output setting
# This creates a minimal server in the .next/standalone folder
RUN npm run build

# --- Stage 2: Create the lean production image ---
# Use the same base image for a smaller final size
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary standalone output from the builder stage
# This folder contains the server.js file and all necessary node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the static assets (CSS, fonts) and the public folder (images)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the port environment variable for the Next.js server
ENV PORT=3000

# Start the application using the standalone server.js file
CMD ["node", "server.js"]