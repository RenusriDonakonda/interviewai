const { scoreAnswer } = require("../src/services/scoring");

describe("scoring", () => {
  test("computes similarity score between answers", () => {
    const result = scoreAnswer("React uses hooks for state", "React uses hooks for state management", ["react", "hooks"]);
    expect(result.similarityScore).toBeGreaterThan(40);
    expect(result.confidenceScore).toBeGreaterThan(30);
  });
});
