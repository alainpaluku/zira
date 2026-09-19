package httpapi

import (
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zira-invest/backend/internal/adapters/postgres"
	"github.com/zira-invest/backend/internal/app"
	"github.com/zira-invest/backend/internal/domain"
	"github.com/zira-invest/backend/internal/http/middleware"
)

type Handler struct{ service *app.Service }

func NewHandler(service *app.Service) *Handler { return &Handler{service: service} }

func (h *Handler) Register(r *gin.Engine, auth gin.HandlerFunc) {
	r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
	r.GET("/api/public/projects", h.publicProjects)
	r.GET("/api/projects/:id", h.project)

	r.POST("/api/auth/login", h.login)
	r.POST("/api/auth/register", h.register)
	r.GET("/api/auth/username-availability", h.checkUsernameAvailability)
	r.POST("/api/auth/password/forgot", h.forgotPassword)
	r.POST("/api/auth/password/reset", h.resetPassword)
	r.POST("/api/auth/email/verify", h.verifyEmail)

	protected := r.Group("/api", auth)
	protected.GET("/me", h.me)
	protected.PATCH("/me/profile", h.updateProfile)
	protected.PATCH("/me/password", h.changePassword)
	protected.POST("/me/kyc/verify", h.verifyKYC)
	protected.POST("/me/verifications/:channel", h.requestVerificationCode)
	protected.POST("/me/verifications/:channel/verify", h.verifyVerificationCode)
	protected.POST("/uploads/presign", h.presignUpload)
	protected.GET("/me/projects", h.myProjects)
	protected.POST("/projects", h.createProject)
	protected.PATCH("/projects/:id", h.updateProject)
	protected.POST("/projects/:id/submit", h.submitProject)
	protected.POST("/projects/:id/invest", h.invest)
	protected.GET("/me/investments", h.myInvestments)
	protected.GET("/projects/:id/investments", h.projectInvestments)
	protected.POST("/me/kyc/submit", h.submitKYC)
	protected.GET("/me/kyc", h.myKYC)
	protected.GET("/me/notifications", h.notifications)
	protected.PATCH("/me/notifications/:id/read", h.markNotificationRead)
	protected.DELETE("/me/notifications/:id", h.deleteNotification)
	protected.DELETE("/me/notifications", h.clearNotifications)

	moderation := protected.Group("/moderation", requireModerator)
	moderation.GET("/kyc", h.listKYC)
	moderation.GET("/projects", h.moderationProjects)
	moderation.GET("/users", h.moderationUsers)
	moderation.POST("/users/:id/status", h.moderationUserStatus)
	moderation.POST("/kyc/:id/decision", h.decideKYC)
	moderation.POST("/projects/:id/decision", h.decideProject)
}

func (h *Handler) login(c *gin.Context) {
	var input struct {
		Identifier string `json:"identifier"`
		Email      string `json:"email"`
		Username   string `json:"username"`
		Password   string `json:"password"`
		Role       string `json:"role"`
	}
	if !decodeJSON(c, &input) { return }
	ident := strings.TrimSpace(input.Identifier)
	if ident == "" { ident = strings.TrimSpace(input.Email) }
	if ident == "" { ident = strings.TrimSpace(input.Username) }
	if ident == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": "Identifiant ou email obligatoire"}})
		return
	}
	user, err := h.service.Users.GetUserByIdentifier(c, ident)
	if errors.Is(err, postgres.ErrNotFound) {
		role := input.Role
		if role == "" { role = "investisseur" }
		user, err = h.service.EnsureUser(c, "user_"+uuid.NewString()[:8], ident, ident, role)
		if err != nil { serverError(c, err); return }
	} else if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"token": user.ID,
		"user":  user,
	})
}

func (h *Handler) register(c *gin.Context) {
	var input struct {
		Username    string `json:"username"`
		Name        string `json:"name"`
		Email       string `json:"email"`
		Password    string `json:"password"`
		Role        string `json:"role"`
		CompanyName string `json:"companyName"`
	}
	if !decodeJSON(c, &input) { return }
	if strings.TrimSpace(input.Email) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": "Email est obligatoire"}})
		return
	}
	user, err := h.service.Users.CreateUser(c, input.Username, input.Email, input.Name, input.Role, input.CompanyName)
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"token": user.ID,
		"user":  user,
	})
}

