package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/zira-invest/backend/internal/domain"
	_ "github.com/jackc/pgx/v5/stdlib"
)

var ErrNotFound = errors.New("resource not found")

type Store struct{ db *sql.DB }

func Open(ctx context.Context, dsn string) (*Store, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}
	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}
	return &Store{db: db}, nil
}

func (s *Store) Close() error { return s.db.Close() }

func (s *Store) UpsertFromClerk(ctx context.Context, id, email, name, role string) (domain.User, error) {
	if role == "" {
		role = string(domain.RoleInvestor)
	}
	const query = `
		INSERT INTO users (clerk_id, email, display_name, username, role)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (clerk_id) DO UPDATE SET
			email = NULLIF(EXCLUDED.email, ''),
			display_name = NULLIF(EXCLUDED.display_name, ''),
			updated_at = NOW()
		RETURNING clerk_id, email, username, display_name, role, status, kyc_status,
			title, bio, avatar_url, company_name, phone, country, city, profile_extras, created_at`
	return scanUser(s.db.QueryRowContext(ctx, query, id, email, name, usernameFromEmail(email, id), role))
}

func (s *Store) GetUser(ctx context.Context, id string) (domain.User, error) {
	return scanUser(s.db.QueryRowContext(ctx, `
		SELECT clerk_id, email, username, display_name, role, status, kyc_status,
			title, bio, avatar_url, company_name, phone, country, city, profile_extras, created_at
		FROM users WHERE clerk_id = $1`, id))
}

func (s *Store) GetUserByIdentifier(ctx context.Context, identifier string) (domain.User, error) {
	clean := strings.TrimSpace(strings.ToLower(identifier))
	return scanUser(s.db.QueryRowContext(ctx, `
		SELECT clerk_id, email, username, display_name, role, status, kyc_status,
			title, bio, avatar_url, company_name, phone, country, city, profile_extras, created_at
		FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1 OR clerk_id = $1`, clean))
}

func (s *Store) CreateUser(ctx context.Context, username, email, name, role, companyName string) (domain.User, error) {
	id := "user_" + uuid.NewString()
	cleanUsername := strings.TrimSpace(strings.ToLower(username))
	cleanEmail := strings.TrimSpace(strings.ToLower(email))
	if cleanUsername == "" {
		cleanUsername = usernameFromEmail(cleanEmail, id)
	}
	if name == "" {
		name = cleanUsername
	}
	if role == "" {
		role = "investisseur"
	}

	const query = `
		INSERT INTO users (clerk_id, email, username, display_name, role, company_name)
		VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''))
		RETURNING clerk_id, email, username, display_name, role, status, kyc_status,
			title, bio, avatar_url, company_name, phone, country, city, profile_extras, created_at`
	return scanUser(s.db.QueryRowContext(ctx, query, id, cleanEmail, cleanUsername, name, role, companyName))
}

func (s *Store) CheckUsernameAvailable(ctx context.Context, username string) (bool, error) {
	clean := strings.TrimSpace(strings.ToLower(username))
	if clean == "" {
		return false, nil
	}
	var exists bool
	err := s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(username) = $1)`, clean).Scan(&exists)
	return !exists, err
}

func (s *Store) ListUsers(ctx context.Context) ([]domain.User, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT clerk_id, email, username, display_name, role, status, kyc_status,
		title, bio, avatar_url, company_name, phone, country, city, profile_extras, created_at
		FROM users ORDER BY created_at DESC`)
	if err != nil { return nil, err }
	defer rows.Close()
	result := make([]domain.User, 0)
	for rows.Next() {
		user, scanErr := scanUser(rows)
		if scanErr != nil { return nil, scanErr }
		result = append(result, user)
	}
	return result, rows.Err()
}

func (s *Store) UpdateUserStatus(ctx context.Context, id, status string) (domain.User, error) {
	return scanUser(s.db.QueryRowContext(ctx, `UPDATE users SET status=$2, updated_at=NOW()
		WHERE clerk_id=$1
		RETURNING clerk_id, email, username, display_name, role, status, kyc_status,
		title, bio, avatar_url, company_name, phone, country, city, profile_extras, created_at`, id, status))
}

