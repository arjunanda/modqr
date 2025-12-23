import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class GlitchStyle implements QRStyleRenderer {
  drawModule(
    x: number,
    y: number,
    _row: number,
    _col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const offset = size * 0.1;
    let output = '';
    
    // Red channel offset
    output += `<rect x="${x - offset}" y="${y}" width="${size}" height="${size}" fill="#ff0000" fill-opacity="0.5"/>`;
    // Blue channel offset
    output += `<rect x="${x + offset}" y="${y}" width="${size}" height="${size}" fill="#0000ff" fill-opacity="0.5"/>`;
    // Main core
    output += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${options.foreground}"/>`;
    
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
    const shift = (Math.random() - 0.5) * (size * 0.4);
    
    // Main color
    ctx.fillStyle = options.foreground;
    ctx.fillRect(x + shift, y, size, size);
    
    // Cyan glitch
    ctx.fillStyle = '#00ffff';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x - shift * 0.5, y, size, size);
    
    // Magenta glitch
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(x + shift * 0.5, y, size, size);
    
    ctx.globalAlpha = 1.0; // Reset
  }
}
