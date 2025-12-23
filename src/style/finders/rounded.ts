import { QRFinderRenderer, FinderRenderOptions } from './types.js';

export interface CornerConfig {
  tl: boolean;
  tr: boolean;
  bl: boolean;
  br: boolean;
}

export class RoundedFinderRenderer implements QRFinderRenderer {
  constructor(
    private extra: boolean = false,
    private corners: CornerConfig = { tl: true, tr: true, bl: true, br: true }
  ) {}

  render(options: FinderRenderOptions): string {
    const { x, y, moduleSize: s, color, ctx } = options;
    const s7 = s * 7;
    const s5 = s * 5;
    const s3 = s * 3;

    const rOuter = this.extra ? s * 3 : s * 2;
    const rInner = this.extra ? s * 1.5 : s * 0.5;
    const rHole = this.extra ? s * 2 : s * 1;

    if (ctx) {
      ctx.fillStyle = color;
      // Outer
      this.drawRoundedRectCanvas(ctx, x, y, s7, s7, rOuter, this.corners);
      // Hole (subtract)
      ctx.globalCompositeOperation = 'destination-out';
      this.drawRoundedRectCanvas(ctx, x + s, y + s, s5, s5, rHole, this.corners);
      ctx.globalCompositeOperation = 'source-over';
      // Inner
      this.drawRoundedRectCanvas(ctx, x + 2 * s, y + 2 * s, s3, s3, rInner, this.corners);
      return '';
    }

    return `
      <path fill="${color}" fill-rule="evenodd" d="
        ${this.roundedRectPath(x, y, s7, s7, rOuter, this.corners)}
        ${this.roundedRectPath(x + s, y + s, s5, s5, rHole, this.corners)}
        ${this.roundedRectPath(x + 2 * s, y + 2 * s, s3, s3, rInner, this.corners)}
      "/>
    `;
  }

  private drawRoundedRectCanvas(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, corners: CornerConfig): void {
    const tl = corners.tl ? r : 0;
    const tr = corners.tr ? r : 0;
    const bl = corners.bl ? r : 0;
    const br = corners.br ? r : 0;

    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    if (tr > 0) ctx.arcTo(x + w, y, x + w, y + tr, tr);
    ctx.lineTo(x + w, y + h - br);
    if (br > 0) ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
    ctx.lineTo(x + bl, y + h);
    if (bl > 0) ctx.arcTo(x, y + h, x, y + h - bl, bl);
    ctx.lineTo(x, y + tl);
    if (tl > 0) ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
    ctx.fill();
  }

  private roundedRectPath(x: number, y: number, w: number, h: number, r: number, corners: CornerConfig): string {
    const tl = corners.tl ? r : 0;
    const tr = corners.tr ? r : 0;
    const bl = corners.bl ? r : 0;
    const br = corners.br ? r : 0;

    let path = `M${x + tl},${y}`;
    path += `h${w - tl - tr}`;
    if (tr > 0) path += `a${tr},${tr} 0 0 1 ${tr},${tr}`;
    path += `v${h - tr - br}`;
    if (br > 0) path += `a${br},${br} 0 0 1 -${br},${br}`;
    path += `h-${w - br - bl}`;
    if (bl > 0) path += `a${bl},${bl} 0 0 1 -${bl},-${bl}`;
    path += `v-${h - bl - tl}`;
    if (tl > 0) path += `a${tl},${tl} 0 0 1 ${tl},-${tl}`;
    path += 'z';
    return path;
  }
}
