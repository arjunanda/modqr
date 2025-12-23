export type QRStyle = 'square' | 'dots' | 'rounded' | 'liquid' | 'blob' | 'wave' | 'pixel' | 'gradient' | 'neon' | 'glass' | 'dot-matrix' | 'diamond' | 'star' | 'glitch' | 'plus-cross' | 'smooth-connected';

export type FinderStyle = 'square' | 'rounded' | 'extra-rounded' | 'dots' | 'rounded-tl' | 'rounded-tr' | 'rounded-bl' | 'rounded-br' | 'leaf' | 'round-tr-cut' | 'round-br-cut' | 'round-tl-cut' | 'round-bl-cut';

export interface CustomFinderStyles {
  topLeft?: FinderStyle;
  topRight?: FinderStyle;
  bottomLeft?: FinderStyle;
}