FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN apk add --no-cache gcc musl-dev && go build -o /starcdn ./cmd/starcdn

FROM alpine:3.22 AS runner
WORKDIR /app
ENV STARCDN_ADDR=:2606
ENV STARCDN_CACHE_DIR=/app/cache
ENV STARCDN_DB_PATH=/app/data/starcdn.db
COPY --from=builder /starcdn /usr/local/bin/starcdn
RUN addgroup -S starcdn && adduser -S starcdn -G starcdn && mkdir -p /app/cache /app/data && chown -R starcdn:starcdn /app
USER starcdn
EXPOSE 2606
CMD ["starcdn"]