func (s *Store) UpdateProfile(ctx context.Context, id string, input map[string]any) (domain.User, error) {
	const query = `
		UPDATE users SET display_name = COALESCE($2, display_name),
			title = COALESCE($3, title), bio = COALESCE($4, bio),
			avatar_url = COALESCE($5, avatar_url), company_name = COALESCE($6, company_name),
			phone = COALESCE($7, phone), country = COALESCE($8, country),
			city = COALESCE($9, city), profile_extras = profile_extras || COALESCE($10::jsonb, '{}'::jsonb), updated_at = NOW()
		WHERE clerk_id = $1
		RETURNING clerk_id, email, username, display_name, role, status, kyc_status,
			 title, bio, avatar_url, company_name, phone, country, city, profile_extras, created_at`
	return scanUser(s.db.QueryRowContext(ctx, query, id,
		stringValue(input["display_name"]), stringValue(input["title"]), stringValue(input["bio"]),
		stringValue(input["avatar_url"]), stringValue(input["company_name"]), stringValue(input["phone"]),
		stringValue(input["country"]), stringValue(input["city"]), jsonValue(input["profile_extras"])))
}

func (s *Store) ListPublicProjects(ctx context.Context) ([]domain.Project, error) {
	return s.listProjects(ctx, `WHERE status = 'active'`)
}

func (s *Store) ListAllProjects(ctx context.Context) ([]domain.Project, error) {
	return s.listProjects(ctx, "")
}

func (s *Store) ListOwnerProjects(ctx context.Context, ownerID string) ([]domain.Project, error) {
	return s.listProjects(ctx, `WHERE owner_id = $1`, ownerID)
}

