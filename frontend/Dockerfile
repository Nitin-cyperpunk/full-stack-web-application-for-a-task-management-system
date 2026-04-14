# Frontend — Vite build + nginx (port 3000)
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .

# API origin for browser (host machine accessing backend on port 5000)
ARG VITE_SERVER_URL=http://localhost:5000
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
