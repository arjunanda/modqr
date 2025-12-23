import { QRMatrix } from "../core/matrix";
import { QRStyleRenderer, StyleOptions } from "../render/renderer";

// 5. Plus/Cross Style
export class PlusCrossStyle implements QRStyleRenderer {
  drawModule(
    x: number,
    y: number,
    _row: number,
    _col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const thickness = size * 0.3;
    const offset = (size - thickness) / 2;
    
    // Create plus shape with two rectangles, matching Canvas look
    return `
      <rect x="${x}" y="${y + offset}" width="${size}" height="${thickness}" fill="${options.foreground}"/>
      <rect x="${x + offset}" y="${y}" width="${thickness}" height="${size}" fill="${options.foreground}"/>
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