import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class LiquidStyle implements QRStyleRenderer {
  drawModule(
    x: number,
    y: number,
    row: number,
    col: number,
    size: number,
    matrix: QRMatrix,
    options: StyleOptions
  ): string {
    const matrixSize = matrix.length;
    const radius = size * 0.45;

    // Check neighbors
    const hasTop = row > 0 && matrix[row - 1][col];
    const hasBottom = row < matrixSize - 1 && matrix[row + 1][col];
    const hasLeft = col > 0 && matrix[row][col - 1];
    const hasRight = col < matrixSize - 1 && matrix[row][col + 1];

    // Determine rounding for each corner
    const tl = !hasTop && !hasLeft ? radius : 0;
    const tr = !hasTop && !hasRight ? radius : 0;
    const bl = !hasBottom && !hasLeft ? radius : 0;
    const br = !hasBottom && !hasRight ? radius : 0;

    // SVG path for a rectangle with dynamic corner rounding
    let path = `M${x + tl},${y}`;
    path += `h${size - tl - tr}`;
    if (tr > 0) path += `a${tr},${tr} 0 0 1 ${tr},${tr}`;
    path += `v${size - tr - br}`;
    if (br > 0) path += `a${br},${br} 0 0 1 -${br},${br}`;
    path += `h-${size - br - bl}`;
    if (bl > 0) path += `a${bl},${bl} 0 0 1 -${bl},-${bl}`;
    path += `v-${size - bl - tl}`;
    if (tl > 0) path += `a${tl},${tl} 0 0 1 ${tl},-${tl}`;
    path += 'z';

    return `<path d="${path}" fill="${options.foreground}"/>`;
  }

  drawCanvas(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    row: number,
    col: number,
    size: number,
    matrix: QRMatrix,
    options: StyleOptions
  ): void {
    const matrixSize = matrix.length;
    const radius = size * 0.45;

    const hasTop = row > 0 && matrix[row - 1][col];
    const hasBottom = row < matrixSize - 1 && matrix[row + 1][col];
    const hasLeft = col > 0 && matrix[row][col - 1];
    const hasRight = col < matrixSize - 1 && matrix[row][col + 1];

    const tl = !hasTop && !hasLeft ? radius : 0;
    const tr = !hasTop && !hasRight ? radius : 0;
    const bl = !hasBottom && !hasLeft ? radius : 0;
    const br = !hasBottom && !hasRight ? radius : 0;

    ctx.fillStyle = options.foreground;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + size - tr, y);
    if (tr > 0) ctx.arcTo(x + size, y, x + size, y + tr, tr);
    ctx.lineTo(x + size, y + size - br);
    if (br > 0) ctx.arcTo(x + size, y + size, x + size - br, y + size, br);
    ctx.lineTo(x + bl, y + size);
    if (bl > 0) ctx.arcTo(x, y + size, x, y + size - bl, bl);
    ctx.lineTo(x, y + tl);
    if (tl > 0) ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
    ctx.fill();
  }
}
