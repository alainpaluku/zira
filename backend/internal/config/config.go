package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Env              string
	HTTPAddr         string
	DatabaseURL      string
	FrontendOrigins  []string
	ClerkJWTKey      string
	ClerkIssuer      string
	ClerkAudience    string
	AllowDevAuth     bool
	DevUserID        string
	DevUserRole      string
	ResendAPIKey     string
	ResendFromEmail  string
	AppPublicURL     string
	R2Endpoint       string
	R2Bucket         string
	R2AccessKey      string
	R2SecretKey      string
	R2PublicURL      string
}

func Load() (Config, error) {
	cfg := Config{
		Env:             env("APP_ENV", "development"),
		HTTPAddr:        env("HTTP_ADDR", ":8080"),
		DatabaseURL:     env("DATABASE_URL", ""),
		FrontendOrigins: split(env("FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:5000,http://localhost:5001,http://localhost:5002")),
		ClerkJWTKey:     os.Getenv("CLERK_JWT_KEY"),
		ClerkIssuer:     os.Getenv("CLERK_ISSUER"),
		ClerkAudience:   os.Getenv("CLERK_AUDIENCE"),
		AllowDevAuth:    boolEnv("ALLOW_DEV_AUTH", false),
		DevUserID:       os.Getenv("DEV_USER_ID"),
		DevUserRole:     env("DEV_USER_ROLE", "investisseur"),
		ResendAPIKey:    os.Getenv("RESEND_API_KEY"),
		ResendFromEmail: env("RESEND_FROM_EMAIL", "ZIRA INVEST <notifications@zira-invest.cd>"),
		AppPublicURL:    env("APP_PUBLIC_URL", "http://localhost:3000"),
		R2Endpoint: os.Getenv("R2_ENDPOINT"), R2Bucket: os.Getenv("R2_BUCKET"),
		R2AccessKey: os.Getenv("R2_ACCESS_KEY_ID"), R2SecretKey: os.Getenv("R2_SECRET_ACCESS_KEY"), R2PublicURL: os.Getenv("R2_PUBLIC_URL"),
	}
	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL is required")
	}
	if cfg.Env == "production" && cfg.AllowDevAuth {
		return Config{}, errors.New("ALLOW_DEV_AUTH must be false in production")
	}
	if cfg.Env == "production" && (cfg.ClerkJWTKey == "" || cfg.ClerkIssuer == "" || cfg.ClerkAudience == "") {
		return Config{}, errors.New("CLERK_JWT_KEY, CLERK_ISSUER and CLERK_AUDIENCE are required in production")
	}
	return cfg, nil
}

func env(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func split(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func boolEnv(key string, fallback bool) bool {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	return err == nil && parsed
}
