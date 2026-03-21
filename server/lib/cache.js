/**
 * Simple in-memory TTL cache.
 * Prevents repeated MongoDB round-trips for frequently read, rarely changed data.
 */

const store = new Map();

/**
 * @param {string} key
 * @param {number} [ttlMs=60000] TTL in milliseconds (default 60s)
 */
export function getCache(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.data;
}

export function setCache(key, data, ttlMs = 60_000) {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/** Invalidate all keys that start with a given prefix */
export function invalidateCache(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

export function clearCache() {
    store.clear();
}
