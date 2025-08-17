/**
 * Format a numeric value as Indian Rupee currency.
 *
 * @param {number|string} value - The amount to format.
 * @param {object} opts
 * @param {boolean} [opts.compact=false] - Use compact notation (e.g. ₹1.2L, ₹3.4Cr).
 * @param {number} [opts.minimumFractionDigits] - Override min fraction digits.
 * @param {number} [opts.maximumFractionDigits] - Override max fraction digits.
 * @param {boolean} [opts.stripTrailingZeros=false] - Remove .00 if integer.
 * @returns {string}
 */
export function formatINR(
  value,
  {
    compact = false,
    minimumFractionDigits,
    maximumFractionDigits,
    stripTrailingZeros = false,
  } = {}
) {
  if (value === null || value === undefined || value === "") return "₹0";
  let num =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  if (Number.isNaN(num)) return "₹0";

  // Defaults
  const minFD =
    minimumFractionDigits !== undefined
      ? minimumFractionDigits
      : num % 1 === 0
      ? 0
      : 2;
  const maxFD =
    maximumFractionDigits !== undefined
      ? maximumFractionDigits
      : num % 1 === 0
      ? 0
      : 2;

  // Compact manual (Intl compact for en-IN is still limited for L/Cr preference)
  if (compact) {
    const abs = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    if (abs >= 1_00_00_000) {
      // Crore
      const v = +(abs / 1_00_00_000).toFixed(2);
      return `${sign}₹${v}${stripTrailingZeros ? stripZeros(v) : ""}Cr`;
    }
    if (abs >= 1_00_000) {
      // Lakh
      const v = +(abs / 1_00_000).toFixed(2);
      return `${sign}₹${v}${stripTrailingZeros ? stripZeros(v) : ""}L`;
    }
    if (abs >= 1_000) {
      // Thousand (optional K)
      const v = +(abs / 1_000).toFixed(2);
      return `${sign}₹${v}${stripTrailingZeros ? stripZeros(v) : ""}K`;
    }
  }

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    minimumFractionDigits: minFD,
    maximumFractionDigits: maxFD,
  }).format(num);

  if (stripTrailingZeros && formatted.includes(".")) {
    return formatted.replace(/\.00$/, "");
  }
  return formatted;
}

/**
 * Format with Indian digit grouping without currency symbol.
 * @param {number|string} value
 * @returns {string}
 */
export function formatIndianNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  let num =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  if (Number.isNaN(num)) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Internal helper to strip .00 / .0
 */
function stripZeros(v) {
  return String(v)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
}

// Default export alias
export default formatINR;
