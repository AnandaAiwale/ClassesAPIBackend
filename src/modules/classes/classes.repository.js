const pool = require("../../config/database");

const RETURNING_FIELDS = `
    id,
    admin_id,
    class_name,
    class_code,
    class_teacher_id,
    is_active,
    created_at,
    updated_at
`;

async function attachSubjects(classes, client = pool) {
    if (!classes.length) {
        return classes;
    }

    const result = await client.query(
        `SELECT
            cs.class_id,
            s.id,
            s.subject_name,
            s.is_active
         FROM class_subjects cs
         JOIN subjects s ON s.id = cs.subject_id
         WHERE cs.class_id = ANY($1::text[])
         ORDER BY s.subject_name ASC`,
        [classes.map((item) => item.id)]
    );

    const grouped = new Map();

    for (const row of result.rows) {
        if (!grouped.has(row.class_id)) {
            grouped.set(row.class_id, []);
        }

        grouped.get(row.class_id).push({
            id: row.id,
            subject_name: row.subject_name,
            is_active: row.is_active
        });
    }

    return classes.map((item) => ({
        ...item,
        subjects: grouped.get(item.id) || []
    }));
}

async function withTransaction(work) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Rollback error:", rollbackError);
        }

        throw error;
    } finally {
        client.release();
    }
}

async function findAll(adminId) {
    const result = await pool.query(
        `SELECT ${RETURNING_FIELDS}
         FROM classes
         WHERE admin_id = $1
         ORDER BY class_name ASC`,
        [adminId]
    );

    return attachSubjects(result.rows);
}

async function findById(id, adminId) {
    const result = await pool.query(
        `SELECT ${RETURNING_FIELDS}
         FROM classes
         WHERE id = $1 AND admin_id = $2`,
        [id, adminId]
    );

    const row = result.rows[0] || null;

    if (!row) {
        return null;
    }

    const [item] = await attachSubjects([row]);
    return item;
}

async function findByCode(classCode) {
    const result = await pool.query(
        `SELECT ${RETURNING_FIELDS}
         FROM classes
         WHERE class_code = $1`,
        [classCode]
    );
    return result.rows[0] || null;
}

async function lockOwnedClass(client, id, adminId) {
    const result = await client.query(
        `SELECT id
         FROM classes
         WHERE id = $1 AND admin_id = $2
         FOR UPDATE`,
        [id, adminId]
    );

    return result.rows[0] || null;
}

async function findSubjectsByIds(client, subjectIds) {
    const result = await client.query(
        `SELECT id, is_active
         FROM subjects
         WHERE id = ANY($1::text[])`,
        [subjectIds]
    );

    return result.rows;
}

async function createClass({
    id,
    adminId,
    className,
    classCode,
    classTeacherId,
    createdAt
}, client = pool) {
    const result = await client.query(
        `INSERT INTO classes (
            id, admin_id, class_name, class_code,
            class_teacher_id, is_active, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, TRUE, $6, $6)
         RETURNING ${RETURNING_FIELDS}`,
        [
            id,
            adminId,
            className,
            classCode,
            classTeacherId || null,
            createdAt
        ]
    );
    return result.rows[0];
}

async function updateClass({
    id,
    adminId,
    className,
    classCode,
    classTeacherId,
    updatedAt
}, client = pool) {
    const result = await client.query(
        `UPDATE classes
         SET class_name = $3,
             class_code = $4,
             class_teacher_id = $5,
             updated_at = $6
         WHERE id = $1 AND admin_id = $2
         RETURNING ${RETURNING_FIELDS}`,
        [
            id,
            adminId,
            className,
            classCode,
            classTeacherId || null,
            updatedAt
        ]
    );
    return result.rows[0] || null;
}

async function insertClassSubjects(client, classId, subjectIds, timestamp) {
    await client.query(
        `INSERT INTO class_subjects (
            class_id,
            subject_id,
            created_at,
            updated_at
         )
         SELECT $1, subject_id, $3, $3
         FROM unnest($2::text[]) AS subject_id`,
        [classId, subjectIds, timestamp]
    );
}

async function replaceClassSubjects(client, classId, subjectIds, timestamp) {
    await client.query(
        `DELETE FROM class_subjects
         WHERE class_id = $1`,
        [classId]
    );

    if (subjectIds.length === 0) {
        return;
    }

    await insertClassSubjects(client, classId, subjectIds, timestamp);
}

async function updateStatus(id, adminId, isActive, updatedAt) {
    const result = await pool.query(
        `UPDATE classes
         SET is_active = $3, updated_at = $4
         WHERE id = $1 AND admin_id = $2
         RETURNING ${RETURNING_FIELDS}`,
        [id, adminId, isActive, updatedAt]
    );
    return result.rows[0] || null;
}

async function deleteClass(id, adminId) {
    const result = await pool.query(
        `DELETE FROM classes
         WHERE id = $1 AND admin_id = $2
         RETURNING id`,
        [id, adminId]
    );
    return result.rows[0] || null;
}

module.exports = {
    attachSubjects,
    withTransaction,
    findAll,
    findById,
    findByCode,
    lockOwnedClass,
    findSubjectsByIds,
    createClass,
    updateClass,
    insertClassSubjects,
    replaceClassSubjects,
    updateStatus,
    deleteClass
};
