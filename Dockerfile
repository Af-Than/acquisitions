# Multi-stage Dockerfile for Acquisitions Microservice
FROM node:22-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./

# Stage: Development
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Stage: Production
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Run as non-root user for container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --chown=appuser:appgroup . .
RUN mkdir -p logs && chown -R appuser:appgroup logs

USER appuser
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "src/index.js"]
