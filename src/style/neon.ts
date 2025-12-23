import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class NeonStyle implements QRStyleRenderer {
  private filterId = 'neon-glow';

  drawBackground(_options: StyleOptions): string {
    let svg = '<defs>';
    svg += `<filter id="${this.filterId}" x="-50%" y="-50%" width="200%" height="200%">`;
    svg += '<feGaussianBlur stdDeviation="1.5" result="blur"/>';
    svg += '<feComposite in="SourceGraphic" in2="blur" operator="over"/>';
    svg += '</filter>';
    svg += '</defs>';
    
    return svg;
  }

  drawModule(
    x: number,
    y: number,
    _row: number,
    _col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): string {
    // Inner solid core
    let output = `<rect x="${x + size * 0.1}" y="${y + size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" fill="${options.foreground}"/>`;
    // Outer glow
    output += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${options.foreground}" fill-opacity="0.3" filter="url(#${this.filterId})"/>`;
    
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
    // Inner solid core
    ctx.fillStyle = options.foreground;
    ctx.fillRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8);

    // Outer glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = options.foreground;
    ctx.fillStyle = options.foreground; // Use same color for glow base
    
    // Draw a slightly transparent rect for the glow effect
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x, y, size, size);
    
    // Reset
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }
}
