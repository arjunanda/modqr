import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class PixelStyle implements QRStyleRenderer {
  drawModule(
    x: number,
    y: number,
    row: number,
    col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const subSize = size / 3;
    let output = '';
    
    // Deterministic 3x3 pattern based on (row, col)
    const pattern = [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1]
    ];
    
    // Rotate or flip pattern based on position to add variety
    const variant = (row + col) % 4;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        let shouldFill = false;
        if (variant === 0) shouldFill = pattern[r][c] === 1;
        else if (variant === 1) shouldFill = pattern[c][2 - r] === 1;
        else if (variant === 2) shouldFill = pattern[2 - r][2 - c] === 1;
        else shouldFill = pattern[2 - c][r] === 1;
        
        if (shouldFill) {
          output += `<rect x="${x + c * subSize}" y="${y + r * subSize}" width="${subSize}" height="${subSize}" fill="${options.foreground}"/>`;
        }
      }
    }
    
    return output;
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
    const pSize = size / 3;
    ctx.fillStyle = options.foreground;
    
    // Draw 3x3 pixel grid
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(x + c * pSize, y + r * pSize, pSize, pSize);
        }
      }
    }
  }
}
