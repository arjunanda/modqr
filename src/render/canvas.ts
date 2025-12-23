/**
 * Canvas Renderer for QR Codes
 * Draws QR code on HTMLCanvasElement
 */

import type { QRMatrix } from '../core/matrix.js';
import { QRStyle } from './types.js';
import { BaseRenderer, type StyleOptions, type QRStyleRenderer } from './renderer.js';
import * as Styles from '../style/index.js';
import { LogoConfig } from './svg.js';

export interface CanvasOptions extends StyleOptions {
  style?: QRStyle;
  logo?: LogoConfig;
}

/**
 * Render QR code on canvas
 */
export function renderCanvas(
  matrix: QRMatrix,
  canvas: HTMLCanvasElement,
  options: Partial<CanvasOptions> = {}
): void {
  const {
    size = 300,
    margin = 4,
    foreground = '#000000',
    background = '#ffffff',
    style = 'square',
    logo,
  } = options;

  const matrixSize = matrix.length;
  const moduleSize = size / (matrixSize + margin * 2);
  const actualSize = (matrixSize + margin * 2) * moduleSize;

  // Set canvas size
  canvas.width = actualSize;
  canvas.height = actualSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Clear and fill background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, actualSize, actualSize);

  // Select style renderer
  let styleRenderer: QRStyleRenderer;
  switch (style) {
    case 'liquid': styleRenderer = new Styles.LiquidStyle(); break;
    case 'blob': styleRenderer = new Styles.BlobStyle(); break;
    case 'wave': styleRenderer = new Styles.WaveStyle(); break;
    case 'pixel': styleRenderer = new Styles.PixelStyle(); break;
    case 'gradient': styleRenderer = new Styles.GradientStyle(); break;
    case 'neon': styleRenderer = new Styles.NeonStyle(); break;
    case 'glass': styleRenderer = new Styles.GlassStyle(); break;
    case 'dot-matrix': styleRenderer = new Styles.DotMatrixStyle(); break;
    case 'diamond': styleRenderer = new Styles.DiamondStyle(); break;
    case 'star': styleRenderer = new Styles.StarStyle(); break;
    case 'glitch': styleRenderer = new Styles.GlitchStyle(); break;
    case 'plus-cross': styleRenderer = new Styles.PlusCrossStyle(); break;
    case 'smooth-connected': styleRenderer = new Styles.SmoothConnectedStyle(); break;
    case 'dots': 
      styleRenderer = new Styles.DotsStyle(); 
      break;
    case 'rounded':
      styleRenderer = new Styles.RoundedStyle();
      break;
    default:
      styleRenderer = {
        drawModule: (x: number, y: number, _r: number, _c: number, s: number, _m: QRMatrix, opts: StyleOptions) => {
          if (opts.ctx) {
            opts.ctx.fillStyle = opts.foreground;
            opts.ctx.fillRect(x, y, s, s);
          }
          return '';
        }
      } as QRStyleRenderer;
  }

  // Canvas style renderers need to be wrapped to support Canvas context
  const canvasStyleWrapper = {
    setup: (opts: StyleOptions) => (styleRenderer as any).setup?.(opts),
    drawBackground: (opts: StyleOptions) => (styleRenderer as any).drawBackground?.(opts) || '',
    drawModule: (x: number, y: number, r: number, c: number, s: number, m: QRMatrix, opts: StyleOptions) => {
      if ((styleRenderer as any).drawCanvas && opts.ctx) {
        (styleRenderer as any).drawCanvas(opts.ctx, x, y, r, c, s, m, opts);
      } else {
        const svg = styleRenderer.drawModule(x, y, r, c, s, m, opts);
        if (svg && opts.ctx) {
          // Simple fallback for styles that only return SVG
          opts.ctx.fillStyle = opts.foreground;
          opts.ctx.fillRect(x, y, s, s);
        }
      }
      return '';
    },
    finalize: () => (styleRenderer as any).finalize?.() || ''
  };

  const renderer = new BaseRenderer(canvasStyleWrapper);
  renderer.render(matrix, { ...options, size, margin, foreground, background, ctx });

  // Add logo if specified
  if (logo && ctx) {
    renderLogoCanvas(ctx, logo, matrixSize, moduleSize, margin);
  }
}

/**
 * Render logo overlay on Canvas
 */
function renderLogoCanvas(
  ctx: CanvasRenderingContext2D,
  logo: LogoConfig,
  matrixSize: number,
  moduleSize: number,
  margin: number
): void {
  const logoSize = logo.size || 0.2;
  const logoMargin = logo.margin || 2;
  const logoBg = logo.background || '#ffffff';
  
  const logoDimension = matrixSize * logoSize;
  const logoPixelSize = logoDimension * moduleSize;
  
  const qrCodeSize = matrixSize * moduleSize;
  const qrCodeStartX = margin * moduleSize;
  const qrCodeStartY = margin * moduleSize;
  const centerX = qrCodeStartX + qrCodeSize / 2;
  const centerY = qrCodeStartY + qrCodeSize / 2;
  
  const bgSize = logoPixelSize + (logoMargin * moduleSize);
  const bgX = centerX - bgSize / 2;
  const bgY = centerY - bgSize / 2;
  
  // Background
  ctx.fillStyle = logoBg;
  ctx.fillRect(bgX, bgY, bgSize, bgSize);
  
  // Logo image
  const img = new Image();
  img.onload = () => {
    // Calculate aspect ratio to fit within the square area
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawWidth = logoPixelSize;
    let drawHeight = logoPixelSize;

    if (aspect >= 1) {
      // Wider than tall or square
      drawHeight = logoPixelSize / aspect;
    } else {
      // Taller than wide
      drawWidth = logoPixelSize * aspect;
    }

    const logoX = centerX - drawWidth / 2;
    const logoY = centerY - drawHeight / 2;
    ctx.drawImage(img, logoX, logoY, drawWidth, drawHeight);
  };
  img.src = logo.src;
}
