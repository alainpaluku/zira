package middleware

import (
	"crypto/rsa"
	"encoding/pem"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/zira-invest/backend/internal/config"
)

const (
	UserIDKey   = "user_id"
	UserEmailKey = "user_email"
	UserRoleKey = "user_role"
)

func RequireAuth(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := bearerToken(c.GetHeader("Authorization"))
		if tokenString == "" {
			tokenString = c.GetHeader("X-Clerk-Session-Token")
		}
		if tokenString == "" && cfg.AllowDevAuth && cfg.DevUserID != "" {
			c.Set(UserIDKey, cfg.DevUserID)
			c.Set(UserRoleKey, cfg.DevUserRole)
			c.Next()
			return
		}
		if cfg.ClerkJWTKey != "" && tokenString != "" {
			publicKey, err := parsePublicKey(cfg.ClerkJWTKey)
			if err == nil {
				token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
					if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
						return nil, jwt.ErrSignatureInvalid
					}
					return publicKey, nil
				}, jwt.WithIssuer(cfg.ClerkIssuer), jwt.WithAudience(cfg.ClerkAudience))

				if err == nil && token.Valid {
					if claims, ok := token.Claims.(jwt.MapClaims); ok {
						if userID, ok := claims["sub"].(string); ok && userID != "" {
							c.Set(UserIDKey, userID)
							if email, ok := claims["email"].(string); ok {
								c.Set(UserEmailKey, email)
							}
							c.Set(UserRoleKey, roleFromClaims(claims))
							c.Next()
							return
						}
					}
				}
			}
		}

		if cfg.AllowDevAuth {
			userID := cfg.DevUserID
			role := cfg.DevUserRole
			if tokenString != "" && strings.HasPrefix(tokenString, "user_") {
				userID = tokenString
			}
			if userID == "" {
				userID = "user_dev"
			}
			if role == "" {
				role = "investisseur"
			}
			c.Set(UserIDKey, userID)
			c.Set(UserRoleKey, role)
			c.Next()
			return
		}

		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": gin.H{"message": "Authentication required"}})
	}
}

func bearerToken(value string) string {
	const prefix = "Bearer "
	if strings.HasPrefix(value, prefix) { return strings.TrimSpace(strings.TrimPrefix(value, prefix)) }
	return ""
}

func parsePublicKey(value string) (*rsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(value))
	if block == nil { return nil, jwt.ErrInvalidKey }
	return jwt.ParseRSAPublicKeyFromPEM(pem.EncodeToMemory(block))
}

func roleFromClaims(claims jwt.MapClaims) string {
	if metadata, ok := claims["public_metadata"].(map[string]any); ok {
		if role, ok := metadata["role"].(string); ok { return role }
	}
	// Never trust Clerk unsafe metadata: it is user-controlled and could grant
	// moderator/admin privileges. Roles must come from public metadata managed
	// by an administrator (or a server-side JWT template claim).
	if role, ok := claims["role"].(string); ok { return role }
	return "investisseur"
}
