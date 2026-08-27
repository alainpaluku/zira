# ZIRA INVEST API

Backend autonome en Go + Gin + PostgreSQL, organisé autour de ports/adaptateurs :

- `internal/domain` : modèles métier et statuts.
- `internal/ports` : contrats des repositories et services externes.
- `internal/adapters/postgres` : persistance PostgreSQL.
- `internal/adapters/email` : adaptateur Resend.
- `internal/http` : transport HTTP et autorisation.
- `cmd/api` : composition de l’application.

## Démarrage local

```bash
cp .env.example .env
psql "$DATABASE_URL" -f migrations/001_initial.sql
go mod tidy
go run ./cmd/api
```

Le serveur écoute sur `:8080`. Le frontend utilise `VITE_API_BASE_URL`.

## Authentification

Clerk reste la source d’identité. Le serveur accepte un JWT Clerk via `Authorization: Bearer` ou `X-Clerk-Session-Token`, vérifié avec `CLERK_JWT_KEY`, `CLERK_ISSUER` et `CLERK_AUDIENCE`. Le mode `ALLOW_DEV_AUTH` est réservé au développement local et est rejeté en production.

## KYC

`POST /api/me/kyc/submit` enregistre les URL des images du document et du selfie. `GET /api/moderation/kyc?status=pending` permet à un modérateur de voir les pièces. `POST /api/moderation/kyc/:id/decision` exige un motif d’au moins 10 caractères lors d'un refus, crée la décision métier et envoie la notification Resend si `RESEND_API_KEY` est configurée.

Les images doivent être stockées par un service de fichiers objet dans un environnement de production ; le contrat actuel transporte leurs URL et évite de coupler ce dépôt à un fournisseur non choisi.