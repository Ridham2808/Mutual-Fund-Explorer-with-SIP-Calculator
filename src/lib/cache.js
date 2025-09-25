// Simple in-memory cache with TTL
const cacheStore = new Map();

export function setCache(key, value, ttlMs) {
	const expiresAt = Date.now() + ttlMs;
	cacheStore.set(key, { value, expiresAt });
}

export function getCache(key) {
	const entry = cacheStore.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		cacheStore.delete(key);
		return null;
	}
	return entry.value;
}

export function delCache(key) {
	cacheStore.delete(key);
}

export function clearCache() {
	cacheStore.clear();
}

export const TTL = {
	HOUR_12: 12 * 60 * 60 * 1000,
	HOUR_24: 24 * 60 * 60 * 1000,
};


