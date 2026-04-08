const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

const callOpenAI = async ({ input, maxOutputTokens = 500, temperature = 0.2 }) => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input,
      max_output_tokens: maxOutputTokens,
      temperature
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error: ${text}`);
  }

  return response.json();
};

const extractText = (response) => {
  const outputs = response.output || [];
  const message = outputs.find((item) => item.type === "message");
  if (!message) return "";
  const content = message.content || [];
  const textPart = content.find((part) => part.type === "output_text");
  return textPart?.text || "";
};

const safeJson = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
};

const generateFeedback = async ({ question, idealAnswer, userAnswer, similarityScore }) => {
  const prompt = [
    "You are InterviewAI. Provide concise, professional feedback.",
    "Return JSON only with keys: feedback, strengths, improvements, confidence_label, keywords.",
    `Question: ${question}`,
    `Ideal Answer: ${idealAnswer}`,
    `User Answer: ${userAnswer}`,
    `Similarity Score: ${similarityScore}`
  ].join("\n");

  const response = await callOpenAI({ input: prompt, maxOutputTokens: 300, temperature: 0.2 });
  const text = extractText(response);
  return safeJson(text);
};

const generateQuestionsFromSkills = async ({ skills }) => {
  const skillList = skills.map((skill) => skill.skill || skill).filter(Boolean);
  const prompt = [
    "You are InterviewAI. Create 5 interview questions based on the skills.",
    "Return JSON only with key: questions (array of objects: question, idealAnswer, keywords).",
    `Skills: ${skillList.join(", ")}`
  ].join("\n");

  const response = await callOpenAI({ input: prompt, maxOutputTokens: 500, temperature: 0.3 });
  const text = extractText(response);
  return safeJson(text);
};

module.exports = {
  callOpenAI,
  generateFeedback,
  generateQuestionsFromSkills
};
