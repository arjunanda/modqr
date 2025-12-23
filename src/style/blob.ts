import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class BlobStyle implements QRStyleRenderer {
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
    const r = size * 0.45;
    const cx = x + center;
    const cy = y + center;
    
    // Create an organic blob using 4 cubic bezier curves
    // We'll add a tiny bit of randomness based on position to make it "organic"
    const seed = (x * 13 + y * 17) % 100;
    const jitter = (seed / 100) * (size * 0.1);
    
    const r1 = r + jitter;
    const r2 = r - jitter;
    const r3 = r + jitter / 2;
    const r4 = r - jitter / 2;

    let path = `M${cx},${cy - r1}`;
    path += `C${cx + r1 * 0.55},${cy - r1} ${cx + r2},${cy - r2 * 0.55} ${cx + r2},${cy}`;
    path += `C${cx + r2},${cy + r2 * 0.55} ${cx + r3 * 0.55},${cy + r3} ${cx},${cy + r3}`;
    path += `C${cx - r3 * 0.55},${cy + r3} ${cx - r4},${cy + r4 * 0.55} ${cx - r4},${cy}`;
    path += `C${cx - r4},${cy - r4 * 0.55} ${cx - r1 * 0.55},${cy - r1} ${cx},${cy - r1}`;
    path += 'z';

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
    const center = size / 2;
    const r = size * 0.45;
    const cx = x + center;
    const cy = y + center;
    
    const seed = (x * 13 + y * 17) % 100;
    const jitter = (seed / 100) * (size * 0.1);
    
    const r1 = r + jitter;
    const r2 = r - jitter;
    const r3 = r + jitter / 2;
    const r4 = r - jitter / 2;

    ctx.fillStyle = options.foreground;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r1);
    ctx.bezierCurveTo(cx + r1 * 0.55, cy - r1, cx + r2, cy - r2 * 0.55, cx + r2, cy);
    ctx.bezierCurveTo(cx + r2, cy + r2 * 0.55, cx + r3 * 0.55, cy + r3, cx, cy + r3);
    ctx.bezierCurveTo(cx - r3 * 0.55, cy + r3, cx - r4, cy + r4 * 0.55, cx - r4, cy);
    ctx.bezierCurveTo(cx - r4, cy - r4 * 0.55, cx - r1 * 0.55, cy - r1, cx, cy - r1);
    ctx.closePath();
    ctx.fill();
  }
}
