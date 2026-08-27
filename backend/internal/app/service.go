package app

import (
	"context"
	"errors"
	"strings"

	"github.com/zira-invest/backend/internal/domain"
	"github.com/zira-invest/backend/internal/ports"
)

type Service struct {
	Users         ports.UserRepository
	Projects      ports.ProjectRepository
	KYC           ports.KYCRepository
	Notifications ports.NotificationRepository
	Investments ports.InvestmentRepository
	Email         ports.EmailSender
	Storage       ports.FileStorage
}

func (s *Service) EnsureUser(ctx context.Context, id, email, name, role string) (domain.User, error) {
	return s.Users.UpsertFromClerk(ctx, id, email, name, normalizeRole(role))
}

func (s *Service) SubmitKYC(ctx context.Context, userID string, document domain.KYCDocument) (domain.KYCRequest, error) {
	if strings.TrimSpace(document.Type) == "" || strings.TrimSpace(document.URL) == "" {
		return domain.KYCRequest{}, errors.New("document_type and document_url are required")
	}
	if len(document.URL) > 8_000_000 || len(document.BackURL) > 8_000_000 || len(document.SelfieURL) > 8_000_000 {
		return domain.KYCRequest{}, errors.New("document payload is too large")
	}
	return s.KYC.CreateKYC(ctx, userID, document)
}

func (s *Service) DecideKYC(ctx context.Context, moderatorID, id string, approved bool, reason string) (domain.KYCRequest, error) {
	if !approved && len(strings.TrimSpace(reason)) < 10 {
		return domain.KYCRequest{}, errors.New("a rejection reason of at least 10 characters is required")
	}
	request, err := s.KYC.DecideKYC(ctx, moderatorID, id, approved, strings.TrimSpace(reason))
	if err != nil { return domain.KYCRequest{}, err }
	if s.Email != nil {
		_ = s.Email.SendKYCDecision(ctx, request.UserEmail, request.UserName, approved, reason)
	}
	return request, nil
}

func normalizeRole(role string) string {
	switch role {
	case "porteur", "project_owner": return "porteur"
	case "moderateur", "moderator": return "moderateur"
	case "admin": return "admin"
	default: return "investisseur"
	}
}
