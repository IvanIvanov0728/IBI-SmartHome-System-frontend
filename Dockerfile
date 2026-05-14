# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Robust Nginx config for SPA with improved routing and security
RUN printf "server { \n\
    listen 80; \n\
    server_name localhost; \n\
    \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html index.htm; \n\
        try_files \$uri \$uri/ /index.html; \n\
    } \n\
    \n\
    # Proxy API requests to the backend if needed (as a fallback) \n\
    location /api/ { \n\
        proxy_pass https://ibi-smarthome-system-production.up.railway.app; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Upgrade \$http_upgrade; \n\
        proxy_set_header Connection 'upgrade'; \n\
        proxy_set_header Host ibi-smarthome-system-production.up.railway.app; \n\
        proxy_cache_bypass \$http_upgrade; \n\
        proxy_set_header X-Real-IP \$remote_addr; \n\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; \n\
        proxy_set_header X-Forwarded-Proto \$scheme; \n\
    } \n\
    \n\
    # Proxy SignalR hub \n\
    location /smartHomeHub { \n\
        proxy_pass https://ibi-smarthome-system-production.up.railway.app; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Upgrade \$http_upgrade; \n\
        proxy_set_header Connection 'upgrade'; \n\
        proxy_set_header Host ibi-smarthome-system-production.up.railway.app; \n\
        proxy_cache_bypass \$http_upgrade; \n\
    } \n\
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
