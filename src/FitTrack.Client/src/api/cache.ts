const CACHE_PREFIX = "fittrack-cache";
const DEFAULT_TTL_MS = 30 * 60 * 1000;

type CacheEnvelope<T> = {
  savedAt: number;
  value: T;
};

const getUserCacheScope = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return "anonymous";

  try {
    const user = JSON.parse(storedUser) as { userId?: string; email?: string };
    return user.userId ?? user.email ?? "anonymous";
  } catch {
    return "anonymous";
  }
};

export const cacheKey = (...parts: Array<string | number>) =>
  [CACHE_PREFIX, getUserCacheScope(), ...parts].join(":");

export const readCache = <T>(key: string, ttlMs = DEFAULT_TTL_MS): T | null => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached) as CacheEnvelope<T>;
    if (Date.now() - parsed.savedAt > ttlMs) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const writeCache = <T>(key: string, value: T) => {
  const envelope: CacheEnvelope<T> = {
    savedAt: Date.now(),
    value,
  };

  localStorage.setItem(key, JSON.stringify(envelope));
};

export const invalidateCachePrefix = (prefixParts: Array<string | number>) => {
  const scopedPrefix = cacheKey(...prefixParts);

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(scopedPrefix)) {
      localStorage.removeItem(key);
    }
  });
};

export const clearFitTrackCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};
