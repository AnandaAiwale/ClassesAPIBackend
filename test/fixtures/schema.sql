-- Isolated test schema only. Not a production migration.
-- classes.admin_id matches the current repository. migrations/002_classes.sql does not define that column.
-- admins.deletion_scheduled_at matches src/middleware/auth.js. migrations/001_admin.sql does not define it.

CREATE TABLE admins (
    id TEXT PRIMARY KEY,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deletion_scheduled_at BIGINT NULL
);

CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL REFERENCES admins(id),
    class_name TEXT NOT NULL,
    class_code TEXT NOT NULL UNIQUE,
    class_teacher_id TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    subject_name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE TABLE teachers (
    id TEXT PRIMARY KEY,
    teacher_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE TABLE students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_code TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    mobile TEXT NOT NULL DEFAULT '',
    roll_number TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    photo_url TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    UNIQUE (class_id, roll_number)
);

CREATE TABLE teacher_class_subjects (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    is_class_teacher BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    UNIQUE (teacher_id, class_id, subject_id)
);

CREATE TABLE student_class_subjects (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    UNIQUE (student_id, subject_id)
);
