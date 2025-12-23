import { FinderStyle } from '../../render/types.js';
import { QRFinderRenderer } from './types.js';
import { RoundedFinderRenderer } from './rounded.js';
import { DotsFinderRenderer } from './dots.js';
import { SquareFinderRenderer } from './square.js';

export * from './types.js';
export * from './rounded.js';
export * from './dots.js';
export * from './square.js';

export function getFinderRenderer(style: FinderStyle): QRFinderRenderer {
  switch (style) {
    case 'rounded':
      return new RoundedFinderRenderer(false);
    case 'extra-rounded':
      return new RoundedFinderRenderer(true);
    case 'rounded-tl':
      return new RoundedFinderRenderer(false, { tl: true, tr: false, bl: false, br: false });
    case 'rounded-tr':
      return new RoundedFinderRenderer(false, { tl: false, tr: true, bl: false, br: false });
    case 'rounded-bl':
      return new RoundedFinderRenderer(false, { tl: false, tr: false, bl: true, br: false });
    case 'rounded-br':
      return new RoundedFinderRenderer(false, { tl: false, tr: false, bl: false, br: true });
    case 'round-tr-cut':
      return new RoundedFinderRenderer(false, { tl: true, tr: false, bl: true, br: true });
    case 'round-br-cut':
      return new RoundedFinderRenderer(false, { tl: true, tr: true, bl: true, br: false });
    case 'round-tl-cut':
      return new RoundedFinderRenderer(false, { tl: false, tr: true, bl: true, br: true });
    case 'round-bl-cut':
      return new RoundedFinderRenderer(false, { tl: true, tr: true, bl: false, br: true });
    case 'leaf':
      return new RoundedFinderRenderer(false, { tl: true, tr: false, bl: false, br: true });
    case 'dots':
      return new DotsFinderRenderer();
    case 'square':
    default:
      return new SquareFinderRenderer();
  }
}

/**
 * Get which finder pattern a module belongs to
 */
export function getFinderPosition(row: number, col: number, size: number): 'topLeft' | 'topRight' | 'bottomLeft' | null {
  if (row < 7 && col < 7) return 'topLeft';
  if (row < 7 && col >= size - 7) return 'topRight';
  if (row >= size - 7 && col < 7) return 'bottomLeft';
  return null;
}
