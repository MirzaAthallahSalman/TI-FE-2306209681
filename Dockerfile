# Build stage
FROM node:20 AS build-stage

WORKDIR /app

COPY package*.json ./

ARG VITE_API_BASE_URL

RUN npm ci

COPY . .

# Create .env.production AFTER COPY (to override any existing file)
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env.production

# Verify .env.production content (for debugging)
RUN echo "=== .env.production content ===" && \
    cat .env.production && \
    echo "==================================="

RUN npm run build

# Production stage
FROM nginx:alpine AS production-stage

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]