package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"starcdn/internal/server"
)

func main() {
	cfg := server.Config{
		Addr:       env("STARCDN_ADDR", ":2606"),
		CacheDir:   env("STARCDN_CACHE_DIR", ".cache/starcdn"),
		FlushToken: os.Getenv("STARCDN_FLUSH_TOKEN"),
		PurgeToken: os.Getenv("STARCDN_PURGE_TOKEN"),
		CacheTTL:   durationEnv("STARCDN_CACHE_TTL", 7*24*time.Hour),
		DBPath:     env("STARCDN_DB_PATH", ".data/starcdn.db"),
		AdminUser:  env("STARCDN_ADMIN_USER", "admin"),
		AdminPass:  env("STARCDN_ADMIN_PASS", "admin123"),
		JWTSecret:  env("STARCDN_JWT_SECRET", "starcdn-default-jwt-secret-2025"),
		RPID:       env("STARCDN_RP_ID", "localhost"),
		RPOrigin:   env("STARCDN_RP_ORIGIN", "http://localhost:2607"),
	}

	app, err := server.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("StarCDN listening on %s", cfg.Addr)
	log.Fatal(http.ListenAndServe(cfg.Addr, app))
}

func env(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func durationEnv(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	duration, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return duration
}
