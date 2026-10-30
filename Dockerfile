# Stage 1: Build bằng Vite
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Biến VITE_* được "nhúng" vào code lúc build. Mặc định gọi /api cùng domain, nginx proxy sang BE.
# Biến môi trường ưu tiên hơn file .env, nên các biến còn lại (Firebase...) vẫn đọc từ .env
ARG VITE_API_URL=/api
ARG VITE_GOOGLE_AUTH_URL=/api/oauth2/authorization/google
ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_AUTH_URL=$VITE_GOOGLE_AUTH_URL
RUN npm run build

# Stage 2: Phục vụ file tĩnh bằng nginx
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