func (s *Store) listProjects(ctx context.Context, where string, args ...any) ([]domain.Project, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, owner_id, name, short_description, full_description,
		sector, target_market, stage, country, city, team, video_url, logo_url, poster_url,
		target_amount_usd, min_investment_usd, max_investment_usd, equity_percent,
		raised_amount_usd, status, created_at FROM projects `+where+` ORDER BY created_at DESC`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.Project
	for rows.Next() {
		project, err := scanProject(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, project)
	}
	return result, rows.Err()
}

func (s *Store) GetProject(ctx context.Context, id string) (domain.Project, error) {
	return scanProject(s.db.QueryRowContext(ctx, `SELECT id, owner_id, name, short_description, full_description,
		sector, target_market, stage, country, city, team, video_url, logo_url, poster_url,
		target_amount_usd, min_investment_usd, max_investment_usd, equity_percent,
		raised_amount_usd, status, created_at FROM projects WHERE id = $1`, id))
}

func (s *Store) CreateProject(ctx context.Context, ownerID string, input domain.Project) (domain.Project, error) {
	id := "proj_" + uuid.NewString()
	return scanProject(s.db.QueryRowContext(ctx, `INSERT INTO projects
		(id, owner_id, name, short_description, full_description, sector, target_market, stage, country, city, team,
		video_url, logo_url, poster_url, target_amount_usd, min_investment_usd, max_investment_usd, equity_percent)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,$18)
		RETURNING id, owner_id, name, short_description, full_description, sector, target_market, stage, country, city, team,
		video_url, logo_url, poster_url, target_amount_usd, min_investment_usd, max_investment_usd, equity_percent,
		raised_amount_usd, status, created_at`,
		id, ownerID, input.Name, input.ShortDescription, input.FullDescription, input.Sector,
		input.TargetMarket, input.Stage, input.Country, input.City, jsonArrayValue(input.Team), input.VideoURL, input.LogoURL,
		input.PosterURL, input.TargetAmountUSD, input.MinInvestmentUSD, input.MaxInvestmentUSD, input.EquityPercent))
}

func (s *Store) UpdateProject(ctx context.Context, ownerID, id string, input domain.Project) (domain.Project, error) {
	return scanProject(s.db.QueryRowContext(ctx, `UPDATE projects SET
		name=$3, short_description=$4, full_description=$5, sector=$6, target_market=$7, stage=$8,
		country=$9, city=$10, team=$11::jsonb, video_url=$12, logo_url=$13, poster_url=$14, target_amount_usd=$15,
		min_investment_usd=$16, max_investment_usd=$17, equity_percent=$18, updated_at=NOW()
		WHERE id=$2 AND owner_id=$1
		RETURNING id, owner_id, name, short_description, full_description, sector, target_market, stage, country, city, team,
		video_url, logo_url, poster_url, target_amount_usd, min_investment_usd, max_investment_usd, equity_percent,
		raised_amount_usd, status, created_at`,
		ownerID, id, input.Name, input.ShortDescription, input.FullDescription, input.Sector, input.TargetMarket,
		input.Stage, input.Country, input.City, jsonArrayValue(input.Team), input.VideoURL, input.LogoURL, input.PosterURL,
		input.TargetAmountUSD, input.MinInvestmentUSD, input.MaxInvestmentUSD, input.EquityPercent))
}

func (s *Store) SubmitProject(ctx context.Context, ownerID, id string) (domain.Project, error) {
	return scanProject(s.db.QueryRowContext(ctx, `UPDATE projects SET status='pending', updated_at=NOW()
		WHERE id=$2 AND owner_id=$1 AND status IN ('draft','suspended')
		RETURNING id, owner_id, name, short_description, full_description, sector, target_market, stage, country, city, team,
		video_url, logo_url, poster_url, target_amount_usd, min_investment_usd, max_investment_usd, equity_percent,
		raised_amount_usd, status, created_at`, ownerID, id))
}

func (s *Store) ModerateProject(ctx context.Context, id, status string) (domain.Project, error) {
	return scanProject(s.db.QueryRowContext(ctx, `UPDATE projects SET status=$2, updated_at=NOW()
		WHERE id=$1 AND status IN ('pending','active','suspended')
		RETURNING id, owner_id, name, short_description, full_description, sector, target_market, stage, country, city, team,
		video_url, logo_url, poster_url, target_amount_usd, min_investment_usd, max_investment_usd, equity_percent,
		raised_amount_usd, status, created_at`, id, status))
}

func (s *Store) CreateInvestment(ctx context.Context, investorID, projectID string, amount, equity float64) (domain.Investment, error) {
	id := "inv_" + uuid.NewString()
	if amount <= 0 || equity < 0 {
		return domain.Investment{}, fmt.Errorf("investment amount and equity must be valid")
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil { return domain.Investment{}, err }
	defer tx.Rollback()
	// Lock the project row while checking the remaining capacity. This keeps
	// raised_amount_usd and the investment ledger consistent under concurrency.
	var eligible string
	var targetAmount, offeredEquity float64
	if err = tx.QueryRowContext(ctx, `SELECT id, target_amount_usd, equity_percent FROM projects
		WHERE id=$1 AND status='active' AND target_amount_usd > 0
			AND $2 >= min_investment_usd AND $2 <= max_investment_usd
			AND raised_amount_usd + $2 <= target_amount_usd FOR UPDATE`, projectID, amount).Scan(&eligible, &targetAmount, &offeredEquity); errors.Is(err, sql.ErrNoRows) {
		return domain.Investment{}, ErrNotFound
	} else if err != nil { return domain.Investment{}, err }
	// Equity is derived from the signed campaign terms; never trust a value
	// supplied by the browser for ownership calculations.
	equity = amount / targetAmount * offeredEquity
	row := tx.QueryRowContext(ctx, `INSERT INTO investments (id, project_id, investor_id, amount_usd, equity_received, status)
		SELECT $1, $2, $3, $4, $5, 'completed'
		WHERE EXISTS (SELECT 1 FROM users WHERE clerk_id=$3 AND role='investisseur' AND kyc_status='approved')
		RETURNING id, project_id, investor_id, amount_usd, equity_received, status, created_at`, id, eligible, investorID, amount, equity)
	var item domain.Investment
	err = row.Scan(&item.ID,&item.ProjectID,&item.InvestorID,&item.AmountUSD,&item.EquityReceived,&item.Status,&item.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) { return item, ErrNotFound }
	if err != nil { return item, err }
	if _, err = tx.ExecContext(ctx, `UPDATE projects SET raised_amount_usd = raised_amount_usd + $2, updated_at=NOW() WHERE id=$1`, projectID, amount); err != nil { return domain.Investment{}, err }
	if err = tx.Commit(); err != nil { return domain.Investment{}, err }
	return item, nil
}

func (s *Store) ListInvestorInvestments(ctx context.Context, investorID string) ([]domain.Investment, error) {
	return s.listInvestments(ctx, `WHERE investor_id=$1`, investorID)
}
func (s *Store) ListProjectInvestments(ctx context.Context, projectID string) ([]domain.Investment, error) {
	return s.listInvestments(ctx, `WHERE project_id=$1`, projectID)
}
func (s *Store) listInvestments(ctx context.Context, where string, args ...any) ([]domain.Investment, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT i.id,i.project_id,i.investor_id,i.amount_usd,i.equity_received,i.status,i.created_at,
		u.display_name,u.email FROM investments i JOIN users u ON u.clerk_id=i.investor_id `+where+` ORDER BY i.created_at DESC`, args...)
	if err != nil { return nil, err }
	defer rows.Close()
	var result []domain.Investment
	for rows.Next() { var item domain.Investment; if err := rows.Scan(&item.ID,&item.ProjectID,&item.InvestorID,&item.AmountUSD,&item.EquityReceived,&item.Status,&item.CreatedAt,&item.InvestorName,&item.InvestorEmail); err != nil { return nil, err }; result = append(result, item) }
	return result, rows.Err()
}

