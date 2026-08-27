package domain

import "time"

type Role string

const (
	RoleInvestor  Role = "investisseur"
	RoleOwner     Role = "porteur"
	RoleModerator Role = "moderateur"
	RoleAdmin     Role = "admin"
)

type User struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	Role        Role      `json:"role"`
	Status      string    `json:"status"`
	KYCStatus   string    `json:"kyc_status"`
	Title       *string   `json:"title,omitempty"`
	Bio         *string   `json:"bio,omitempty"`
	AvatarURL   *string   `json:"avatar_url,omitempty"`
	CompanyName *string   `json:"company_name,omitempty"`
	Phone       *string   `json:"phone,omitempty"`
	Country     *string   `json:"country,omitempty"`
	City        *string   `json:"city,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	ProfileExtras map[string]any `json:"profile_extras,omitempty"`
}

type Project struct {
	ID                string    `json:"id"`
	OwnerID           string    `json:"owner_id"`
	Name              string    `json:"name"`
	ShortDescription  string    `json:"short_description"`
	FullDescription   string    `json:"full_description"`
	Sector            string    `json:"sector"`
	TargetMarket      string    `json:"target_market"`
	Stage             string    `json:"stage"`
	Country           string    `json:"country"`
	City              string    `json:"city"`
	Team              []TeamMember `json:"team"`
	VideoURL          *string   `json:"video_url,omitempty"`
	LogoURL           *string   `json:"logo_url,omitempty"`
	PosterURL         *string   `json:"poster_url,omitempty"`
	TargetAmountUSD   float64   `json:"target_amount_usd"`
	MinInvestmentUSD  float64   `json:"min_investment_usd"`
	MaxInvestmentUSD  float64   `json:"max_investment_usd"`
	EquityPercent     float64   `json:"equity_percent"`
	RaisedAmountUSD   float64   `json:"raised_amount_usd"`
	Status            string    `json:"status"`
	CreatedAt         time.Time `json:"created_at"`
}

type TeamMember struct {
	Name string `json:"name"`
	Role string `json:"role"`
	Bio string `json:"bio,omitempty"`
	Photo string `json:"photo,omitempty"`
	LinkedIn string `json:"linkedin,omitempty"`
}

type KYCDocument struct {
	Type          string `json:"document_type"`
	Number        string `json:"document_number,omitempty"`
	URL           string `json:"document_url"`
	BackURL       string `json:"document_back_url,omitempty"`
	SelfieURL     string `json:"selfie_url,omitempty"`
}

type KYCRequest struct {
	ID              string       `json:"id"`
	UserID          string       `json:"user_id"`
	UserName        string       `json:"user_name"`
	UserEmail       string       `json:"user_email"`
	Document        KYCDocument  `json:"document"`
	SubmittedAt     time.Time    `json:"submitted_at"`
	Status          string       `json:"status"`
	RejectionReason *string      `json:"rejection_reason,omitempty"`
	DecidedAt       *time.Time   `json:"decided_at,omitempty"`
}

type Notification struct {
	ID        string     `json:"id"`
	UserID    string     `json:"user_id"`
	Universe  string     `json:"universe"`
	Title     string     `json:"title"`
	Message   string     `json:"message"`
	Type      string     `json:"type"`
	ActionURL *string    `json:"action_url,omitempty"`
	Read      bool       `json:"read"`
	CreatedAt time.Time  `json:"created_at"`
}

type Investment struct {
	ID string `json:"id"`
	ProjectID string `json:"project_id"`
	InvestorID string `json:"investor_id"`
	InvestorName string `json:"investor_name,omitempty"`
	InvestorEmail string `json:"investor_email,omitempty"`
	AmountUSD float64 `json:"amount_usd"`
	EquityReceived float64 `json:"equity_received"`
	Status string `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
