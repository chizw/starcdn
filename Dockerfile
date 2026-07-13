FROM node:24-alpine AS node-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY app ./app
COPY public ./public
COPY next.config.ts tsconfig.json eslint.config.mjs ./
RUN npm run build

FROM rust:1-alpine AS rust-builder
WORKDIR /app
COPY Cargo.toml ./
COPY src ./src
RUN apk add --no-cache musl-dev openssl-dev openssl-libs-static pkgconfig && cargo build --release --bin starcdn

FROM alpine:3.22 AS runner
WORKDIR /app
ENV STARCDN_ADDR=:2607
ENV STARCDN_CACHE_DIR=/app/cache
ENV STARCDN_DB_PATH=/app/data/starcdn.db
ENV STARCDN_STATIC_DIR=/app/out
COPY --from=rust-builder /app/target/release/starcdn /usr/local/bin/starcdn
COPY --from=node-builder /app/out ./out
RUN addgroup -S starcdn && adduser -S starcdn -G starcdn && mkdir -p /app/cache /app/data && chown -R starcdn:starcdn /app
USER starcdn
EXPOSE 2607
CMD ["starcdn"]
