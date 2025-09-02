/**
 * Safe alert utility that prevents undefined/null messages
 * @param {string} message - Message to display
 * @param {string} fallback - Fallback message if main message is invalid
 */
export const safeAlert = (message, fallback = "Operation completed") => {
  const validMessage = message && message !== 'undefined' && message !== null 
    ? String(message).trim() 
    : fallback;
  
  if (validMessage) {
    alert(validMessage);
  }
};

export default safeAlert;
