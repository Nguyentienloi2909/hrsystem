
# Stage 1: Build
FROM node:18-alpine AS builder

# Tạo biến môi trường tối ưu RAM cho Node.js
ENV NODE_OPTIONS=--max-old-space-size=2048

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
# Stage 2: Serve bằng nginx
FROM nginx:alpine

# Xoá default config nếu có
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy file build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config custom
COPY nginx.conf /etc/nginx/conf.d/default.conf
