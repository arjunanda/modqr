import { QRFinderRenderer, FinderRenderOptions } from './types.js';

export class DotsFinderRenderer implements QRFinderRenderer {
  render(options: FinderRenderOptions): string {
    const { x, y, moduleSize: s, color, ctx } = options;
    let dots = '';
    
    if (ctx) ctx.fillStyle = color;

    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        
        if (isOuter || isCenter) {
          const cx = x + c * s + s/2;
          const cy = y + r * s + s/2;
          const radius = s * 0.45;

          if (ctx) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            dots += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}"/>`;
          }
        }
      }
    }
    return dots;
  }
}
