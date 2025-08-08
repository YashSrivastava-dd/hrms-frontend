import { toast } from "react-toastify";

// Safe toast utility function to prevent runtime errors
const safeToast = {
  success: (message, config = {}) => {
    try {
      toast.success(message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        ...config
      });
    } catch (error) {
      console.warn('Safe toast success error:', error);
    }
  },
  
  error: (message, config = {}) => {
    try {
      toast.error(message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        ...config
      });
    } catch (error) {
      console.warn('Safe toast error:', error);
    }
  },
  
  warning: (message, config = {}) => {
    try {
      toast.warning(message, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        ...config
      });
    } catch (error) {
      console.warn('Safe toast warning error:', error);
    }
  },
  
  info: (message, config = {}) => {
    try {
      toast.info(message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        ...config
      });
    } catch (error) {
      console.warn('Safe toast info error:', error);
    }
  },
  
  dismiss: (toastId = null) => {
    try {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    } catch (error) {
      console.warn('Safe toast dismiss error:', error);
    }
  },
  
  loading: (message, config = {}) => {
    try {
      return toast.loading(message, {
        position: "top-center",
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        theme: "colored",
        ...config
      });
    } catch (error) {
      console.warn('Safe toast loading error:', error);
      return null;
    }
  }
};

export default safeToast;
