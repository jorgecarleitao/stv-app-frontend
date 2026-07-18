# Build stage
FROM node:20 AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY ./package*.json ./
RUN pnpm install
COPY ./ ./
RUN pnpm run build

# Runtime stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
