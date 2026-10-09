# --- Build stage: install deps, run tests, produce static files in /app/dist ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run test:run

# Vite bakes env vars into the JS bundle at build time, so the key is a build arg.
ARG VITE_TMDB_API_KEY
ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY
RUN npm run build

# --- Serve stage: only the built files + nginx, no Node or source code ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
