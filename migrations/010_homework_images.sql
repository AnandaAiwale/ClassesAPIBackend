CREATE TABLE IF NOT EXISTS homework_images (
    id TEXT PRIMARY KEY,
    homework_id TEXT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    image_order INTEGER NOT NULL,
    created_at BIGINT NOT NULL,
    UNIQUE (homework_id, image_order)
);
