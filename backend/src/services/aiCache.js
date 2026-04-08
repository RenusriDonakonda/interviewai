const crypto = require("crypto");

const cache = new Map();
const DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour

const makeKey = (parts) => {
  const hash = crypto.createHash("sha256");
  parts.forEach((part) => hash.update(String(part)));
  return hash.digest("hex");
};

const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCache = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

module.exports = {
  makeKey,
  getCache,
  setCache
};
