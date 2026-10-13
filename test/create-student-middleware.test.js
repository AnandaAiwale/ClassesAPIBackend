const assert = require("node:assert/strict");
const { test } = require("node:test");

const studentsRoutes = require("../src/modules/students/students.routes");

function routeStack(path, method) {
    const layer = studentsRoutes.stack.find(
        (item) =>
            item.route &&
            item.route.path === path &&
            item.route.methods[method]
    );

    assert.ok(layer, `Route ${method.toUpperCase()} ${path} should exist`);
    return layer.route.stack.map((item) => item.name);
}

test("create student does not require an existing student id", () => {
    const names = routeStack("/", "post");

    assert.ok(names.includes("requireTeacher"));
    assert.ok(names.includes("requireClassTeacher"));
    assert.ok(names.includes("requireOwnClass"));
    assert.ok(names.includes("createStudent"));
    assert.equal(names.includes("requireStudentOwnClass"), false);
});

test("list students by class does not require an existing student id", () => {
    const names = routeStack("/class/:classId", "get");

    assert.ok(names.includes("requireOwnClass"));
    assert.equal(names.includes("requireStudentOwnClass"), false);
});

test("update student still checks the student belongs to the class teacher", () => {
    const names = routeStack("/:id", "put");

    assert.ok(names.includes("requireStudentOwnClass"));
});
