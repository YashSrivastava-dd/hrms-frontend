/**
 * Format a number as Indian Rupees with proper formatting
 * @param {number|string} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatIndianRupees = (amount, showSymbol = true) => {
  if (!amount || amount === '---' || amount === null || amount === undefined) {
    return '---';
  }

  // Convert to number if it's a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '---';
  }

  // Format with Indian numbering system (lakhs, crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  let formatted = formatter.format(numericAmount);
  
  // Remove the "INR" text and keep only the ₹ symbol and number
  formatted = formatted.replace('INR', '').trim();
  
  // If user doesn't want the symbol, remove it
  if (!showSymbol) {
    formatted = formatted.replace('₹', '').trim();
  }

  return formatted;
};

/**
 * Format salary with abbreviated units (K for thousands, L for lakhs, Cr for crores)
 * @param {number|string} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns {string} Formatted salary string
 */
export const formatSalary = (amount, showSymbol = true) => {
  if (!amount || amount === '---' || amount === null || amount === undefined) {
    return '---';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '---';
  }

  const symbol = showSymbol ? '₹' : '';
  
  if (numericAmount >= 10000000) { // 1 Crore
    return `${symbol}${(numericAmount / 10000000).toFixed(1)} Cr`;
  } else if (numericAmount >= 100000) { // 1 Lakh
    return `${symbol}${(numericAmount / 100000).toFixed(1)} L`;
  } else if (numericAmount >= 1000) { // 1 Thousand
    return `${symbol}${(numericAmount / 1000).toFixed(1)} K`;
  } else {
    return `${symbol}${numericAmount.toLocaleString('en-IN')}`;
  }
};

/**
 * Format basic salary display (full amount with comma separators)
 * @param {number|string} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns {string} Formatted salary string
 */
export const formatBasicSalary = (amount, showSymbol = true) => {
  if (!amount || amount === '---' || amount === null || amount === undefined) {
    return '---';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '---';
  }

  const symbol = showSymbol ? '₹' : '';
  return `${symbol}${numericAmount.toLocaleString('en-IN')}`;
};