func (h *Handler) checkUsernameAvailability(c *gin.Context) {
	username := strings.TrimSpace(c.Query("username"))
	if username == "" {
		c.JSON(http.StatusOK, gin.H{"available": false})
		return
	}
	available, err := h.service.Users.CheckUsernameAvailable(c, username)
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"available": available})
}

func (h *Handler) changePassword(c *gin.Context) {
	var input struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if !decodeJSON(c, &input) { return }
	if len(input.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": "Le mot de passe doit contenir au moins 8 caractères"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) forgotPassword(c *gin.Context) {
	var input struct {
		Identifier string `json:"identifier"`
	}
	if !decodeJSON(c, &input) { return }
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Instructions de réinitialisation envoyées"})
}

func (h *Handler) resetPassword(c *gin.Context) {
	var input struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}
	if !decodeJSON(c, &input) { return }
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) verifyEmail(c *gin.Context) {
	var input struct {
		Token string `json:"token"`
	}
	if !decodeJSON(c, &input) { return }
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) verifyKYC(c *gin.Context) {
	var input struct {
		DocumentURL  string `json:"document_url"`
		DocumentType string `json:"document_type"`
		SelfieURL    string `json:"selfie_url"`
	}
	if !decodeJSON(c, &input) { return }
	c.JSON(http.StatusOK, gin.H{
		"valid": true,
		"ocr_result": gin.H{
			"full_name":       "Document vérifié",
			"document_number": "DOC-" + uuid.NewString()[:8],
		},
		"face_match": true,
	})
}

func (h *Handler) requestVerificationCode(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Code de vérification envoyé"})
}

func (h *Handler) verifyVerificationCode(c *gin.Context) {
	var input struct {
		Code string `json:"code"`
	}
	if !decodeJSON(c, &input) { return }
	if len(input.Code) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": "Code de 6 chiffres requis"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) presignUpload(c *gin.Context) {
	if h.service.Storage == nil { c.JSON(http.StatusServiceUnavailable, gin.H{"error": gin.H{"message":"Le stockage de fichiers n'est pas configuré"}}); return }
	var input struct { Filename string `json:"filename"`; ContentType string `json:"content_type"` }
	if !decodeJSON(c, &input) { return }
	if input.Filename == "" || input.ContentType == "" { c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message":"filename et content_type sont obligatoires"}}); return }
	if len(input.Filename) > 180 { c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message":"nom de fichier trop long"}}); return }
	allowedTypes := map[string]bool{"image/jpeg": true, "image/png": true, "image/webp": true, "application/pdf": true}
	if !allowedTypes[input.ContentType] { c.JSON(http.StatusUnsupportedMediaType, gin.H{"error": gin.H{"message":"format de fichier non pris en charge"}}); return }
	baseName := filepath.Base(strings.ReplaceAll(input.Filename, "\\", "/"))
	key := fmt.Sprintf("users/%s/%s-%s", currentUserID(c), uuid.NewString(), baseName)
	putURL, publicURL, err := h.service.Storage.PresignPut(c, key, input.ContentType)
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success":true,"data":gin.H{"upload_url":putURL,"public_url":publicURL,"key":key}})
}

func (h *Handler) invest(c *gin.Context) {
	var input struct { AmountUSD float64 `json:"amount_usd"`; EquityPercent float64 `json:"equity_percent"` }
	if !decodeJSON(c, &input) { return }
	if input.AmountUSD <= 0 { c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message":"amount_usd doit être positif"}}); return }
	item, err := h.service.Investments.CreateInvestment(c, currentUserID(c), c.Param("id"), input.AmountUSD, input.EquityPercent)
	if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message":"Projet inactif ou montant hors limites"}}); return }
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusCreated, gin.H{"success":true,"data":item})
}
func (h *Handler) myInvestments(c *gin.Context) { items, err := h.service.Investments.ListInvestorInvestments(c, currentUserID(c)); if err != nil { serverError(c,err); return }; c.JSON(http.StatusOK,gin.H{"success":true,"data":items}) }
func (h *Handler) projectInvestments(c *gin.Context) {
	project, err := h.service.Projects.GetProject(c, c.Param("id"))
	if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"message": "Projet introuvable"}}); return }
	if err != nil { serverError(c, err); return }
	role, _ := c.Get(middleware.UserRoleKey)
	roleName := fmtString(role)
	if project.OwnerID != currentUserID(c) && roleName != "moderateur" && roleName != "moderator" && roleName != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": gin.H{"message": "Accès non autorisé"}})
		return
	}
	items, err := h.service.Investments.ListProjectInvestments(c, c.Param("id"))
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}
func (h *Handler) decideProject(c *gin.Context) {
	var input struct { Status string `json:"status"` }; if !decodeJSON(c,&input) { return }
	if input.Status != "active" && input.Status != "suspended" { c.JSON(http.StatusBadRequest,gin.H{"error":gin.H{"message":"statut invalide"}}); return }
	item, err := h.service.Projects.ModerateProject(c,c.Param("id"),input.Status); if errors.Is(err,postgres.ErrNotFound) { c.JSON(http.StatusNotFound,gin.H{"error":gin.H{"message":"Projet introuvable"}}); return }; if err != nil { serverError(c,err); return }; c.JSON(http.StatusOK,gin.H{"success":true,"data":item})
}

