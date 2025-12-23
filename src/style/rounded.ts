/**
 * Rounded Style Implementation
 * Renders modules with rounded corners
 */

import type { QRMatrix } from '../core/matrix.js';

/**
 * Get corner radius as a fraction of module size
 */
export function getCornerRadius(): number {
  return 0.4; // 40% of module size
}

/**
 * Find adjacent modules to determine which corners should be rounded
 * Returns an object indicating which corners should be rounded
 */
export function getCornerRounding(
  matrix: QRMatrix,
  row: number,
  col: number
): {
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  bottomRight: boolean;
} {
  const size = matrix.length;
  
  // Check adjacent modules
  const hasTop = row > 0 && matrix[row - 1][col];
  const hasBottom = row < size - 1 && matrix[row + 1][col];
  const hasLeft = col > 0 && matrix[row][col - 1];
  const hasRight = col < size - 1 && matrix[row][col + 1];
  
  // Round corners that are exposed (not adjacent to another dark module)
  return {
    topLeft: !hasTop && !hasLeft,
    topRight: !hasTop && !hasRight,
    bottomLeft: !hasBottom && !hasLeft,
    bottomRight: !hasBottom && !hasRight,
  };
}

/**
 * Check if modules should be merged for smoother appearance
 * Returns true if the current module and its neighbor should be rendered as one shape
 */
export function shouldMergeModules(
  matrix: QRMatrix,
  row: number,
  col: number,
  direction: 'right' | 'down'
): boolean {
  const size = matrix.length;
  
  if (!matrix[row][col]) return false;
  
  if (direction === 'right') {
    return col < size - 1 && matrix[row][col + 1];
  } else {
    return row < size - 1 && matrix[row + 1][col];
  }
}

/**
 * Generate SVG path for a rounded rectangle
 */
export function generateRoundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  corners: {
    topLeft: boolean;
    topRight: boolean;
    bottomLeft: boolean;
    bottomRight: boolean;
  }
): string {
  const r = radius;
  const tlr = corners.topLeft ? r : 0;
  const trr = corners.topRight ? r : 0;
  const brr = corners.bottomRight ? r : 0;
  const blr = corners.bottomLeft ? r : 0;
  
  let path = `M${x + tlr},${y}`;
  
  // Top edge
  path += `h${width - tlr - trr}`;
  
  // Top-right corner
  if (trr > 0) {
    path += `a${trr},${trr} 0 0 1 ${trr},${trr}`;
  }
  
  // Right edge
  path += `v${height - trr - brr}`;
  
  // Bottom-right corner
  if (brr > 0) {
    path += `a${brr},${brr} 0 0 1 -${brr},${brr}`;
  }
  
  // Bottom edge
  path += `h-${width - brr - blr}`;
  
  // Bottom-left corner
  if (blr > 0) {
    path += `a${blr},${blr} 0 0 1 -${blr},-${blr}`;
  }
  
  // Left edge
  path += `v-${height - blr - tlr}`;
  
  // Top-left corner
  if (tlr > 0) {
    path += `a${tlr},${tlr} 0 0 1 ${tlr},-${tlr}`;
  }
  
  path += 'z';
  
  return path;
}
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class RoundedStyle implements QRStyleRenderer {
  drawModule(
    x: number,
    y: number,
    row: number,
    col: number,
    size: number,
    matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const radius = size * 0.4;
    const corners = getCornerRounding(matrix, row, col);
    const path = generateRoundedRectPath(x, y, size, size, radius, corners);
    return `<path d="${path}" fill="${options.foreground}"/>`;
  }

  drawCanvas(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    row: number,
    col: number,
    size: number,
    matrix: QRMatrix,
    options: StyleOptions
  ): void {
    const radius = size * 0.4;
    const corners = getCornerRounding(matrix, row, col);
    
    const tl = corners.topLeft ? radius : 0;
    const tr = corners.topRight ? radius : 0;
    const bl = corners.bottomLeft ? radius : 0;
    const br = corners.bottomRight ? radius : 0;

    ctx.fillStyle = options.foreground;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + size - tr, y);
    if (tr > 0) ctx.arcTo(x + size, y, x + size, y + tr, tr);
    ctx.lineTo(x + size, y + size - br);
    if (br > 0) ctx.arcTo(x + size, y + size, x + size - br, y + size, br);
    ctx.lineTo(x + bl, y + size);
    if (bl > 0) ctx.arcTo(x, y + size, x, y + size - bl, bl);
    ctx.lineTo(x, y + tl);
    if (tl > 0) ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
    ctx.fill();
  }
}