func (s *Store) CreateKYC(ctx context.Context, userID string, document domain.KYCDocument) (domain.KYCRequest, error) {
	id := "kyc_" + uuid.NewString()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil { return domain.KYCRequest{}, err }
	defer tx.Rollback()
	if _, err = tx.ExecContext(ctx, `UPDATE users SET kyc_status='pending', updated_at=NOW() WHERE clerk_id=$1`, userID); err != nil {
		return domain.KYCRequest{}, err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO kyc_requests
		(id,user_id,document_type,document_number,document_url,document_back_url,selfie_url)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`, id, userID, document.Type, document.Number,
		document.URL, document.BackURL, document.SelfieURL); err != nil {
		return domain.KYCRequest{}, err
	}
	if err = tx.Commit(); err != nil { return domain.KYCRequest{}, err }
	return s.GetKYCByID(ctx, id)
}

func (s *Store) GetKYCForUser(ctx context.Context, userID string) (domain.KYCRequest, error) {
	return s.getKYC(ctx, `WHERE k.user_id=$1 ORDER BY k.submitted_at DESC LIMIT 1`, userID)
}

func (s *Store) ListKYC(ctx context.Context, status string) ([]domain.KYCRequest, error) {
	where, args := "", []any{}
	if status != "" && status != "all" {
		where, args = "WHERE k.status=$1", []any{status}
	}
	rows, err := s.db.QueryContext(ctx, `SELECT k.id,k.user_id,u.display_name,u.email,k.document_type,
		k.document_number,k.document_url,k.document_back_url,k.selfie_url,k.submitted_at,k.status,
		k.rejection_reason,k.decided_at FROM kyc_requests k JOIN users u ON u.clerk_id=k.user_id `+where+
		` ORDER BY k.submitted_at DESC`, args...)
	if err != nil { return nil, err }
	defer rows.Close()
	var result []domain.KYCRequest
	for rows.Next() {
		item, err := scanKYC(rows)
		if err != nil { return nil, err }
		result = append(result, item)
	}
	return result, rows.Err()
}

func (s *Store) GetKYCByID(ctx context.Context, id string) (domain.KYCRequest, error) {
	return s.getKYC(ctx, `WHERE k.id=$1`, id)
}

func (s *Store) getKYC(ctx context.Context, where string, args ...any) (domain.KYCRequest, error) {
	return scanKYC(s.db.QueryRowContext(ctx, `SELECT k.id,k.user_id,u.display_name,u.email,k.document_type,
		k.document_number,k.document_url,k.document_back_url,k.selfie_url,k.submitted_at,k.status,
		k.rejection_reason,k.decided_at FROM kyc_requests k JOIN users u ON u.clerk_id=k.user_id `+where, args...))
}

func (s *Store) DecideKYC(ctx context.Context, moderatorID, id string, approved bool, reason string) (domain.KYCRequest, error) {
	status := "rejected"
	if approved { status = "approved"; reason = "" }
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil { return domain.KYCRequest{}, err }
	defer tx.Rollback()
	var userID string
	if err = tx.QueryRowContext(ctx, `UPDATE kyc_requests SET status=$2, rejection_reason=NULLIF($3,''),
		decided_at=NOW(), decided_by=$4 WHERE id=$1 RETURNING user_id`, id, status, reason, moderatorID).Scan(&userID); err != nil {
		return domain.KYCRequest{}, err
	}
	if _, err = tx.ExecContext(ctx, `UPDATE users SET kyc_status=$2, updated_at=NOW() WHERE clerk_id=$1`, userID, status); err != nil {
		return domain.KYCRequest{}, err
	}
	title := "Dossier KYC refusé"
	message := "Votre dossier KYC a été refusé. Consultez le motif dans votre espace."
	notificationType := "warning"
	if approved {
		title = "Compte certifié KYC"
		message = "Félicitations, vos pièces d’identité ont été validées."
		notificationType = "kyc"
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO notifications
		(id,user_id,universe,title,message,type,action_url)
		VALUES ($1,$2,(SELECT CASE WHEN role='porteur' THEN 'porteur' ELSE 'investisseur' END FROM users WHERE clerk_id=$2),$3,$4,$5,$6)`,
		"notif_"+uuid.NewString(), userID, title, message, notificationType, "/profil"); err != nil {
		return domain.KYCRequest{}, err
	}
	if err = tx.Commit(); err != nil { return domain.KYCRequest{}, err }
	return s.GetKYCByID(ctx, id)
}

