import { QRFinderRenderer, FinderRenderOptions } from './types.js';

export class SquareFinderRenderer implements QRFinderRenderer {
  render(options: FinderRenderOptions): string {
    const { x, y, moduleSize: s, color, ctx } = options;
    const s7 = s * 7;
    const s5 = s * 5;
    const s3 = s * 3;

    if (ctx) {
      ctx.fillStyle = color;
      // Outer
      ctx.fillRect(x, y, s7, s7);
      // Hole
      ctx.clearRect(x + s, y + s, s5, s5);
      // Inner
      ctx.fillRect(x + 2 * s, y + 2 * s, s3, s3);
      return '';
    }

    return `
      <path fill="${color}" fill-rule="evenodd" d="
        M${x},${y} h${s7} v${s7} h-${s7}z
        M${x + s},${y + s} h${s5} v${s5} h-${s5}z
        M${x + 2 * s},${y + 2 * s} h${s3} v${s3} h-${s3}z
      "/>
    `;
  }
}
