const assert = require("node:assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { after, before, beforeEach, describe, test } = require("node:test");
const { Client } = require("pg");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const sourceDatabase = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const TEST_DATABASE = "classapp_test";

process.env.DB_NAME = TEST_DATABASE;
process.env.JWT_SECRET = "class-subject-test-secret";

const ADMIN_A = "admin-a";
const ADMIN_B = "admin-b";
const TEACHER_ID = "teacher-1";
const STUDENT_ID = "student-1";
const ENGLISH = "english-subject-id";
const MATHS = "maths-subject-id";
const SCIENCE = "science-subject-id";
const HISTORY = "history-subject-id";
const INACTIVE = "inactive-subject-id";

let pool;
let app;
let server;
let port;

function tokenFor(id, role, options = {}) {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        options
    );
}

function api(method, requestPath, { token, body } = {}) {
    const payload = body === undefined ? null : JSON.stringify(body);

    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: "127.0.0.1",
            port,
            path: requestPath,
            method,
            headers: {
                ...(payload
                    ? {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(payload)
                    }
                    : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        }, (res) => {
            const chunks = [];
            res.on("data", (chunk) => chunks.push(chunk));
            res.on("end", () => {
                const text = Buffer.concat(chunks).toString("utf8");
                let parsed = null;

                if (text) {
                    try {
                        parsed = JSON.parse(text);
                    } catch (error) {
                        parsed = null;
                    }
                }

                resolve({
                    status: res.statusCode,
                    body: parsed,
                    text
                });
            });
        });

        req.on("error", reject);

        if (payload) {
            req.write(payload);
        }

        req.end();
    });
}

async function ensureTestDatabase() {
    if (sourceDatabase.database === TEST_DATABASE) {
        throw new Error("Refusing to use the test database as the admin connection");
    }

    const client = new Client(sourceDatabase);
    await client.connect();

    try {
        const existing = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [TEST_DATABASE]
        );

        if (existing.rowCount === 0) {
            await client.query(`CREATE DATABASE ${TEST_DATABASE}`);
        }
    } finally {
        await client.end();
    }
}

