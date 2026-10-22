/**
 * Currency and Integer-Paise Accounting Utilities
 * Ensures zero floating-point arithmetic drift by storing all monetary amounts as integers in paise.
 * 1 Rupee = 100 Paise (e.g., ₹500.00 = 50000 paise).
 */

/**
 * Format an integer paise value into Indian Rupee string: ₹X,XXX.XX
 * @param {number} paise - Amount in paise (integer)
 * @param {boolean} showSymbol - Whether to prepend the ₹ symbol
 * @returns {string} Formatted currency string
 */
export function formatPaise(paise = 0, showSymbol = true) {
  const safePaise = Math.round(Number(paise) || 0);
  const rupees = safePaise / 100;
  
  // Format to standard Indian number format with 2 decimals
  const formatted = rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Converts a rupee float or string input to an integer in paise.
 * @param {number|string} rupees - e.g. 250.50 or "250.50"
 * @returns {number} Integer paise, e.g. 25050
 */
export function rupeesToPaise(rupees = 0) {
  if (typeof rupees === 'string') {
    // Strip any commas or currency symbols
    rupees = rupees.replace(/[^\d.-]/g, '');
  }
  const num = parseFloat(rupees);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Converts integer paise to a plain rupee number
 * @param {number} paise 
 * @returns {number} Rupee float
 */
export function paiseToRupees(paise = 0) {
  return (Math.round(Number(paise) || 0)) / 100;
}

/**
 * Calculate line item totals, discount, and tax (all in integer paise)
 */
export function calculateInvoiceSummary(items = [], discountValue = 0, discountType = 'flat', taxPercent = 0) {
  // Sum of all items in paise
  const subtotalPaise = items.reduce((sum, item) => sum + (Number(item.amountPaise) || 0), 0);

  // Calculate discount in paise
  let discountPaise = 0;
  if (discountType === 'percent') {
    discountPaise = Math.round((subtotalPaise * (Number(discountValue) || 0)) / 100);
  } else {
    // flat discount in rupees converted to paise
    discountPaise = rupeesToPaise(discountValue);
  }
  // Discount cannot exceed subtotal
  discountPaise = Math.min(discountPaise, subtotalPaise);

  const discountedSubtotal = subtotalPaise - discountPaise;

  // Calculate tax in paise (default taxPercent is 0)
  const taxPaise = Math.round((discountedSubtotal * (Number(taxPercent) || 0)) / 100);

  // Total invoice amount
  const totalPaise = discountedSubtotal + taxPaise;

  return {
    subtotalPaise,
    discountPaise,
    taxPaise,
    totalPaise
  };
}
