import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfirmationDialog from '../components/CommonComponent/ConfirmationDialog';

/**
 * Show a custom confirmation dialog
 * @param {Object} options - Configuration options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog message
 * @param {string} options.confirmText - Confirm button text
 * @param {string} options.cancelText - Cancel button text
 * @param {string} options.type - Dialog type (warning, danger, info, success)
 * @returns {Promise<boolean>} - Returns true if confirmed, false if cancelled
 */
export const showConfirmationDialog = (options = {}) => {
  return new Promise((resolve) => {
    const {
      title = "Confirm Action",
      message = "Are you sure you want to proceed?",
      confirmText = "OK",
      cancelText = "Cancel",
      type = "warning"
    } = options;

    // Create a container for the dialog
    const container = document.createElement('div');
    container.id = 'confirmation-dialog-container';
    document.body.appendChild(container);

    const root = createRoot(container);

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleClose = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      root.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    // Render the dialog
    root.render(
      <ConfirmationDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        type={type}
      />
    );
  });
};

/**
 * Convenience function for dangerous actions
 */
export const showDangerConfirmation = (message, title = "Confirm Action") => {
  return showConfirmationDialog({
    title,
    message,
    type: 'danger',
    confirmText: 'Yes, Continue',
    cancelText: 'Cancel'
  });
};

/**
 * Convenience function for warning actions
 */
export const showWarningConfirmation = (message, title = "Confirm Action") => {
  return showConfirmationDialog({
    title,
    message,
    type: 'warning',
    confirmText: 'Yes, Continue',
    cancelText: 'Cancel'
  });
};

export default showConfirmationDialog;
