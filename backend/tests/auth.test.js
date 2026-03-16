const jwt = require("jsonwebtoken");

describe("auth token", () => {
  test("creates and verifies token", () => {
    const token = jwt.sign({ id: "123", role: "user" }, "secret", { expiresIn: "1h" });
    const decoded = jwt.verify(token, "secret");
    expect(decoded.id).toBe("123");
  });
});