async function resetSchema() {
    const client = new Client({
        ...sourceDatabase,
        database: TEST_DATABASE
    });
    await client.connect();

    try {
        const current = await client.query(
            "SELECT current_database() AS name"
        );

        if (current.rows[0].name !== TEST_DATABASE) {
            throw new Error(
                `Refusing to reset database ${current.rows[0].name}`
            );
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

        const foreignKeys = await client.query(
            `SELECT conname
             FROM pg_constraint
             WHERE conrelid = 'class_subjects'::regclass
               AND contype = 'f'
             ORDER BY conname`
        );

        assert.equal(foreignKeys.rowCount, 2);
    } finally {
        await client.end();
    }
}

async function seedAdmin(id) {
    await pool.query(
        `INSERT INTO admins (id, is_active, deletion_scheduled_at)
         VALUES ($1, TRUE, NULL)`,
        [id]
    );
}

async function seedSubject(id, subjectName, isActive = true) {
    const now = Date.now();
    await pool.query(
        `INSERT INTO subjects (
            id, subject_name, is_active, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $4)`,
        [id, subjectName, isActive, now]
    );
}

async function seedCoreSubjects() {
    await seedSubject(ENGLISH, "English");
    await seedSubject(MATHS, "Mathematics");
    await seedSubject(SCIENCE, "Science");
    await seedSubject(HISTORY, "History");
    await seedSubject(INACTIVE, "Art", false);
}

async function createClass(token, body) {
    return api("POST", "/api/classes", { token, body });
}

describe("class subject assignments", () => {
    before(async () => {
        await ensureTestDatabase();
        await resetSchema();
        pool = require("../src/config/database");
        app = require("../server");

        await new Promise((resolve) => {
            server = app.listen(0, "127.0.0.1", resolve);
        });

        port = server.address().port;
    });

    beforeEach(async () => {
        await pool.query(
            `TRUNCATE TABLE
                student_class_subjects,
                teacher_class_subjects,
                students,
                teachers,
                class_subjects,
                classes,
                subjects,
                admins
             RESTART IDENTITY CASCADE`
        );
    });

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }

        if (pool) {
            await pool.end();
        }
    });

    test("health endpoint reports that the Class API is working", async () => {
        const response = await api("GET", "/api/health");

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, {
            success: true,
            message: "Class API is working"
        });
    });

    test("creates a class without subjects", async () => {
        await seedAdmin(ADMIN_A);

        const response = await createClass(tokenFor(ADMIN_A, "admin"), {
            className: "Standard 5",
            classCode: "std-5"
        });

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.message, "Class created successfully");
        assert.equal(response.body.class.class_name, "Standard 5");
        assert.equal(response.body.class.class_code, "STD-5");
        assert.equal(response.body.class.admin_id, ADMIN_A);
        assert.equal(response.body.class.is_active, true);
        assert.deepEqual(response.body.class.subjects, []);
    });

    test("creates a class with one subject", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");

        const response = await createClass(tokenFor(ADMIN_A, "admin"), {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });

        assert.equal(response.status, 201);
        assert.deepEqual(response.body.class.subjects, [{
            id: ENGLISH,
            subject_name: "English",
            is_active: true
        }]);
    });

    test("creates a class with multiple subjects and lists that class once", async () => {
        await seedAdmin(ADMIN_A);
        await seedCoreSubjects();

        const created = await createClass(tokenFor(ADMIN_A, "admin"), {
            className: "Standard 5",
            classCode: "STD-5",
            classTeacherId: TEACHER_ID,
            subjectIds: [SCIENCE, ENGLISH, MATHS]
        });

        assert.equal(created.status, 201);
        assert.deepEqual(
            created.body.class.subjects.map((subject) => subject.subject_name),
            ["English", "Mathematics", "Science"]
        );

        const listed = await api("GET", "/api/classes", {
            token: tokenFor(ADMIN_A, "admin")
        });

        assert.equal(listed.status, 200);
        assert.equal(listed.body.classes.length, 1);
        assert.equal(listed.body.classes[0].id, created.body.class.id);
        assert.equal(listed.body.classes[0].subjects.length, 3);
    });

    test("retrieves a class with its assigned subjects", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        await seedSubject(MATHS, "Mathematics");

        const created = await createClass(tokenFor(ADMIN_A, "admin"), {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH, MATHS]
        });

        const response = await api(
            "GET",
            `/api/classes/${created.body.class.id}`,
            { token: tokenFor(ADMIN_A, "admin") }
        );

        assert.equal(response.status, 200);
        assert.equal(response.body.class.class_name, "Standard 5");
        assert.deepEqual(
            response.body.class.subjects.map((subject) => subject.id),
            [ENGLISH, MATHS]
        );
    });

    test("editing a class without subjectIds keeps its assignments", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        await seedSubject(MATHS, "Mathematics");

        const created = await createClass(tokenFor(ADMIN_A, "admin"), {
            className: "Standard 5",
            classCode: "STD-5",
            classTeacherId: TEACHER_ID,
            subjectIds: [ENGLISH, MATHS]
        });

        const updated = await api(
            "PUT",
            `/api/classes/${created.body.class.id}`,
            {
                token: tokenFor(ADMIN_A, "admin"),
                body: {
                    className: "Standard 5 Updated",
                    classCode: "STD-5",
                    classTeacherId: TEACHER_ID
                }
            }
        );

        assert.equal(updated.status, 200);
        assert.equal(updated.body.class.class_name, "Standard 5 Updated");
        assert.deepEqual(
            updated.body.class.subjects.map((subject) => subject.id),
            [ENGLISH, MATHS]
        );
    });

    test("replaces only the edited class subjects", async () => {
        await seedAdmin(ADMIN_A);
        await seedCoreSubjects();
        const token = tokenFor(ADMIN_A, "admin");

        const standard5 = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH, MATHS, SCIENCE]
        });
        const standard6 = await createClass(token, {
            className: "Standard 6",
            classCode: "STD-6",
            subjectIds: [ENGLISH, HISTORY]
        });

        const updated = await api(
            "PUT",
            `/api/classes/${standard5.body.class.id}`,
            {
                token,
                body: {
                    className: "Standard 5 Updated",
                    classCode: "STD-5",
                    subjectIds: [SCIENCE, HISTORY, ENGLISH]
                }
            }
        );

        assert.equal(updated.status, 200);
        assert.deepEqual(
            updated.body.class.subjects.map((subject) => subject.subject_name),
            ["English", "History", "Science"]
        );

        const otherClass = await api(
            "GET",
            `/api/classes/${standard6.body.class.id}`,
            { token }
        );

        assert.deepEqual(
            otherClass.body.class.subjects.map((subject) => subject.subject_name),
            ["English", "History"]
        );
    });

    test("an empty subjectIds array removes assignments for that class only", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        await seedSubject(MATHS, "Mathematics");
        const token = tokenFor(ADMIN_A, "admin");

        const standard5 = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });
        const standard6 = await createClass(token, {
            className: "Standard 6",
            classCode: "STD-6",
            subjectIds: [MATHS]
        });

        const updated = await api(
            "PUT",
            `/api/classes/${standard5.body.class.id}`,
            {
                token,
                body: {
                    className: "Standard 5",
                    classCode: "STD-5",
                    subjectIds: []
                }
            }
        );

        assert.equal(updated.status, 200);
        assert.deepEqual(updated.body.class.subjects, []);

        const otherClass = await api(
            "GET",
            `/api/classes/${standard6.body.class.id}`,
            { token }
        );
        assert.equal(otherClass.body.class.subjects.length, 1);
        assert.equal(otherClass.body.class.subjects[0].id, MATHS);
    });

    test("assigns the same subject to two classes", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        const token = tokenFor(ADMIN_A, "admin");

        const first = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });
        const second = await createClass(token, {
            className: "Standard 6",
            classCode: "STD-6",
            subjectIds: [ENGLISH]
        });

        assert.equal(first.status, 201);
        assert.equal(second.status, 201);
        assert.equal(first.body.class.subjects[0].id, ENGLISH);
        assert.equal(second.body.class.subjects[0].id, ENGLISH);
        assert.notEqual(first.body.class.id, second.body.class.id);
    });

    test("replacing class subjects does not change teacher or student assignments", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        await seedSubject(SCIENCE, "Science");
        const token = tokenFor(ADMIN_A, "admin");
        const now = Date.now();

        const created = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });
        const classId = created.body.class.id;

        await pool.query(
            `INSERT INTO teachers (
                id, teacher_code, name, email, mobile, password_hash,
                is_active, created_at, updated_at
             )
             VALUES ($1, 'T-1', 'Teacher', 'teacher@example.com', '', 'hash', TRUE, $2, $2)`,
            [TEACHER_ID, now]
        );
        await pool.query(
            `INSERT INTO teacher_class_subjects (
                id, teacher_id, class_id, subject_id, is_class_teacher,
                is_active, created_at, updated_at
             )
             VALUES ('teacher-assignment-1', $1, $2, $3, FALSE, TRUE, $4, $4)`,
            [TEACHER_ID, classId, ENGLISH, now]
        );
        await pool.query(
            `INSERT INTO students (
                id, class_id, student_code, student_name, parent_name, mobile,
                roll_number, username, password_hash, is_active, created_at, updated_at
             )
             VALUES (
                $1, $2, 'S-1', 'Student', 'Parent', '',
                '1', 'student1', 'hash', TRUE, $3, $3
             )`,
            [STUDENT_ID, classId, now]
        );
        await pool.query(
            `INSERT INTO student_class_subjects (
                id, student_id, class_id, subject_id, is_active, created_at, updated_at
             )
             VALUES ('student-assignment-1', $1, $2, $3, TRUE, $4, $4)`,
            [STUDENT_ID, classId, ENGLISH, now]
        );

        const updated = await api("PUT", `/api/classes/${classId}`, {
            token,
            body: {
                className: "Standard 5",
                classCode: "STD-5",
                subjectIds: [SCIENCE]
            }
        });

        assert.equal(updated.status, 200);
        assert.deepEqual(
            updated.body.class.subjects.map((subject) => subject.id),
            [SCIENCE]
        );

        const teacherAssignment = await pool.query(
            `SELECT teacher_id, class_id, subject_id
             FROM teacher_class_subjects
             WHERE id = 'teacher-assignment-1'`
        );
        const studentAssignment = await pool.query(
            `SELECT student_id, class_id, subject_id
             FROM student_class_subjects
             WHERE id = 'student-assignment-1'`
        );

        assert.deepEqual(teacherAssignment.rows[0], {
            teacher_id: TEACHER_ID,
            class_id: classId,
            subject_id: ENGLISH
        });
        assert.deepEqual(studentAssignment.rows[0], {
            student_id: STUDENT_ID,
            class_id: classId,
            subject_id: ENGLISH
        });
    });

    test("requires an authentication token", async () => {
        const response = await api("GET", "/api/classes");

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Access token required");
    });

    test("rejects an invalid or expired token", async () => {
        await seedAdmin(ADMIN_A);

        const invalid = await api("GET", "/api/classes", {
            token: "not-a-token"
        });
        const expired = await api("GET", "/api/classes", {
            token: jwt.sign(
                {
                    id: ADMIN_A,
                    role: "admin",
                    exp: Math.floor(Date.now() / 1000) - 60
                },
                process.env.JWT_SECRET
            )
        });

        assert.equal(invalid.status, 401);
        assert.equal(invalid.body.message, "Invalid or expired token");
        assert.equal(expired.status, 401);
        assert.equal(expired.body.message, "Invalid or expired token");
    });

    test("rejects a non-admin role", async () => {
        const now = Date.now();
        await pool.query(
            `INSERT INTO teachers (
                id, teacher_code, name, email, mobile, password_hash,
                is_active, created_at, updated_at
             )
             VALUES ($1, 'T-1', 'Teacher', 'teacher@example.com', '', 'hash', TRUE, $2, $2)`,
            [TEACHER_ID, now]
        );

        const response = await api("GET", "/api/classes", {
            token: tokenFor(TEACHER_ID, "teacher")
        });

        assert.equal(response.status, 403);
        assert.equal(response.body.message, "Admin access required");
    });

    test("returns 404 when the class does not exist", async () => {
        await seedAdmin(ADMIN_A);

        const response = await api("GET", "/api/classes/missing-class", {
            token: tokenFor(ADMIN_A, "admin")
        });

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Class not found");
    });

    test("does not allow another admin to read or edit the class", async () => {
        await seedAdmin(ADMIN_A);
        await seedAdmin(ADMIN_B);
        await seedSubject(ENGLISH, "English");

        const created = await createClass(tokenFor(ADMIN_A, "admin"), {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });

        const read = await api(
            "GET",
            `/api/classes/${created.body.class.id}`,
            { token: tokenFor(ADMIN_B, "admin") }
        );
        const edit = await api(
            "PUT",
            `/api/classes/${created.body.class.id}`,
            {
                token: tokenFor(ADMIN_B, "admin"),
                body: {
                    className: "Taken",
                    classCode: "STD-5",
                    subjectIds: []
                }
            }
        );
        const owned = await api(
            "GET",
            `/api/classes/${created.body.class.id}`,
            { token: tokenFor(ADMIN_A, "admin") }
        );

        assert.equal(read.status, 404);
        assert.equal(edit.status, 404);
        assert.equal(owned.body.class.class_name, "Standard 5");
        assert.equal(owned.body.class.subjects[0].id, ENGLISH);

        const listed = await api("GET", "/api/classes", {
            token: tokenFor(ADMIN_B, "admin")
        });
        assert.deepEqual(listed.body.classes, []);
    });

    test("rejects an unknown subject and does not leave a class behind", async () => {
        await seedAdmin(ADMIN_A);

        const response = await createClass(tokenFor(ADMIN_A, "admin"), {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: ["missing-subject"]
        });

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Subject not found");

        const classes = await pool.query("SELECT id FROM classes");
        assert.equal(classes.rowCount, 0);
    });

    test("rejects an inactive subject and rolls back the class update", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        await seedSubject(INACTIVE, "Art", false);
        const token = tokenFor(ADMIN_A, "admin");

        const created = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });

        const createInactive = await createClass(token, {
            className: "Standard 6",
            classCode: "STD-6",
            subjectIds: [INACTIVE]
        });
        assert.equal(createInactive.status, 403);
        assert.equal(createInactive.body.message, "Subject is inactive");

        const updated = await api(
            "PUT",
            `/api/classes/${created.body.class.id}`,
            {
                token,
                body: {
                    className: "Standard 5 Updated",
                    classCode: "STD-5",
                    subjectIds: [INACTIVE]
                }
            }
        );

        assert.equal(updated.status, 403);

        const current = await api(
            "GET",
            `/api/classes/${created.body.class.id}`,
            { token }
        );
        assert.equal(current.body.class.class_name, "Standard 5");
        assert.equal(current.body.class.subjects[0].id, ENGLISH);

        const classes = await pool.query(
            "SELECT class_code FROM classes ORDER BY class_code"
        );
        assert.deepEqual(
            classes.rows.map((row) => row.class_code),
            ["STD-5"]
        );
    });

    test("rejects an invalid subjectIds type and duplicate subject IDs", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        const token = tokenFor(ADMIN_A, "admin");

        const invalidType = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: ENGLISH
        });
        const duplicates = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH, ENGLISH]
        });
        const blank = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [" "]
        });

        assert.equal(invalidType.status, 400);
        assert.equal(invalidType.body.message, "subjectIds must be an array");
        assert.equal(duplicates.status, 400);
        assert.equal(duplicates.body.message, "Duplicate subject IDs are not allowed");
        assert.equal(blank.status, 400);
        assert.equal(blank.body.message, "Each subject ID must be a non-empty string");

        const classes = await pool.query("SELECT id FROM classes");
        assert.equal(classes.rowCount, 0);
    });

    test("rolls back the class update when subject assignment fails in the database", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        await seedSubject(SCIENCE, "Science");
        const token = tokenFor(ADMIN_A, "admin");

        const created = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });

        const version = await pool.query("SHOW server_version_num");
        const executeKeyword = Number(version.rows[0].server_version_num) >= 140000
            ? "FUNCTION"
            : "PROCEDURE";

        await pool.query(`
            CREATE OR REPLACE FUNCTION class_subjects_fail_insert()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RAISE EXCEPTION 'forced assignment failure';
            END;
            $$
        `);
        await pool.query(`
            CREATE TRIGGER class_subjects_fail_insert
            BEFORE INSERT ON class_subjects
            FOR EACH ROW
            EXECUTE ${executeKeyword} class_subjects_fail_insert()
        `);

        try {
            const updated = await api(
                "PUT",
                `/api/classes/${created.body.class.id}`,
                {
                    token,
                    body: {
                        className: "Standard 5 Updated",
                        classCode: "STD-5",
                        subjectIds: [SCIENCE]
                    }
                }
            );

            assert.equal(updated.status, 500);

            const current = await api(
                "GET",
                `/api/classes/${created.body.class.id}`,
                { token }
            );

            assert.equal(current.body.class.class_name, "Standard 5");
            assert.deepEqual(
                current.body.class.subjects.map((subject) => subject.id),
                [ENGLISH]
            );
        } finally {
            await pool.query(
                "DROP TRIGGER IF EXISTS class_subjects_fail_insert ON class_subjects"
            );
            await pool.query(
                "DROP FUNCTION IF EXISTS class_subjects_fail_insert()"
            );
        }
    });

    test("keeps existing class status and delete behavior", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        await seedSubject(MATHS, "Mathematics");
        const token = tokenFor(ADMIN_A, "admin");

        const standard5 = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });
        const standard6 = await createClass(token, {
            className: "Standard 6",
            classCode: "STD-6",
            subjectIds: [MATHS]
        });

        const disabled = await api(
            "PATCH",
            `/api/classes/${standard5.body.class.id}/status`,
            {
                token,
                body: { isActive: false }
            }
        );

        assert.equal(disabled.status, 200);
        assert.equal(disabled.body.message, "Class disabled successfully");
        assert.equal(disabled.body.class.is_active, false);
        assert.equal(disabled.body.class.subjects, undefined);

        const stillAssigned = await api(
            "GET",
            `/api/classes/${standard5.body.class.id}`,
            { token }
        );
        assert.equal(stillAssigned.body.class.subjects[0].id, ENGLISH);

        const removed = await api(
            "DELETE",
            `/api/classes/${standard5.body.class.id}`,
            { token }
        );

        assert.equal(removed.status, 200);
        assert.equal(removed.body.message, "Class deleted successfully");

        const deletedLinks = await pool.query(
            "SELECT class_id FROM class_subjects WHERE class_id = $1",
            [standard5.body.class.id]
        );
        const remaining = await api(
            "GET",
            `/api/classes/${standard6.body.class.id}`,
            { token }
        );

        assert.equal(deletedLinks.rowCount, 0);
        assert.equal(remaining.body.class.subjects[0].id, MATHS);
    });

    test("duplicate class codes still conflict and subject listing still works", async () => {
        await seedAdmin(ADMIN_A);
        await seedSubject(ENGLISH, "English");
        const token = tokenFor(ADMIN_A, "admin");

        const created = await createClass(token, {
            className: "Standard 5",
            classCode: "STD-5"
        });
        const duplicate = await createClass(token, {
            className: "Another",
            classCode: "STD-5",
            subjectIds: [ENGLISH]
        });
        const subjects = await api("GET", "/api/subjects", { token });

        assert.equal(created.status, 201);
        assert.equal(duplicate.status, 409);
        assert.equal(duplicate.body.message, "Class code already exists");
        assert.equal(subjects.status, 200);
        assert.equal(subjects.body.subjects[0].subject_name, "English");

        const classes = await pool.query("SELECT id FROM classes");
        assert.equal(classes.rowCount, 1);
    });
});
