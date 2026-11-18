
# Stage 1: Build React + Vite
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build production assets
RUN npm run build


# Stage 2: Nginx production server
FROM nginx:1.28-alpine AS production

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY development/nginx/nginxapp.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=builder /app/build ./user/share/nginx/frontend

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]