import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class WaveStyle implements QRStyleRenderer {
  private idCounter = 0;

  drawModule(
    x: number,
    y: number,
    row: number,
    _col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const id = `wave-${this.idCounter++}`;
    const amplitude = size * 0.15;
    const frequency = 0.5;
    const phase = row * 0.5;
    
    // Create a wavy path for clipping
    let wavePath = `M${x},${y + size / 2}`;
    for (let i = 0; i <= 10; i++) {
      const px = x + (i / 10) * size;
      const py = y + size / 2 + Math.sin((i / 10) * Math.PI * 2 * frequency + phase) * amplitude;
      wavePath += `L${px},${py}`;
    }
    wavePath += `L${x + size},${y + size} L${x},${y + size} Z`;

    let output = '<defs>';
    output += `<clipPath id="${id}"><path d="${wavePath}"/></clipPath>`;
    output += '</defs>';
    output += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${options.foreground}" clip-path="url(#${id})"/>`;
    
    return output;
  }

  drawCanvas(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    row: number,
    _col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): void {
    const amplitude = size * 0.15;
    const frequency = 0.5;
    const phase = row * 0.5;

    ctx.fillStyle = options.foreground;
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);

    for (let i = 0; i <= 10; i++) {
      const px = x + (i / 10) * size;
      const py = y + size / 2 + Math.sin((i / 10) * Math.PI * 2 * frequency + phase) * amplitude;
      ctx.lineTo(px, py);
    }

    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x, y + size);
    ctx.closePath();
    ctx.fill();
  }
}
