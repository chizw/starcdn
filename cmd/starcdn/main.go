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
		Addr:       env("STARCDN_ADDR", ":8080"),
		StaticDir:  env("STARCDN_STATIC_DIR", "out"),
		CacheDir:   env("STARCDN_CACHE_DIR", ".cache/starcdn"),
		FlushToken: os.Getenv("STARCDN_FLUSH_TOKEN"),
		CacheTTL:   durationEnv("STARCDN_CACHE_TTL", 7*24*time.Hour),
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
