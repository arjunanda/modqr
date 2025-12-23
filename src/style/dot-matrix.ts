import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class DotMatrixStyle implements QRStyleRenderer {
  drawModule(
    x: number,
    y: number,
    row: number,
    col: number,
    size: number,
    matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const matrixSize = matrix.length;
    let neighbors = 0;
    
    // Count neighbors
    if (row > 0 && matrix[row - 1][col]) neighbors++;
    if (row < matrixSize - 1 && matrix[row + 1][col]) neighbors++;
    if (col > 0 && matrix[row][col - 1]) neighbors++;
    if (col < matrixSize - 1 && matrix[row][col + 1]) neighbors++;
    
    // Dynamic radius: more neighbors = slightly larger dot
    const baseRadius = size * 0.35;
    const radius = baseRadius + (neighbors / 4) * (size * 0.1);
    
    const cx = x + size / 2;
    const cy = y + size / 2;
    
    return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${options.foreground}"/>`;
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
    const matrixSize = matrix.length;
    let neighbors = 0;
    
    if (row > 0 && matrix[row - 1][col]) neighbors++;
    if (row < matrixSize - 1 && matrix[row + 1][col]) neighbors++;
    if (col > 0 && matrix[row][col - 1]) neighbors++;
    if (col < matrixSize - 1 && matrix[row][col + 1]) neighbors++;
    
    const baseRadius = size * 0.35;
    const radius = baseRadius + (neighbors / 4) * (size * 0.1);
    
    const cx = x + size / 2;
    const cy = y + size / 2;

    ctx.fillStyle = options.foreground;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}
