-- Links a class to its subjects.
-- Does not replace teacher_class_subjects or student_class_subjects.
CREATE TABLE IF NOT EXISTS class_subjects (
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    PRIMARY KEY (class_id, subject_id)
);
