/**
 * Safari compatibility utilities
 * These functions help ensure compatibility with older Safari versions
 */

/**
 * Safe property access that works in older Safari versions
 * @param {Object} obj - The object to access
 * @param {string} path - The property path (e.g., 'data.user.name')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} The property value or default value
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  try {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  } catch (error) {
    console.warn('Error in safeGet:', error);
    return defaultValue;
  }
};

/**
 * Safe array check that works in older browsers
 * @param {*} value - Value to check
 * @returns {boolean} True if value is an array
 */
export const safeIsArray = (value) => {
  try {
    return Array.isArray(value);
  } catch (error) {
    return Object.prototype.toString.call(value) === '[object Array]';
  }
};

/**
 * Safe string check
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a string
 */
export const safeIsString = (value) => {
  return typeof value === 'string';
};

/**
 * Safe object check
 * @param {*} value - Value to check
 * @returns {boolean} True if value is an object (but not null or array)
 */
export const safeIsObject = (value) => {
  return value !== null && typeof value === 'object' && !safeIsArray(value);
};

/**
 * Detect if we're in Safari private browsing mode
 * @returns {boolean} True if in private browsing
 */
export const isPrivateBrowsing = () => {
  try {
    // Safari private browsing detection
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('__private_test__', '1');
      localStorage.removeItem('__private_test__');
      return false;
    }
    return true;
  } catch (error) {
    // If localStorage throws an error, we're likely in private mode
    return true;
  }
};

/**
 * Safe localStorage access with private browsing fallback
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} The stored value or default value
 */
export const safeGetLocalStorage = (key, defaultValue = null) => {
  try {
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      return item !== null && item !== 'undefined' && item !== 'null' ? item : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn('Error accessing localStorage (possibly private browsing):', error);
    // In private browsing, try to get from sessionStorage as fallback
    try {
      if (typeof sessionStorage !== 'undefined') {
        const item = sessionStorage.getItem(key);
        return item !== null && item !== 'undefined' && item !== 'null' ? item : defaultValue;
      }
    } catch (sessionError) {
      console.warn('SessionStorage also unavailable:', sessionError);
    }
    return defaultValue;
  }
};

/**
 * Safe localStorage setter with private browsing fallback
 * @param {string} key - The localStorage key
 * @param {*} value - The value to store
 * @returns {boolean} True if successful
 */
export const safeSetLocalStorage = (key, value) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Error setting localStorage (possibly private browsing):', error);
    // In private browsing, try to use sessionStorage as fallback
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value);
        return true;
      }
    } catch (sessionError) {
      console.warn('SessionStorage also unavailable:', sessionError);
    }
    return false;
  }
};

/**
 * Safe event listener addition
 * @param {Element} element - The element to add listener to
 * @param {string} event - The event name
 * @param {Function} handler - The event handler
 * @returns {boolean} True if successful
 */
export const safeAddEventListener = (element, event, handler) => {
  try {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Error adding event listener:', error);
    return false;
  }
};

/**
 * Safe event listener removal
 * @param {Element} element - The element to remove listener from
 * @param {string} event - The event name
 * @param {Function} handler - The event handler
 * @returns {boolean} True if successful
 */
export const safeRemoveEventListener = (element, event, handler) => {
  try {
    if (element && typeof element.removeEventListener === 'function') {
      element.removeEventListener(event, handler);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Error removing event listener:', error);
    return false;
  }
};

/**
 * Safe console logging that won't break in production
 * @param {string} level - The log level (log, warn, error)
 * @param {...*} args - Arguments to log
 */
export const safeConsole = (level, ...args) => {
  try {
    if (typeof console !== 'undefined' && console[level]) {
      console[level](...args);
    }
  } catch (error) {
    // Silently fail if console is not available
  }
};

/**
 * Safe delay function for Safari timing issues
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const safeDelay = (ms) => {
  return new Promise(resolve => {
    try {
      setTimeout(resolve, ms);
    } catch (error) {
      // If setTimeout fails, resolve immediately
      resolve();
    }
  });
};

/**
 * Safe page reload with delay for Safari
 * @param {number} delay - Delay before reload in ms
 */
export const safeReload = (delay = 1000) => {
  try {
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    }, delay);
  } catch (error) {
    console.warn('Error reloading page:', error);
  }
};

export default {
  safeGet,
  safeIsArray,
  safeIsString,
  safeIsObject,
  isPrivateBrowsing,
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeAddEventListener,
  safeRemoveEventListener,
  safeConsole,
  safeDelay,
  safeReload
};
