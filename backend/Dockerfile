# Backend — Express + MongoDB (Mongoose)
FROM node:22-alpine

# bcrypt native bindings on Alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
