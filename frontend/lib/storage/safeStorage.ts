import { logger } from '@/lib/logger';

/**
 * Safe localStorage wrapper functions that handle errors gracefully.
 * Handles cases where localStorage is unavailable (private mode, disabled, quota exceeded).
 */

/**
 * Safely gets an item from localStorage.
 * Returns null if localStorage is unavailable or the key doesn't exist.
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    // localStorage may be unavailable in private mode or disabled
    if (process.env.NODE_ENV === 'development') {
      logger.warn('localStorage.getItem failed:', error);
    }
    return null;
  }
}

/**
 * Safely sets an item in localStorage.
 * Returns true if successful, false otherwise.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        // Try to free up space by removing oldest items
        try {
          // Get all keys and try to remove some old ones
          const keys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('carto-art-')) {
              keys.push(k);
            }
          }
          
          // Remove oldest items (simple strategy: remove first half)
          const itemsToRemove = Math.floor(keys.length / 2);
          for (let i = 0; i < itemsToRemove; i++) {
            localStorage.removeItem(keys[i]);
          }
          
          // Try again
          try {
            localStorage.setItem(key, value);
            return true;
          } catch {
            // Still failed, notify user would be ideal but we'll just return false
            if (process.env.NODE_ENV === 'development') {
              logger.warn('localStorage quota exceeded even after cleanup');
            }
            return false;
          }
        } catch {
          // Cleanup failed, return false
          return false;
        }
      }
    }
    
    // Other errors (private mode, disabled, etc.)
    if (process.env.NODE_ENV === 'development') {
      logger.warn('localStorage.setItem failed:', error);
    }
    return false;
  }
}

/**
 * Safely removes an item from localStorage.
 * Returns true if successful or if the key didn't exist, false on error.
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('localStorage.removeItem failed:', error);
    }
    return false;
  }
}

/**
 * Checks if localStorage is available.
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

