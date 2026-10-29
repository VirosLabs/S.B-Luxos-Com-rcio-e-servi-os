FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.js ./
COPY client ./client

ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
  && mkdir -p /app/server/uploads \
  && chown -R node:node /app

COPY --chown=node:node server/src ./server/src
COPY --from=build --chown=node:node /app/client/dist ./client/dist

USER node

EXPOSE 3001
CMD ["npm", "start"]
