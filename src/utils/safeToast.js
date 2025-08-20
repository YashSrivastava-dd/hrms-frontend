import { toast } from "react-toastify";

// Toast ID tracking to prevent duplicates
const activeToastIds = new Set();
const toastQueue = new Map();

// Centralized toast configuration
const DEFAULT_CONFIG = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  preventDuplicates: true,
  closeButton: true,
  newestOnTop: true,
  rtl: false,
  limit: 3, // Limit concurrent toasts
};

// Enhanced safe toast utility with duplicate prevention
const safeToast = {
  success: (message, config = {}) => {
    try {
      // Check if similar toast already exists
      const toastKey = `success-${message}`;
      if (toastQueue.has(toastKey)) {
        return toastQueue.get(toastKey);
      }

      const toastId = toast.success(message, {
        ...DEFAULT_CONFIG,
        ...config,
        toastId: config.toastId || toastKey,
        onClose: () => {
          activeToastIds.delete(toastId);
          toastQueue.delete(toastKey);
        },
      });
      
      if (toastId) {
        activeToastIds.add(toastId);
        toastQueue.set(toastKey, toastId);
      }
      
      return toastId;
    } catch (error) {
      console.warn('Safe toast success error:', error);
      return null;
    }
  },
  
  error: (message, config = {}) => {
    try {
      // Check if similar toast already exists
      const toastKey = `error-${message}`;
      if (toastQueue.has(toastKey)) {
        return toastQueue.get(toastKey);
      }

      const toastId = toast.error(message, {
        ...DEFAULT_CONFIG,
        ...config,
        toastId: config.toastId || toastKey,
        onClose: () => {
          activeToastIds.delete(toastId);
          toastQueue.delete(toastKey);
        },
      });
      
      if (toastId) {
        activeToastIds.add(toastId);
        toastQueue.set(toastKey, toastId);
      }
      
      return toastId;
    } catch (error) {
      console.warn('Safe toast error:', error);
      return null;
    }
  },
  
  warning: (message, config = {}) => {
    try {
      const toastKey = `warning-${message}`;
      if (toastQueue.has(toastKey)) {
        return toastQueue.get(toastKey);
      }

      const toastId = toast.warning(message, {
        ...DEFAULT_CONFIG,
        ...config,
        toastId: config.toastId || toastKey,
        onClose: () => {
          activeToastIds.delete(toastId);
          toastQueue.delete(toastKey);
        },
      });
      
      if (toastId) {
        activeToastIds.add(toastId);
        toastQueue.set(toastKey, toastId);
      }
      
      return toastId;
    } catch (error) {
      console.warn('Safe toast warning error:', error);
      return null;
    }
  },
  
  info: (message, config = {}) => {
    try {
      const toastKey = `info-${message}`;
      if (toastQueue.has(toastKey)) {
        return toastQueue.get(toastKey);
      }

      const toastId = toast.info(message, {
        ...DEFAULT_CONFIG,
        ...config,
        toastId: config.toastId || toastKey,
        onClose: () => {
          activeToastIds.delete(toastId);
          toastQueue.delete(toastKey);
        },
      });
      
      if (toastId) {
        activeToastIds.add(toastId);
        toastQueue.set(toastKey, toastId);
      }
      
      return toastId;
    } catch (error) {
      console.warn('Safe toast info error:', error);
      return null;
    }
  },
  
  dismiss: (toastId = null) => {
    try {
      if (toastId) {
        toast.dismiss(toastId);
        activeToastIds.delete(toastId);
        // Remove from queue
        for (const [key, id] of toastQueue.entries()) {
          if (id === toastId) {
            toastQueue.delete(key);
            break;
          }
        }
      } else {
        // Dismiss all active toasts
        activeToastIds.forEach(id => {
          try {
            toast.dismiss(id);
          } catch (e) {
            console.warn('Error dismissing toast:', e);
          }
        });
        activeToastIds.clear();
        toastQueue.clear();
      }
    } catch (error) {
      console.warn('Safe toast dismiss error:', error);
    }
  },
  
  loading: (message, config = {}) => {
    try {
      const toastId = toast.loading(message, {
        ...DEFAULT_CONFIG,
        ...config,
        closeOnClick: false,
        draggable: false,
        autoClose: false,
        toastId: config.toastId || `loading-${Date.now()}`,
        onClose: () => {
          activeToastIds.delete(toastId);
        },
      });
      
      if (toastId) {
        activeToastIds.add(toastId);
      }
      
      return toastId;
    } catch (error) {
      console.warn('Safe toast loading error:', error);
      return null;
    }
  },

  // Clear all toasts safely
  clear: () => {
    try {
      toast.clearWaitingQueue();
      toast.dismiss();
      activeToastIds.clear();
      toastQueue.clear();
    } catch (error) {
      console.warn('Safe toast clear error:', error);
    }
  },

  // Update existing toast
  update: (toastId, options) => {
    try {
      if (toastId && activeToastIds.has(toastId)) {
        toast.update(toastId, options);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Safe toast update error:', error);
      return false;
    }
  },

  // Check if toast is active
  isActive: (toastId) => {
    return activeToastIds.has(toastId);
  }
};

export default safeToast;
