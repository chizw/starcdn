FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM golang:1.24-alpine AS go-builder
WORKDIR /app
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN apk add --no-cache gcc musl-dev && go build -o /starcdn ./cmd/starcdn

FROM alpine:3.22 AS runner
WORKDIR /app
ENV STARCDN_ADDR=:8080
ENV STARCDN_STATIC_DIR=/app/out
ENV STARCDN_CACHE_DIR=/app/cache
COPY --from=go-builder /starcdn /usr/local/bin/starcdn
COPY --from=builder /app/out /app/out
RUN addgroup -S starcdn && adduser -S starcdn -G starcdn && mkdir -p /app/cache && chown -R starcdn:starcdn /app
USER starcdn
EXPOSE 8080
CMD ["starcdn"]
