package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"net/http"

	"github.com/zira-invest/backend/internal/config"
)

type Resend struct {
	apiKey string
	from   string
	client *http.Client
}

func NewResend(cfg config.Config) *Resend {
	return &Resend{apiKey: cfg.ResendAPIKey, from: cfg.ResendFromEmail, client: http.DefaultClient}
}

func (r *Resend) SendKYCDecision(ctx context.Context, to, name string, approved bool, reason string) error {
	if r.apiKey == "" {
		return nil
	}
	subject := "Votre vérification KYC ZIRA INVEST"
	safeName, safeReason := html.EscapeString(name), html.EscapeString(reason)
	body := fmt.Sprintf("<p>Bonjour %s,</p><p>Votre dossier KYC a été <strong>refusé</strong>.</p><p>Motif : %s</p><p>Vous pouvez corriger vos documents depuis votre espace ZIRA INVEST.</p>", safeName, safeReason)
	if approved {
		subject = "Votre identité est validée — ZIRA INVEST"
		body = fmt.Sprintf("<p>Bonjour %s,</p><p>Votre identité a été <strong>validée</strong> par notre équipe de conformité.</p><p>Vous pouvez maintenant utiliser les fonctionnalités autorisées de votre espace ZIRA INVEST.</p>", safeName)
	}
	payload, _ := json.Marshal(map[string]any{
		"from": r.from, "to": []string{to}, "subject": subject, "html": body,
	})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(payload))
	if err != nil { return err }
	req.Header.Set("Authorization", "Bearer "+r.apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.client.Do(req)
	if err != nil { return fmt.Errorf("resend request: %w", err) }
	defer resp.Body.Close()
	if resp.StatusCode >= 300 { return fmt.Errorf("resend returned status %s", resp.Status) }
	return nil
}
