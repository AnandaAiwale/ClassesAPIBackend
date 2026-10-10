const pool = require("../../config/database");

async function findById(id) {
    const result = await pool.query(
        `SELECT
            h.id,
            h.teacher_id,
            h.class_id,
            h.subject_id,
            h.homework_date,
            h.homework_text,
            h.published,
            h.created_at,
            h.updated_at,
            t.teacher_code,
            t.name AS teacher_name,
            c.class_name,
            c.class_code,
            s.subject_name
         FROM homework h
         JOIN teachers t ON t.id = h.teacher_id
         JOIN classes c ON c.id = h.class_id
         JOIN subjects s ON s.id = h.subject_id
         WHERE h.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function findByClassAndSubject(classId, subjectId) {
    const result = await pool.query(
        `SELECT
            h.id,
            h.teacher_id,
            h.class_id,
            h.subject_id,
            h.homework_date,
            h.homework_text,
            h.published,
            h.created_at,
            h.updated_at,
            t.teacher_code,
            t.name AS teacher_name,
            c.class_name,
            c.class_code,
            s.subject_name
         FROM homework h
         JOIN teachers t ON t.id = h.teacher_id
         JOIN classes c ON c.id = h.class_id
         JOIN subjects s ON s.id = h.subject_id
         WHERE h.class_id = $1
           AND h.subject_id = $2
         ORDER BY h.homework_date DESC, h.created_at DESC`,
        [classId, subjectId]
    );

    return result.rows;
}

async function findByTeacher(teacherId) {
    const result = await pool.query(
        `SELECT
            h.id,
            h.teacher_id,
            h.class_id,
            h.subject_id,
            h.homework_date,
            h.homework_text,
            h.published,
            h.created_at,
            h.updated_at,
            c.class_name,
            c.class_code,
            s.subject_name
         FROM homework h
         JOIN classes c ON c.id = h.class_id
         JOIN subjects s ON s.id = h.subject_id
         WHERE h.teacher_id = $1
         ORDER BY h.homework_date DESC, h.created_at DESC`,
        [teacherId]
    );

    return result.rows;
}

async function findExisting(
    teacherId,
    classId,
    subjectId,
    homeworkDate
) {
    const result = await pool.query(
        `SELECT
            id,
            teacher_id,
            class_id,
            subject_id,
            homework_date,
            homework_text,
            published,
            created_at,
            updated_at
         FROM homework
         WHERE teacher_id = $1
           AND class_id = $2
           AND subject_id = $3
           AND homework_date = $4`,
        [
            teacherId,
            classId,
            subjectId,
            homeworkDate
        ]
    );

    return result.rows[0] || null;
}

async function createHomework({
    id,
    teacherId,
    classId,
    subjectId,
    homeworkDate,
    homeworkText,
    published,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO homework (
            id,
            teacher_id,
            class_id,
            subject_id,
            homework_date,
            homework_text,
            published,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        RETURNING
            id,
            teacher_id,
            class_id,
            subject_id,
            homework_date,
            homework_text,
            published,
            created_at,
            updated_at`,
        [
            id,
            teacherId,
            classId,
            subjectId,
            homeworkDate,
            homeworkText,
            published,
            createdAt
        ]
    );

    return result.rows[0];
}

async function updateHomework({
    id,
    homeworkDate,
    homeworkText,
    updatedAt
}) {
    const result = await pool.query(
        `UPDATE homework
         SET homework_date = $2,
             homework_text = $3,
             updated_at = $4
         WHERE id = $1
         RETURNING
            id,
            teacher_id,
            class_id,
            subject_id,
            homework_date,
            homework_text,
            published,
            created_at,
            updated_at`,
        [
            id,
            homeworkDate,
            homeworkText,
            updatedAt
        ]
    );

    return result.rows[0] || null;
}

async function updatePublished(id, published, updatedAt) {
    const result = await pool.query(
        `UPDATE homework
         SET published = $2,
             updated_at = $3
         WHERE id = $1
         RETURNING
            id,
            teacher_id,
            class_id,
            subject_id,
            homework_date,
            homework_text,
            published,
            created_at,
            updated_at`,
        [id, published, updatedAt]
    );

    return result.rows[0] || null;
}

async function deleteHomework(id) {
    const result = await pool.query(
        `DELETE FROM homework
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

async function addImage({
    id,
    homeworkId,
    imageUrl,
    fileName,
    imageOrder,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO homework_images (
            id,
            homework_id,
            image_url,
            file_name,
            image_order,
            created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            homework_id,
            image_url,
            file_name,
            image_order,
            created_at`,
        [
            id,
            homeworkId,
            imageUrl,
            fileName,
            imageOrder,
            createdAt
        ]
    );

    return result.rows[0];
}

async function findImages(homeworkId) {
    const result = await pool.query(
        `SELECT
            id,
            homework_id,
            image_url,
            file_name,
            image_order,
            created_at
         FROM homework_images
         WHERE homework_id = $1
         ORDER BY image_order ASC`,
        [homeworkId]
    );

    return result.rows;
}

async function findImageById(id) {
    const result = await pool.query(
        `SELECT
            id,
            homework_id,
            image_url,
            file_name,
            image_order,
            created_at
         FROM homework_images
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function deleteImage(id) {
    const result = await pool.query(
        `DELETE FROM homework_images
         WHERE id = $1
         RETURNING id, homework_id, image_url, file_name`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    findById,
    findByClassAndSubject,
    findByTeacher,
    findExisting,
    createHomework,
    updateHomework,
    updatePublished,
    deleteHomework,
    addImage,
    findImages,
    findImageById,
    deleteImage
};