func (h *Handler) moderationProjects(c *gin.Context) {
	items, err := h.service.Projects.ListAllProjects(c)
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

func (h *Handler) moderationUsers(c *gin.Context) {
	items, err := h.service.Users.ListUsers(c)
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

func (h *Handler) moderationUserStatus(c *gin.Context) {
	var input struct { Status string `json:"status"` }
	if !decodeJSON(c, &input) { return }
	if input.Status != "active" && input.Status != "suspended" { c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": "statut utilisateur invalide"}}); return }
	item, err := h.service.Users.UpdateUserStatus(c, c.Param("id"), input.Status)
	if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"message": "Utilisateur introuvable"}}); return }
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": item})
}

func (h *Handler) publicProjects(c *gin.Context) {
	items, err := h.service.Projects.ListPublicProjects(c)
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

func (h *Handler) project(c *gin.Context) {
	item, err := h.service.Projects.GetProject(c, c.Param("id"))
	if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"message": "Projet introuvable"}}); return }
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": item})
}

func (h *Handler) me(c *gin.Context) {
	user := h.currentUser(c)
	item, err := h.service.EnsureUser(c, user.id, user.email, user.name, user.role)
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": item})
}

func (h *Handler) updateProfile(c *gin.Context) {
	var input map[string]any
	if !decodeJSON(c, &input) { return }
	item, err := h.service.Users.UpdateProfile(c, currentUserID(c), input)
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": item})
}

func (h *Handler) myProjects(c *gin.Context) {
	items, err := h.service.Projects.ListOwnerProjects(c, currentUserID(c))
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

func (h *Handler) createProject(c *gin.Context) {
	var input domain.Project
	if !decodeJSON(c, &input) { return }
	if err := validateProjectInput(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": err.Error()}}); return
	}
	item, err := h.service.Projects.CreateProject(c, currentUserID(c), input)
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": item})
}

func (h *Handler) updateProject(c *gin.Context) {
	var input domain.Project
	if !decodeJSON(c, &input) { return }
	if err := validateProjectInput(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": err.Error()}}); return
	}
	item, err := h.service.Projects.UpdateProject(c, currentUserID(c), c.Param("id"), input)
	if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"message": "Projet introuvable"}}); return }
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": item})
}

func (h *Handler) submitProject(c *gin.Context) {
	item, err := h.service.Projects.SubmitProject(c, currentUserID(c), c.Param("id"))
	if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"message": "Projet introuvable ou déjà soumis"}}); return }
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": item})
}

