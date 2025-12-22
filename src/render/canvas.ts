/**
 * Canvas Renderer for QR Codes
 * Draws QR code on HTMLCanvasElement
 */

import type { QRMatrix } from '../core/matrix.js';

export interface CanvasOptions {
  size?: number;
  margin?: number;
  foreground?: string;
  background?: string;
  style?: 'square' | 'dots' | 'rounded';
}

/**
 * Render QR code on canvas
 */
export function renderCanvas(
  matrix: QRMatrix,
  canvas: HTMLCanvasElement,
  options: CanvasOptions = {}
): void {
  const {
    size = 300,
    margin = 4,
    foreground = '#000000',
    background = '#ffffff',
    style = 'square',
  } = options;

  const matrixSize = matrix.length;
  const moduleSize = size / (matrixSize + margin * 2);
  const actualSize = (matrixSize + margin * 2) * moduleSize;

  // Set canvas size
  canvas.width = actualSize;
  canvas.height = actualSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Clear and fill background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, actualSize, actualSize);

  // Set foreground color
  ctx.fillStyle = foreground;

  // Render based on style
  if (style === 'dots') {
    renderDotsCanvas(ctx, matrix, moduleSize, margin);
  } else if (style === 'rounded') {
    renderRoundedCanvas(ctx, matrix, moduleSize, margin);
  } else {
    renderSquareCanvas(ctx, matrix, moduleSize, margin);
  }
}

/**
 * Render square modules on canvas
 */
function renderSquareCanvas(
  ctx: CanvasRenderingContext2D,
  matrix: QRMatrix,
  moduleSize: number,
  margin: number
): void {
  const matrixSize = matrix.length;

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col]) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        ctx.fillRect(x, y, moduleSize, moduleSize);
      }
    }
  }
}

/**
 * Render dot modules on canvas
 */
function renderDotsCanvas(
  ctx: CanvasRenderingContext2D,
  matrix: QRMatrix,
  moduleSize: number,
  margin: number
): void {
  const matrixSize = matrix.length;
  const radius = moduleSize * 0.45;

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col]) {
        // Keep finder patterns as squares
        if (isInFinderPattern(row, col, matrixSize)) {
          const x = (col + margin) * moduleSize;
          const y = (row + margin) * moduleSize;
          ctx.fillRect(x, y, moduleSize, moduleSize);
        } else {
          const cx = (col + margin + 0.5) * moduleSize;
          const cy = (row + margin + 0.5) * moduleSize;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }
}

/**
 * Render rounded modules on canvas
 */
function renderRoundedCanvas(
  ctx: CanvasRenderingContext2D,
  matrix: QRMatrix,
  moduleSize: number,
  margin: number
): void {
  const matrixSize = matrix.length;
  const radius = moduleSize * 0.4;

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col]) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;

        // Draw rounded rectangle
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + moduleSize - radius, y);
        ctx.arcTo(x + moduleSize, y, x + moduleSize, y + radius, radius);
        ctx.lineTo(x + moduleSize, y + moduleSize - radius);
        ctx.arcTo(x + moduleSize, y + moduleSize, x + moduleSize - radius, y + moduleSize, radius);
        ctx.lineTo(x + radius, y + moduleSize);
        ctx.arcTo(x, y + moduleSize, x, y + moduleSize - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

/**
 * Check if module is in finder pattern
 */
function isInFinderPattern(row: number, col: number, size: number): boolean {
  if (row < 7 && col < 7) return true;
  if (row < 7 && col >= size - 7) return true;
  if (row >= size - 7 && col < 7) return true;
  return false;
}
