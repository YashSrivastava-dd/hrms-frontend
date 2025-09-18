import React from 'react';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message, 
  confirmText = "OK", 
  cancelText = "Cancel",
  type = "warning", // warning, danger, info, success
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <FiX className="w-6 h-6" />,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-200'
        };
      case 'success':
        return {
          icon: <FiCheck className="w-6 h-6" />,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          borderColor: 'border-green-200'
        };
      case 'info':
        return {
          icon: <FiAlertTriangle className="w-6 h-6" />,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          borderColor: 'border-blue-200'
        };
      default: // warning
        return {
          icon: <FiAlertTriangle className="w-6 h-6" />,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-200'
        };
    }
  };

  const { icon, iconBg, iconColor, confirmBg, borderColor } = getIconAndColors();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md border ${borderColor} animate-in fade-in-0 zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200">
          <div className={`p-3 rounded-full ${iconBg}`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${confirmBg}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
