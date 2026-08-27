package ports

import (
	"context"

	"github.com/zira-invest/backend/internal/domain"
)

type UserRepository interface {
	UpsertFromClerk(ctx context.Context, id, email, name, role string) (domain.User, error)
	GetUser(ctx context.Context, id string) (domain.User, error)
	UpdateProfile(ctx context.Context, id string, input map[string]any) (domain.User, error)
	ListUsers(ctx context.Context) ([]domain.User, error)
	UpdateUserStatus(ctx context.Context, id, status string) (domain.User, error)
}

type ProjectRepository interface {
	ListPublicProjects(ctx context.Context) ([]domain.Project, error)
	ListAllProjects(ctx context.Context) ([]domain.Project, error)
	ListOwnerProjects(ctx context.Context, ownerID string) ([]domain.Project, error)
	GetProject(ctx context.Context, id string) (domain.Project, error)
	CreateProject(ctx context.Context, ownerID string, input domain.Project) (domain.Project, error)
	UpdateProject(ctx context.Context, ownerID, id string, input domain.Project) (domain.Project, error)
	SubmitProject(ctx context.Context, ownerID, id string) (domain.Project, error)
	ModerateProject(ctx context.Context, id, status string) (domain.Project, error)
}

type InvestmentRepository interface {
	CreateInvestment(ctx context.Context, investorID, projectID string, amount, equity float64) (domain.Investment, error)
	ListInvestorInvestments(ctx context.Context, investorID string) ([]domain.Investment, error)
	ListProjectInvestments(ctx context.Context, projectID string) ([]domain.Investment, error)
}

type KYCRepository interface {
	CreateKYC(ctx context.Context, userID string, document domain.KYCDocument) (domain.KYCRequest, error)
	GetKYCForUser(ctx context.Context, userID string) (domain.KYCRequest, error)
	ListKYC(ctx context.Context, status string) ([]domain.KYCRequest, error)
	DecideKYC(ctx context.Context, moderatorID, id string, approved bool, reason string) (domain.KYCRequest, error)
}

type NotificationRepository interface {
	ListNotifications(ctx context.Context, userID string) ([]domain.Notification, error)
	MarkNotificationRead(ctx context.Context, userID, id string) error
	DeleteNotification(ctx context.Context, userID, id string) error
	ClearNotifications(ctx context.Context, userID string) error
}

type EmailSender interface {
	SendKYCDecision(ctx context.Context, to, name string, approved bool, reason string) error
}

type FileStorage interface { PresignPut(ctx context.Context, key, contentType string) (string, string, error) }
