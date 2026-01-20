/**
 * Utility functions for formatting
 */

export function formatAddress(address: string, length = 6): string {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function formatBalance(balance: string | number, decimals = 4): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
}

/**
 * Format token amount from bigint to decimal string
 * Converts bigint value with given decimals to human-readable format
 * Similar to reference implementation: max 6 decimals, trim trailing zeros
 * @param value - The bigint value from contract (e.g., balanceOf result)
 * @param decimals - Number of decimal places (e.g., 18 for ETH, 6 for USDT)
 * @returns Formatted decimal string with max 6 decimals (e.g., "1234.567890")
 */
export function formatTokenAmount(value: bigint, decimals: number): string {
  if (value === 0n) return '0';

  // Convert bigint to string with proper decimal places
  const divisor = BigInt(10 ** decimals);
  const wholePart = value / divisor;
  const fractionalPart = value % divisor;

  // Handle fractional part - pad with zeros if needed
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');

  // Take up to 6 decimals (or less if decimals < 6)
  // This matches the reference implementation behavior
  const maxDecimals = Math.min(6, decimals);
  let fractionalDisplay = fractionalStr.slice(0, maxDecimals);

  // Trim trailing zeros
  fractionalDisplay = fractionalDisplay.replace(/0+$/, '');

  // Return formatted string
  if (fractionalDisplay === '') {
    return wholePart.toString();
  }

  return `${wholePart.toString()}.${fractionalDisplay}`;
}
