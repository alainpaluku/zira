package httpapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/zira-invest/backend/internal/adapters/postgres"
	"github.com/zira-invest/backend/internal/app"
	"github.com/zira-invest/backend/internal/domain"
	"github.com/zira-invest/backend/internal/http/middleware"
)

func TestHealthEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &app.Service{}
	handler := NewHandler(service)

	router := gin.New()
	handler.Register(router, func(c *gin.Context) { c.Next() })

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/health", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"status":"ok"`)
}

func TestSecurityHeadersMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(middleware.SecurityHeaders())
	router.GET("/test", func(c *gin.Context) { c.String(http.StatusOK, "ok") })

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, "nosniff", w.Header().Get("X-Content-Type-Options"))
	assert.Equal(t, "DENY", w.Header().Get("X-Frame-Options"))
}

type mockUserRepo struct {
	users map[string]domain.User
}

func (m *mockUserRepo) UpsertFromClerk(ctx context.Context, id, email, name, role string) (domain.User, error) {
	u := domain.User{ID: id, Email: email, DisplayName: name, Role: domain.Role(role)}
	m.users[id] = u
	return u, nil
}
func (m *mockUserRepo) GetUser(ctx context.Context, id string) (domain.User, error) {
	if u, ok := m.users[id]; ok { return u, nil }
	return domain.User{}, postgres.ErrNotFound
}
func (m *mockUserRepo) GetUserByIdentifier(ctx context.Context, identifier string) (domain.User, error) {
	for _, u := range m.users {
		if u.Email == identifier || u.Username == identifier || u.ID == identifier {
			return u, nil
		}
	}
	return domain.User{}, postgres.ErrNotFound
}
func (m *mockUserRepo) CreateUser(ctx context.Context, username, email, name, role, companyName string) (domain.User, error) {
	u := domain.User{ID: "user_123", Username: username, Email: email, DisplayName: name, Role: domain.Role(role)}
	m.users[u.ID] = u
	return u, nil
}
func (m *mockUserRepo) CheckUsernameAvailable(ctx context.Context, username string) (bool, error) {
	for _, u := range m.users {
		if u.Username == username { return false, nil }
	}
	return true, nil
}
func (m *mockUserRepo) UpdateProfile(ctx context.Context, id string, input map[string]any) (domain.User, error) {
	return domain.User{}, nil
}
func (m *mockUserRepo) ListUsers(ctx context.Context) ([]domain.User, error) { return nil, nil }
func (m *mockUserRepo) UpdateUserStatus(ctx context.Context, id, status string) (domain.User, error) {
	return domain.User{}, nil
}

func TestAuthEndpoints(t *testing.T) {
	gin.SetMode(gin.TestMode)
	repo := &mockUserRepo{users: make(map[string]domain.User)}
	service := &app.Service{Users: repo}
	handler := NewHandler(service)

	router := gin.New()
	handler.Register(router, func(c *gin.Context) {
		c.Set(middleware.UserIDKey, "user_123")
		c.Set(middleware.UserRoleKey, "investisseur")
		c.Next()
	})

	// Test Username Availability
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/auth/username-availability?username=newuser", nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"available":true`)

	// Test Registration
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/api/auth/register", strings.NewReader(`{"username":"testuser","email":"test@zira.cd","name":"Test User","role":"investisseur"}`))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)
	assert.Contains(t, w.Body.String(), `"user"`)

	// Test Login
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/api/auth/login", strings.NewReader(`{"identifier":"test@zira.cd"}`))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"token"`)

	// Test Verification Code
	w = httptest.NewRecorder()
	req, _ = http.NewRequest(http.MethodPost, "/api/me/verifications/email/verify", strings.NewReader(`{"code":"123456"}`))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"success":true`)
}
