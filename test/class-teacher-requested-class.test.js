const assert = require("node:assert/strict");
const { test } = require("node:test");

const { requestedClassId } = require("../src/middleware/classTeacherAuth");

test("requestedClassId works for GET requests with no body", () => {
    assert.equal(
        requestedClassId({
            params: {},
            query: { fromDate: "2026-10-01", toDate: "2026-10-14" }
        }),
        null
    );
});

test("requestedClassId reads classId from params, body, or query safely", () => {
    assert.equal(
        requestedClassId({ params: { classId: "class-1" } }),
        "class-1"
    );
    assert.equal(
        requestedClassId({
            params: {},
            body: { classId: "class-2" },
            query: {}
        }),
        "class-2"
    );
    assert.equal(
        requestedClassId({
            params: {},
            query: { classId: "class-3" }
        }),
        "class-3"
    );
});
