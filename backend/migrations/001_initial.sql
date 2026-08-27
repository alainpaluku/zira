CREATE TABLE IF NOT EXISTS users (
    clerk_id TEXT PRIMARY KEY,
    email TEXT NOT NULL DEFAULT '',
    username TEXT NOT NULL DEFAULT '',
    display_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('investisseur', 'porteur', 'moderateur', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    kyc_status TEXT NOT NULL DEFAULT 'not_submitted'
        CHECK (kyc_status IN ('not_started', 'not_submitted', 'in_progress', 'pending', 'approved', 'rejected', 'requires_action')),
    title TEXT,
    bio TEXT,
    avatar_url TEXT,
    company_name TEXT,
    phone TEXT,
    country TEXT,
    city TEXT,
    profile_extras JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(clerk_id),
    name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL DEFAULT '',
    sector TEXT NOT NULL,
    target_market TEXT NOT NULL DEFAULT '',
    stage TEXT NOT NULL DEFAULT 'Growth',
    country TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    team JSONB NOT NULL DEFAULT '[]'::jsonb,
    video_url TEXT,
    logo_url TEXT,
    poster_url TEXT,
    target_amount_usd NUMERIC(14,2) NOT NULL CHECK (target_amount_usd > 0),
    min_investment_usd NUMERIC(14,2) NOT NULL CHECK (min_investment_usd > 0),
    max_investment_usd NUMERIC(14,2) NOT NULL CHECK (max_investment_usd >= min_investment_usd),
    equity_percent NUMERIC(6,3) NOT NULL CHECK (equity_percent > 0 AND equity_percent <= 100),
    raised_amount_usd NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (raised_amount_usd >= 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'funded', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kyc_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_id),
    document_type TEXT NOT NULL,
    document_number TEXT,
    document_url TEXT NOT NULL,
    document_back_url TEXT,
    selfie_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'requires_action')),
    rejection_reason TEXT,
    decided_at TIMESTAMPTZ,
    decided_by TEXT REFERENCES users(clerk_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_id),
    universe TEXT NOT NULL CHECK (universe IN ('porteur', 'investisseur', 'moderation')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('project', 'investment', 'kyc', 'system', 'warning')),
    action_url TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    investor_id TEXT NOT NULL REFERENCES users(clerk_id),
    amount_usd NUMERIC(14,2) NOT NULL CHECK (amount_usd > 0),
    equity_received NUMERIC(8,4) NOT NULL CHECK (equity_received >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_requests(status);
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
