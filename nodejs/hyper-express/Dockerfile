ARG TIMEZONE=America/Sao_Paulo

FROM node:20.18.1-bullseye-slim as builder
WORKDIR /app
COPY . .
RUN npm i \
	&& npm run build

FROM node:20.18.1-bullseye-slim
ARG TIMEZONE
ENV NODE_OPTIONS=--enable-source-maps
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app .
RUN rm -Rf node_modules/ \
  && npm ci --ignore-scripts
RUN rm -f .dockerignore package.json package-lock.json index.ts \
  && mv build/* . \
  && rmdir build/
  CMD ["./startup.sh"]
