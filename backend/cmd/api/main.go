package main

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zira-invest/backend/internal/adapters/email"
	"github.com/zira-invest/backend/internal/adapters/postgres"
	"github.com/zira-invest/backend/internal/app"
	"github.com/zira-invest/backend/internal/config"
	httpapi "github.com/zira-invest/backend/internal/http"
	"github.com/zira-invest/backend/internal/http/middleware"
	"github.com/zira-invest/backend/internal/adapters/storage"
)

func main() {
	cfg, err := config.Load()
	if err != nil { log.Fatal(err) }
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	store, err := postgres.Open(ctx, cfg.DatabaseURL)
	if err != nil { log.Fatal(err) }
	defer store.Close()

	fileStorage, err := storage.NewR2(cfg.R2Endpoint, cfg.R2Bucket, cfg.R2AccessKey, cfg.R2SecretKey, cfg.R2PublicURL)
	if err != nil && cfg.Env == "production" { log.Fatal(err) }
	service := &app.Service{
		Users: store, Projects: store, KYC: store, Notifications: store, Investments: store,
		Email: email.NewResend(cfg),
		Storage: fileStorage,
	}
	if cfg.Env == "production" { gin.SetMode(gin.ReleaseMode) }
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery(), cors(cfg.FrontendOrigins))
	httpapi.NewHandler(service).Register(router, middleware.RequireAuth(cfg))
	server := &http.Server{Addr: cfg.HTTPAddr, Handler: router, ReadHeaderTimeout: 10 * time.Second}
	log.Printf("ZIRA API listening on %s", cfg.HTTPAddr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed { log.Fatal(err) }
}

func cors(origins []string) gin.HandlerFunc {
	allowed := map[string]bool{}
	for _, origin := range origins { allowed[origin] = true }
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if allowed[origin] || len(allowed) == 0 {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Clerk-Session-Token")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		}
		if c.Request.Method == http.MethodOptions { c.AbortWithStatus(http.StatusNoContent); return }
		c.Next()
	}
}

var _ = strings.TrimSpace
