/**
 * ASCII Renderer for QR Codes
 * Outputs QR code as text using block characters
 */

import type { QRMatrix } from '../core/matrix.js';

export interface ASCIIOptions {
  margin?: number;
  inverted?: boolean;
}

/**
 * Render QR code as ASCII art
 * Uses Unicode block characters for better visual representation
 */
export function renderASCII(matrix: QRMatrix, options: ASCIIOptions = {}): string {
  const { margin = 2, inverted = false } = options;

  const matrixSize = matrix.length;
  const totalSize = matrixSize + margin * 2;

  let output = '';

  // Top margin
  for (let i = 0; i < margin; i++) {
    output += (inverted ? '█' : ' ').repeat(totalSize) + '\n';
  }

  // QR code content
  for (let row = 0; row < matrixSize; row++) {
    // Left margin
    output += (inverted ? '█' : ' ').repeat(margin);

    // Row content
    for (let col = 0; col < matrixSize; col++) {
      const isDark = matrix[row][col];
      output += inverted ? (isDark ? ' ' : '█') : (isDark ? '█' : ' ');
    }

    // Right margin
    output += (inverted ? '█' : ' ').repeat(margin);
    output += '\n';
  }

  // Bottom margin
  for (let i = 0; i < margin; i++) {
    output += (inverted ? '█' : ' ').repeat(totalSize) + '\n';
  }

  return output;
}

/**
 * Render QR code as ASCII art using half-block characters
 * Provides better resolution by using two rows per character
 */
export function renderASCIICompact(matrix: QRMatrix, options: ASCIIOptions = {}): string {
  const { margin = 2, inverted = false } = options;

  const matrixSize = matrix.length;
  const totalSize = matrixSize + margin * 2;

  // Unicode half-block characters
  const UPPER = '▀';
  const LOWER = '▄';
  const FULL = '█';
  const EMPTY = ' ';

  let output = '';

  // Top margin
  for (let i = 0; i < Math.floor(margin / 2); i++) {
    output += (inverted ? FULL : EMPTY).repeat(totalSize) + '\n';
  }

  // QR code content (process two rows at a time)
  for (let row = -margin; row < matrixSize + margin; row += 2) {
    let line = '';

    for (let col = -margin; col < matrixSize + margin; col++) {
      const upperDark = getModule(matrix, row, col, inverted);
      const lowerDark = getModule(matrix, row + 1, col, inverted);

      if (upperDark && lowerDark) {
        line += FULL;
      } else if (upperDark && !lowerDark) {
        line += UPPER;
      } else if (!upperDark && lowerDark) {
        line += LOWER;
      } else {
        line += EMPTY;
      }
    }

    output += line + '\n';
  }

  return output;
}

/**
 * Get module value with margin handling
 */
function getModule(
  matrix: QRMatrix,
  row: number,
  col: number,
  inverted: boolean
): boolean {
  if (row < 0 || row >= matrix.length || col < 0 || col >= matrix.length) {
    return inverted; // Margin is inverted
  }

  return inverted ? !matrix[row][col] : matrix[row][col];
}
