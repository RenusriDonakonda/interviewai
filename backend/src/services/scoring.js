const { tokenize } = require("../utils/text");

const buildTf = (tokens) => {
  const tf = {};
  tokens.forEach((token) => {
    tf[token] = (tf[token] || 0) + 1;
  });
  const total = tokens.length || 1;
  Object.keys(tf).forEach((key) => {
    tf[key] = tf[key] / total;
  });
  return tf;
};

const buildIdf = (documents) => {
  const idf = {};
  const totalDocs = documents.length || 1;
  const docCounts = {};

  documents.forEach((tokens) => {
    const unique = new Set(tokens);
    unique.forEach((token) => {
      docCounts[token] = (docCounts[token] || 0) + 1;
    });
  });

  Object.keys(docCounts).forEach((token) => {
    idf[token] = Math.log((totalDocs + 1) / (docCounts[token] + 1)) + 1;
  });

  return idf;
};

const vectorize = (tf, idf) => {
  const vector = {};
  Object.keys(idf).forEach((token) => {
    vector[token] = (tf[token] || 0) * idf[token];
  });
  return vector;
};

const cosineSimilarity = (vecA, vecB) => {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  keys.forEach((key) => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
};

const scoreAnswer = (userAnswer, idealAnswer, keywords = []) => {
  const userTokens = tokenize(userAnswer);
  const idealTokens = tokenize(idealAnswer);
  const idf = buildIdf([userTokens, idealTokens]);
  const userVector = vectorize(buildTf(userTokens), idf);
  const idealVector = vectorize(buildTf(idealTokens), idf);
  const similarity = cosineSimilarity(userVector, idealVector);
  const score = Math.round(similarity * 100);

  const keywordHits = keywords.filter((keyword) =>
    userTokens.includes(keyword.toLowerCase())
  );

  const lengthScore = Math.min(1, userTokens.length / 120);
  const densityScore = keywords.length ? keywordHits.length / keywords.length : 0.5;
  const confidence = Math.round(((lengthScore * 0.4) + (densityScore * 0.2) + (similarity * 0.4)) * 100);

  return {
    similarityScore: score,
    confidenceScore: confidence,
    keywordsFound: keywordHits
  };
};

const scoreLabel = (score) => {
  if (score >= 90) return { label: "Outstanding", tone: "cosmic-purple" };
  if (score >= 75) return { label: "Excellent", tone: "electric-blue" };
  if (score >= 60) return { label: "Good", tone: "aurora-green" };
  if (score >= 40) return { label: "Developing", tone: "nebula-orange" };
  return { label: "Practice More", tone: "mars-red" };
};

module.exports = {
  scoreAnswer,
  scoreLabel
};
