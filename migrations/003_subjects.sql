CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    subject_name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);
