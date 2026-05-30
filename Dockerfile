FROM node:24-alpine AS node-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY app ./app
COPY public ./public
COPY next.config.ts tsconfig.json eslint.config.mjs ./
RUN npm run build

FROM golang:1.25-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
COPY cmd ./cmd
COPY internal ./internal
RUN apk add --no-cache gcc musl-dev && go build -o /starcdn ./cmd/starcdn

FROM alpine:3.22 AS runner
WORKDIR /app
ENV STARCDN_ADDR=:2606
ENV STARCDN_CACHE_DIR=/app/cache
ENV STARCDN_DB_PATH=/app/data/starcdn.db
COPY --from=go-builder /starcdn /usr/local/bin/starcdn
COPY --from=node-builder /app/.next ./.next
COPY --from=node-builder /app/public ./public
COPY --from=node-builder /app/package.json ./
RUN addgroup -S starcdn && adduser -S starcdn -G starcdn && mkdir -p /app/cache /app/data && chown -R starcdn:starcdn /app
USER starcdn
EXPOSE 2606
CMD ["starcdn"]
