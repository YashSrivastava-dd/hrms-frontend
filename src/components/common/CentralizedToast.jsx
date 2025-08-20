import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Centralized ToastContainer to prevent multiple instances
const CentralizedToast = () => {
  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any remaining toasts when component unmounts
      try {
        if (window.toast) {
          window.toast.clearWaitingQueue();
          window.toast.dismiss();
        }
      } catch (error) {
        console.warn('Toast cleanup error:', error);
      }
    };
  }, []);

  return (
    <ToastContainer
      position="top-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={true}
      draggable={true}
      pauseOnHover={true}
      theme="colored"
      preventDuplicates={true}
      closeButton={true}
      limit={5} // Limit number of toasts to prevent overwhelming
      enableMultiContainer={false} // Disable multi-container to prevent conflicts
      toastClassName="toast-notification"
      bodyClassName="toast-body"
      progressClassName="toast-progress"
    />
  );
};

export default CentralizedToast;
