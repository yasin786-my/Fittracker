# ── Stage 1: Build the React app ────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install deps (cached unless package files change)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Override the Vite dev proxy — in production, nginx handles /api
ENV VITE_API_URL=/api
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
