const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
    groupAssignmentsByClass,
    loginFromRequest
} = require("../src/modules/teachers/teacherAuth.service");

test("groups only active assignments for the logged-in teacher", () => {
    const classes = groupAssignmentsByClass([
        {
            id: "assign-1",
            class_id: "class-a",
            class_name: "First",
            class_code: "F1",
            subject_id: "sub-m",
            subject_name: "Marathi",
            is_class_teacher: true,
            is_active: true
        },
        {
            id: "assign-2",
            class_id: "class-b",
            class_name: "Second",
            class_code: "S2",
            subject_id: "sub-m",
            subject_name: "Marathi",
            is_class_teacher: false,
            is_active: true
        },
        {
            id: "assign-3",
            class_id: "class-a",
            class_name: "First",
            class_code: "F1",
            subject_id: "sub-e",
            subject_name: "English",
            is_class_teacher: true,
            is_active: true
        },
        {
            id: "assign-other",
            class_id: "class-z",
            class_name: "Other",
            class_code: "Z9",
            subject_id: "sub-x",
            subject_name: "Science",
            is_class_teacher: false,
            is_active: false
        }
    ]);

    assert.equal(classes.length, 2);
    assert.equal(classes[0].className, "First");
    assert.equal(classes[0].subjects.length, 2);
    assert.equal(classes[0].isClassTeacher, true);
    assert.equal(classes[1].className, "Second");
    assert.equal(classes[1].subjects.length, 1);
});

test("rejects mixed email and class-code login input", async () => {
    await assert.rejects(
        () => loginFromRequest({
            email: "teacher@example.com",
            teacherCode: "TCH1",
            password: "secret",
            classCode: "F1"
        }),
        (error) => error.statusCode === 400
    );
});
