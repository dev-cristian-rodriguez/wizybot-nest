# =============================================================================
# Wizybot NestJS - Docker Multi-Stage Build
# =============================================================================
#
# This Dockerfile has two stages:
#   - development: Full deps + source + build (for lint, test, e2e)
#   - production:  Minimal deps + compiled output only (for running the app)
#
# QUICK REFERENCE - Run with Docker Compose (see README for full setup):
#   App + Database:  docker compose up -d
#   Database only:   docker compose up postgres -d
#   App only:        docker compose up app -d
#
# Build images manually (for lint, test, e2e):
#   Development:     docker build -t wizybot-nest:dev --target development .
#   Production:      docker build -t wizybot-nest:prod --target production .
#
# Run commands in dev image (after building):
#   Lint:            docker run --rm wizybot-nest:dev npm run lint
#   Unit tests:      docker run --rm wizybot-nest:dev npm run test
#   E2E tests:       See README "Running Tests with Docker" section
# =============================================================================

# Base image
FROM node:22-alpine AS development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Build the app to the dist folder
RUN npm run build

# Production image, copy all the files and run next
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the build output from the development stage
COPY --from=development /usr/src/app/dist ./dist

# Start the server using the production build
CMD ["node", "dist/main"]
