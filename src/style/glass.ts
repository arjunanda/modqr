import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class GlassStyle implements QRStyleRenderer {
  drawModule(
    x: number,
    y: number,
    _row: number,
    _col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const r = size * 0.2;
    let output = '';
    
    // Main body (semi-transparent)
    output += `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}" fill="${options.foreground}" fill-opacity="0.7"/>`;
    
    // Inner highlight
    output += `<rect x="${x + size * 0.1}" y="${y + size * 0.1}" width="${size * 0.8}" height="${size * 0.3}" rx="${r}" fill="#ffffff" fill-opacity="0.3"/>`;
    
    // Subtle shadow
    output += `<rect x="${x}" y="${y + size * 0.9}" width="${size}" height="${size * 0.1}" rx="${r}" fill="#000000" fill-opacity="0.2"/>`;
    
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
    const r = size * 0.2;
    
    // Main body
    ctx.fillStyle = options.foreground + 'B3'; // 70% opacity
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, r);
    ctx.fill();
    
    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.3, r);
    ctx.fill();
    
    // Subtle shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(x, y + size * 0.9, size, size * 0.1, r);
    ctx.fill();
  }
}
