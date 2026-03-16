const stopwords = require("./stopwords");

const normalizeText = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (text = "") => {
  const normalized = normalizeText(text);
  return normalized
    .split(" ")
    .filter((token) => token && !stopwords.has(token));
};

module.exports = {
  normalizeText,
  tokenize
};