func (s *Store) ListNotifications(ctx context.Context, userID string) ([]domain.Notification, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id,user_id,universe,title,message,type,action_url,
		(read_at IS NOT NULL),created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC`, userID)
	if err != nil { return nil, err }
	defer rows.Close()
	var result []domain.Notification
	for rows.Next() {
		var n domain.Notification
		if err := rows.Scan(&n.ID,&n.UserID,&n.Universe,&n.Title,&n.Message,&n.Type,&n.ActionURL,&n.Read,&n.CreatedAt); err != nil { return nil, err }
		result = append(result, n)
	}
	return result, rows.Err()
}

func (s *Store) MarkNotificationRead(ctx context.Context, userID, id string) error {
	result, err := s.db.ExecContext(ctx, `UPDATE notifications SET read_at=NOW() WHERE id=$1 AND user_id=$2`, id, userID)
	if err != nil { return err }
	count, err := result.RowsAffected()
	if err != nil || count == 0 { return ErrNotFound }
	return nil
}

func (s *Store) DeleteNotification(ctx context.Context, userID, id string) error {
	result, err := s.db.ExecContext(ctx, `DELETE FROM notifications WHERE id=$1 AND user_id=$2`, id, userID)
	if err != nil { return err }; count, err := result.RowsAffected(); if err != nil || count == 0 { return ErrNotFound }; return nil
}
func (s *Store) ClearNotifications(ctx context.Context, userID string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM notifications WHERE user_id=$1`, userID); return err
}

func scanUser(row interface{ Scan(...any) error }) (domain.User, error) {
	var u domain.User
	var extras []byte
	err := row.Scan(&u.ID,&u.Email,&u.Username,&u.DisplayName,&u.Role,&u.Status,&u.KYCStatus,&u.Title,&u.Bio,
		&u.AvatarURL,&u.CompanyName,&u.Phone,&u.Country,&u.City,&extras,&u.CreatedAt)
	if len(extras) > 0 { _ = json.Unmarshal(extras, &u.ProfileExtras) }
	if errors.Is(err, sql.ErrNoRows) { return domain.User{}, ErrNotFound }
	return u, err
}

func jsonValue(value any) []byte { if value == nil { return nil }; data, err := json.Marshal(value); if err != nil { return nil }; return data }
func jsonArrayValue(value any) []byte { if value == nil { return []byte("[]") }; data, err := json.Marshal(value); if err != nil { return []byte("[]") }; return data }

func scanProject(row interface{ Scan(...any) error }) (domain.Project, error) {
	var p domain.Project
	var team []byte
	err := row.Scan(&p.ID,&p.OwnerID,&p.Name,&p.ShortDescription,&p.FullDescription,&p.Sector,&p.TargetMarket,
		&p.Stage,&p.Country,&p.City,&team,&p.VideoURL,&p.LogoURL,&p.PosterURL,&p.TargetAmountUSD,&p.MinInvestmentUSD,
		&p.MaxInvestmentUSD,&p.EquityPercent,&p.RaisedAmountUSD,&p.Status,&p.CreatedAt)
	if len(team) > 0 { _ = json.Unmarshal(team, &p.Team) }
	if errors.Is(err, sql.ErrNoRows) { return domain.Project{}, ErrNotFound }
	return p, err
}

func scanKYC(row interface{ Scan(...any) error }) (domain.KYCRequest, error) {
	var k domain.KYCRequest
	err := row.Scan(&k.ID,&k.UserID,&k.UserName,&k.UserEmail,&k.Document.Type,&k.Document.Number,&k.Document.URL,
		&k.Document.BackURL,&k.Document.SelfieURL,&k.SubmittedAt,&k.Status,&k.RejectionReason,&k.DecidedAt)
	if errors.Is(err, sql.ErrNoRows) { return domain.KYCRequest{}, ErrNotFound }
	return k, err
}

func stringValue(value any) *string {
	if value == nil { return nil }
	text, ok := value.(string)
	if !ok || strings.TrimSpace(text) == "" { return nil }
	return &text
}

func usernameFromEmail(email, fallback string) string {
	if at := strings.Index(email, "@"); at > 0 { return strings.ToLower(email[:at]) }
	return fallback
}

var _ = time.Time{}
