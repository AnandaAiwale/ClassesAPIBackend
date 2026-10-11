const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { after, before, test } = require("node:test");
const { Client } = require("pg");

require("dotenv").config();

const sourceDatabase = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

process.env.DB_NAME = "classapp_test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "class-subject-test-secret";

const ADMIN_ID = "teacher-assign-admin";
const OTHER_ADMIN_ID = "teacher-assign-other-admin";
const CLASS_ID = "teacher-assign-class";
const SUBJECT_ID = "teacher-assign-subject";
const TEACHER_ID = "teacher-assign-teacher";

let pool;
let service;

async function ensureSchema() {
    const client = new Client({
        ...sourceDatabase,
        database: "classapp_test"
    });
    await client.connect();

    try {
        const current = await client.query("SELECT current_database() AS name");

        if (current.rows[0].name !== "classapp_test") {
            throw new Error("Refusing to use " + current.rows[0].name);
        }

        const existing = await client.query(
            "SELECT to_regclass('public.teacher_class_subjects') AS name"
        );

        if (existing.rows[0].name) {
            return;
        }

        await client.query("DROP SCHEMA public CASCADE");
        await client.query("CREATE SCHEMA public");
        const fixture = fs.readFileSync(
            path.join(__dirname, "fixtures", "schema.sql"),
            "utf8"
        );
        const migration = fs.readFileSync(
            path.join(__dirname, "..", "migrations", "012_class_subjects.sql"),
            "utf8"
        );
        await client.query(fixture);
        await client.query(migration);
    } finally {
        await client.end();
    }
}

before(async () => {
    if (sourceDatabase.database === "classapp_test") {
        throw new Error("Refusing to use the test database as the admin connection");
    }

    const admin = new Client(sourceDatabase);
    await admin.connect();

    try {
        const found = await admin.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            ["classapp_test"]
        );

        if (found.rowCount === 0) {
            await admin.query("CREATE DATABASE classapp_test");
        }
    } finally {
        await admin.end();
    }

    await ensureSchema();
    pool = require("../src/config/database");
    service = require("../src/modules/teacherAssignments/teacherAssignments.service");

    const now = Date.now();
    await pool.query(
        `INSERT INTO admins (id, is_active, deletion_scheduled_at)
         VALUES ($1, TRUE, NULL), ($2, TRUE, NULL)
         ON CONFLICT (id) DO NOTHING`,
        [ADMIN_ID, OTHER_ADMIN_ID]
    );
    await pool.query(
        `INSERT INTO classes (
            id, admin_id, class_name, class_code, is_active, created_at, updated_at
         )
         VALUES ($1, $2, 'Standard 5', 'TAS-5', TRUE, $3, $3)
         ON CONFLICT (id) DO NOTHING`,
        [CLASS_ID, ADMIN_ID, now]
    );
    await pool.query(
        `INSERT INTO subjects (
            id, subject_name, is_active, created_at, updated_at
         )
         VALUES ($1, 'Teacher Assign Subject', TRUE, $2, $2)
         ON CONFLICT (id) DO NOTHING`,
        [SUBJECT_ID, now]
    );
    await pool.query(
        `INSERT INTO teachers (
            id, teacher_code, name, email, mobile, password_hash,
            is_active, created_at, updated_at
         )
         VALUES (
            $1, 'TAS-1', 'Teacher', 'teacher-assign@example.com', '',
            'hash', TRUE, $2, $2
         )
         ON CONFLICT (id) DO NOTHING`,
        [TEACHER_ID, now]
    );
});

after(async () => {
    if (!pool) {
        return;
    }

    await pool.query(
        "DELETE FROM teacher_class_subjects WHERE class_id = $1",
        [CLASS_ID]
    );
    await pool.query("DELETE FROM classes WHERE id = $1", [CLASS_ID]);
    await pool.query("DELETE FROM subjects WHERE id = $1", [SUBJECT_ID]);
    await pool.query("DELETE FROM teachers WHERE id = $1", [TEACHER_ID]);
    await pool.query(
        "DELETE FROM admins WHERE id IN ($1, $2)",
        [ADMIN_ID, OTHER_ADMIN_ID]
    );
    await pool.end();
});

test("assigns a subject to a teacher for the admin who owns the class", async () => {
    const assignment = await service.createAssignment({
        adminId: ADMIN_ID,
        teacherId: TEACHER_ID,
        classId: CLASS_ID,
        subjectId: SUBJECT_ID,
        isClassTeacher: false
    });

    assert.equal(assignment.teacher_id, TEACHER_ID);
    assert.equal(assignment.class_id, CLASS_ID);
    assert.equal(assignment.subject_id, SUBJECT_ID);
    assert.equal(assignment.is_class_teacher, false);
});

test("does not assign a teacher to a class owned by another admin", async () => {
    await assert.rejects(
        () => service.createAssignment({
            adminId: OTHER_ADMIN_ID,
            teacherId: TEACHER_ID,
            classId: CLASS_ID,
            subjectId: SUBJECT_ID,
            isClassTeacher: false
        }),
        (error) => error.statusCode === 404 && error.message === "Class not found"
    );
});
