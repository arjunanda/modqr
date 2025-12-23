import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class StarStyle implements QRStyleRenderer {
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
    const outerRadius = size * 0.5;
    const innerRadius = size * 0.2;
    const points = 4;
    
    let path = '';
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const px = cx + Math.sin(angle) * radius;
      const py = cy - Math.cos(angle) * radius;
      path += (i === 0 ? 'M' : 'L') + `${px},${py}`;
    }
    path += 'Z';

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
    const cx = x + size / 2;
    const cy = y + size / 2;
    const spikes = 4;
    const outerRadius = size * 0.5;
    const innerRadius = size * 0.2;

    ctx.fillStyle = options.foreground;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const svgAngle = (i * Math.PI) / spikes;
      const sx = cx + Math.sin(svgAngle) * radius;
      const sy = cy - Math.cos(svgAngle) * radius;
      
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
  }
}
