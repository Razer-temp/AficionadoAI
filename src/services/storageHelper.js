/**
 * Safe local storage wrappers with error handling.
 */
export function safeGetLocal(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err.message);
    return fallback;
  }
}

export function safeSetLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed to write ${key}:`, err.message);
  }
}