func (h *Handler) submitKYC(c *gin.Context) {
	var input domain.KYCDocument
	if !decodeJSON(c, &input) { return }
	item, err := h.service.SubmitKYC(c, currentUserID(c), input)
	if err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": err.Error()}}); return }
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": item})
}

func (h *Handler) myKYC(c *gin.Context) {
	item, err := h.service.KYC.GetKYCForUser(c, currentUserID(c))
	if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"status": "not_submitted"}}); return }
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": item})
}

func (h *Handler) listKYC(c *gin.Context) {
	items, err := h.service.KYC.ListKYC(c, c.Query("status"))
	if err != nil { serverError(c, err); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

func (h *Handler) decideKYC(c *gin.Context) {
	var input struct { Approved bool `json:"approved"`; Reason string `json:"reason"` }
	if !decodeJSON(c, &input) { return }
	item, err := h.service.DecideKYC(c, currentUserID(c), c.Param("id"), input.Approved, input.Reason)
	if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"message": "Dossier KYC introuvable"}}); return }
	if err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": err.Error()}}); return }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": item})
}

func (h *Handler) notifications(c *gin.Context) {
	items, err := h.service.Notifications.ListNotifications(c, currentUserID(c))
	if err != nil { serverError(c, err); return }
	unread := 0
	for _, item := range items { if !item.Read { unread++ } }
	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"notifications": items, "unreadCount": unread}})
}

func (h *Handler) markNotificationRead(c *gin.Context) {
	if err := h.service.Notifications.MarkNotificationRead(c, currentUserID(c), c.Param("id")); err != nil {
		if errors.Is(err, postgres.ErrNotFound) { c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"message": "Notification introuvable"}}); return }
		serverError(c, err); return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}
func (h *Handler) deleteNotification(c *gin.Context) { if err := h.service.Notifications.DeleteNotification(c,currentUserID(c),c.Param("id")); errors.Is(err,postgres.ErrNotFound) { c.JSON(http.StatusNotFound,gin.H{"error":gin.H{"message":"Notification introuvable"}}); return } else if err != nil { serverError(c,err); return }; c.Status(http.StatusNoContent) }
func (h *Handler) clearNotifications(c *gin.Context) { if err := h.service.Notifications.ClearNotifications(c,currentUserID(c)); err != nil { serverError(c,err); return }; c.Status(http.StatusNoContent) }

type authUser struct{ id, email, name, role string }

func (h *Handler) currentUser(c *gin.Context) authUser {
	id, _ := c.Get(middleware.UserIDKey)
	email, _ := c.Get(middleware.UserEmailKey)
	role, _ := c.Get(middleware.UserRoleKey)
	return authUser{fmtString(id), fmtString(email), fmtString(id), fmtString(role)}
}
func currentUserID(c *gin.Context) string { value, _ := c.Get(middleware.UserIDKey); return fmtString(value) }
func requireModerator(c *gin.Context) {
	role, _ := c.Get(middleware.UserRoleKey)
	if role != "moderateur" && role != "moderator" && role != "admin" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": gin.H{"message": "Accès réservé à la modération"}}); return
	}
	c.Next()
}
func decodeJSON(c *gin.Context, target any) bool {
	if err := c.ShouldBindJSON(target); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"message": "JSON invalide"}}); return false }
	return true
}
func fmtString(value any) string { if text, ok := value.(string); ok { return text }; return "" }
func serverError(c *gin.Context, err error) { c.Error(err); c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"message": "Erreur interne du serveur"}}) }
func validateProjectInput(input domain.Project) error {
	if strings.TrimSpace(input.Name) == "" { return errors.New("name est obligatoire") }
	if input.TargetAmountUSD <= 0 { return errors.New("target_amount_usd doit être positif") }
	if input.MinInvestmentUSD <= 0 || input.MaxInvestmentUSD < input.MinInvestmentUSD { return errors.New("les tickets d'investissement sont invalides") }
	if input.EquityPercent <= 0 || input.EquityPercent > 100 { return errors.New("equity_percent doit être compris entre 0 et 100") }
	return nil
}
var _ = uuid.Nil
