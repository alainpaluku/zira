-- Migration sûre pour les bases déjà initialisées avec 001_initial.sql.
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_extras JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team JSONB NOT NULL DEFAULT '[]'::jsonb;
