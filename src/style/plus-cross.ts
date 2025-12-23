import { QRMatrix } from "../core/matrix";
import { QRStyleRenderer, StyleOptions } from "../render/renderer";

// 5. Plus/Cross Style
export class PlusCrossStyle implements QRStyleRenderer {
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
    
    // Dynamic thickness: more neighbors = thicker cross
    const baseThickness = size * 0.25;
    const thickness = baseThickness + (neighbors / 4) * (size * 0.15);
    const baseLength = size * 0.7;
    const length = baseLength + (neighbors / 4) * (size * 0.1);
    
    const cx = x + size / 2;
    const cy = y + size / 2;
    const halfThick = thickness / 2;
    const halfLen = length / 2;
    
    // Create plus shape with two rectangles
    return `
      <rect x="${cx - halfThick}" y="${cy - halfLen}" width="${thickness}" height="${length}" fill="${options.foreground}"/>
      <rect x="${cx - halfLen}" y="${cy - halfThick}" width="${length}" height="${thickness}" fill="${options.foreground}"/>
    `;
  }

  drawCanvas(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    _row: number,
    _col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): void {
    const thickness = size * 0.3;
    const offset = (size - thickness) / 2;

    ctx.fillStyle = options.foreground;
    
    // Horizontal bar
    ctx.fillRect(x, y + offset, size, thickness);
    
    // Vertical bar
    ctx.fillRect(x + offset, y, thickness, size);
  }
}