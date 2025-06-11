# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .

RUN npm install --legacy-peer-deps

ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
