import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class DiamondStyle implements QRStyleRenderer {
  drawModule(
    x: number,
    y: number,
    _row: number,
    _col: number,
    size: number,
    _matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const center = size / 2;
    const cx = x + center;
    const cy = y + center;
    const r = size * 0.5;

    // Diamond shape path
    const path = `M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy} Z`;

    return `<path d="${path}" fill="${options.foreground}"/>`;
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
    const s = size * 0.8;
    const offset = (size - s) / 2;
    const cx = x + size / 2;
    const cy = y + size / 2;

    ctx.fillStyle = options.foreground;
    ctx.beginPath();
    ctx.moveTo(cx, y + offset);
    ctx.lineTo(x + size - offset, cy);
    ctx.lineTo(cx, y + size - offset);
    ctx.lineTo(x + offset, cy);
    ctx.closePath();
    ctx.fill();
  }
}
