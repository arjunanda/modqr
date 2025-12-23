import type { QRMatrix } from '../core/matrix.js';
import type { QRStyleRenderer, StyleOptions } from '../render/renderer.js';

export class SmoothConnectedStyle implements QRStyleRenderer {
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
    
    // Check if we have a left neighbor - if yes, skip (let the leftmost handle it)
    const hasLeft = col > 0 && matrix[row][col - 1];
    if (hasLeft) {
      return '';
    }
    
    // Count consecutive horizontal modules (max 4)
    let groupWidth = 1;
    let checkCol = col + 1;
    
    while (checkCol < matrixSize && matrix[row][checkCol] && groupWidth < 4) {
      groupWidth++;
      checkCol++;
    }
    
    // If group size is 1, draw circle
    if (groupWidth === 1) {
      const radius = size * 0.35;
      const cx = x + size / 2;
      const cy = y + size / 2;
      return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${options.foreground}"/>`;
    }
    
    // Draw horizontal capsule/pill for grouped modules
    const capsuleWidth = groupWidth * size;
    const capsuleHeight = size * 0.6;
    const capsuleX = x;
    const capsuleY = y + (size - capsuleHeight) / 2;
    const radius = capsuleHeight / 2;
    
    return `<rect x="${capsuleX}" y="${capsuleY}" width="${capsuleWidth}" height="${capsuleHeight}" rx="${radius}" ry="${radius}" fill="${options.foreground}"/>`;
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
    
    // Check if we have a left neighbor - if yes, skip (let the leftmost handle it)
    const hasLeft = col > 0 && matrix[row][col - 1];
    if (hasLeft) {
      return;
    }
    
    // Count consecutive horizontal modules (max 4)
    let groupWidth = 1;
    let checkCol = col + 1;
    
    while (checkCol < matrixSize && matrix[row][checkCol] && groupWidth < 4) {
      groupWidth++;
      checkCol++;
    }
    
    ctx.fillStyle = options.foreground;
    
    if (groupWidth === 1) {
      const radius = size * 0.35;
      const cx = x + size / 2;
      const cy = y + size / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      const capsuleWidth = groupWidth * size;
      const capsuleHeight = size * 0.6;
      const capsuleX = x;
      const capsuleY = y + (size - capsuleHeight) / 2;
      const radius = capsuleHeight / 2;
      
      ctx.beginPath();
      ctx.roundRect(capsuleX, capsuleY, capsuleWidth, capsuleHeight, radius);
      ctx.fill();
    }
  }
}