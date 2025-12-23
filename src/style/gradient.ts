import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class GradientStyle implements QRStyleRenderer {
  private gradientId = 'qr-gradient';

  drawBackground(options: StyleOptions): string {
    const stops = options.gradientStops || [
      { offset: '0%', color: options.foreground },
      { offset: '100%', color: '#1a73e8' }
    ];

    let svg = '<defs>';
    svg += `<linearGradient id="${this.gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">`;
    for (const stop of stops) {
      svg += `<stop offset="${stop.offset}" stop-color="${stop.color}"/>`;
    }
    svg += '</linearGradient>';
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
    _options: StyleOptions
  ): string {
    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="url(#${this.gradientId})"/>`;
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
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    
    // Match SVG default: foreground -> #1a73e8
    if (options.gradientStops) {
      for (const stop of options.gradientStops) {
        gradient.addColorStop(parseFloat(stop.offset) / 100, stop.color);
      }
    } else {
      gradient.addColorStop(0, options.foreground);
      gradient.addColorStop(1, '#1a73e8');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, size, size);
  }
}
