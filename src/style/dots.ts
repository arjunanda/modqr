/**
 * Dots Style Implementation
 * Renders modules as circles
 */

/**
 * Apply dots style to matrix rendering
 * This is a helper for renderers to identify which modules should be rendered as dots
 */
export function shouldRenderAsDot(
  row: number,
  col: number,
  matrixSize: number
): boolean {
  // Keep finder patterns as squares for better scanability
  return !isInFinderPattern(row, col, matrixSize);
}

/**
 * Check if module is in finder pattern
 */
function isInFinderPattern(row: number, col: number, size: number): boolean {
  // Top-left finder (0-6, 0-6)
  if (row < 7 && col < 7) return true;
  
  // Top-right finder (0-6, size-7 to size-1)
  if (row < 7 && col >= size - 7) return true;
  
  // Bottom-left finder (size-7 to size-1, 0-6)
  if (row >= size - 7 && col < 7) return true;
  
  return false;
}

/**
 * Get dot radius as a fraction of module size
 */
export function getDotRadius(): number {
  return 0.45; // 45% of module size for visual appeal
}
