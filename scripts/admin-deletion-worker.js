const pool = require("../src/config/database");

const CHECK_INTERVAL_MS = 60 * 1000;
const DRY_RUN = process.env.ADMIN_DELETION_WORKER_DRY_RUN !== "false";

async function processDueDeletion() {
    const db = await pool.connect();

    try {
        await db.query("BEGIN");

        const result = await db.query(`
            SELECT id, admin_uid, deletion_scheduled_at
            FROM admins
            WHERE is_active = FALSE
              AND deletion_requested_at IS NOT NULL
              AND deletion_scheduled_at IS NOT NULL
              AND deletion_scheduled_at <= $1
            ORDER BY deletion_scheduled_at ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        `, [Date.now()]);

        if (result.rows.length === 0) {
            await db.query("COMMIT");
            return;
        }

        const admin = result.rows[0];

        if (DRY_RUN) {
            console.log(
                `[DRY RUN] Due deletion found for ${admin.admin_uid}; no records deleted.`
            );
            await db.query("ROLLBACK");
            return;
        }

        const deleted = await db.query(`
            DELETE FROM admins
            WHERE id = $1
              AND is_active = FALSE
              AND deletion_scheduled_at <= $2
            RETURNING admin_uid
        `, [admin.id, Date.now()]);

        await db.query("COMMIT");

        if (deleted.rows.length > 0) {
            console.log(
                `Permanently deleted Admin ${deleted.rows[0].admin_uid}.`
            );
        }
    } catch (error) {
        await db.query("ROLLBACK").catch(() => {});
        console.error("Deletion worker error:", error.message);
    } finally {
        db.release();
    }
}

let stopping = false;

async function run() {
    while (!stopping) {
        await processDueDeletion();
        if (!stopping) {
            await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_MS));
        }
    }
}

process.on("SIGTERM", () => {
    stopping = true;
});

process.on("SIGINT", () => {
    stopping = true;
});

run()
    .catch(error => {
        console.error("Worker stopped unexpectedly:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
