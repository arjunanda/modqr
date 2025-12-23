import type { QRMatrix } from '../core/matrix.js';
import type { FinderStyle, CustomFinderStyles } from './types.js';
import { getFinderRenderer, getFinderPosition } from '../style/finders/index.js';

/**
 * Common options for all style renderers
 */
export interface StyleOptions {
  size: number;
  margin: number;
  foreground: string;
  background: string;
  finderStyle?: FinderStyle;
  customFinderStyles?: CustomFinderStyles;
  ctx?: CanvasRenderingContext2D;
  [key: string]: any; // For style-specific options
}

/**
 * Interface for style-specific rendering logic
 */
export interface QRStyleRenderer {
  setup?(options: StyleOptions): void;
  drawBackground?(options: StyleOptions): string;
  drawModule(
    x: number,
    y: number,
    row: number,
    col: number,
    size: number,
    matrix: QRMatrix,
    options: StyleOptions
  ): string;
  drawCanvas?(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    row: number,
    col: number,
    size: number,
    matrix: QRMatrix,
    options: StyleOptions
  ): void;
  finalize?(): string;
}

/**
 * Check if a module is part of a finder pattern
 */
export function isFinderPattern(row: number, col: number, size: number): boolean {
  // Top-left finder
  if (row < 7 && col < 7) return true;
  // Top-right finder
  if (row < 7 && col >= size - 7) return true;
  // Bottom-left finder
  if (row >= size - 7 && col < 7) return true;
  return false;
}

/**
 * Check if a module is part of a timing pattern
 */
export function isTimingPattern(row: number, col: number, size: number): boolean {
  if (row === 6 && col >= 8 && col < size - 8) return true;
  if (col === 6 && row >= 8 && row < size - 8) return true;
  return false;
}

/**
 * Base Renderer that handles the matrix loop and finder pattern protection
 */
export class BaseRenderer {
  constructor(protected style: QRStyleRenderer) {}

  render(matrix: QRMatrix, options: StyleOptions): string {
    const matrixSize = matrix.length;
    const moduleSize = options.size / (matrixSize + options.margin * 2);
    
    let output = '';
    const renderedFinders = new Set<'topLeft' | 'topRight' | 'bottomLeft'>();
    
    if (this.style.setup) {
      this.style.setup(options);
    }
    
    if (this.style.drawBackground) {
      output += this.style.drawBackground(options);
    }
    
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        const finderPos = getFinderPosition(row, col, matrixSize);
        
        if (finderPos) {
          if (!renderedFinders.has(finderPos)) {
            const finderRow = finderPos === 'bottomLeft' ? matrixSize - 7 : 0;
            const finderCol = finderPos === 'topRight' ? matrixSize - 7 : 0;
            
            const fx = (finderCol + options.margin) * moduleSize;
            const fy = (finderRow + options.margin) * moduleSize;
            
            const style = (finderPos && options.customFinderStyles?.[finderPos]) || options.finderStyle || 'square';
            const finderRenderer = getFinderRenderer(style);
            output += finderRenderer.render({ x: fx, y: fy, moduleSize, color: options.foreground, ctx: options.ctx });
            renderedFinders.add(finderPos);
          }
          continue;
        }

        if (matrix[row][col]) {
          const x = (col + options.margin) * moduleSize;
          const y = (row + options.margin) * moduleSize;
          
          if (options.ctx && this.style.drawCanvas) {
            this.style.drawCanvas(options.ctx, x, y, row, col, moduleSize, matrix, options);
          } else {
            output += this.style.drawModule(x, y, row, col, moduleSize, matrix, options);
          }
        }
      }
    }
    
    if (this.style.finalize) {
      output += this.style.finalize();
    }
    
    return output;
  }
}
