const { extractSkills } = require("../src/services/resumeParser");

describe("resume parser", () => {
  test("extracts skills from text", () => {
    const skills = extractSkills("Experienced in React, Node, and MongoDB.");
    const skillNames = skills.map((s) => s.skill.toLowerCase());
    expect(skillNames).toContain("react");
    expect(skillNames).toContain("node");
  });
});
