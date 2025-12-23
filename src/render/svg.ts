/**
 * SVG Renderer for QR Codes
 * Generates clean SVG markup with style support
 */

import type { QRMatrix } from '../core/matrix.js';
import { BaseRenderer, type StyleOptions } from './renderer.js';
import * as Styles from '../style/index.js';
import { QRStyle } from './types.js';

export interface LogoConfig {
  src: string;
  size?: number;
  background?: string;
  margin?: number;
}


export interface SVGOptions extends StyleOptions {
  style?: QRStyle;
  logo?: LogoConfig;
}

/**
 * Render QR code as SVG string
 */
export function renderSVG(matrix: QRMatrix, options: SVGOptions): string {
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

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${actualSize} ${actualSize}" width="${actualSize}" height="${actualSize}">`;
  
  // Background
  svg += `<rect width="${actualSize}" height="${actualSize}" fill="${background}"/>`;
  
  // Select style renderer
  let styleRenderer;
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
        drawModule: (x: number, y: number, _r: number, _c: number, s: number, _m: QRMatrix, opts: StyleOptions) => 
          `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${opts.foreground}"/>`
      };
  }

  const renderer = new BaseRenderer(styleRenderer);
  svg += renderer.render(matrix, { ...options, size, margin, foreground, background });
  
  // Add logo if specified
  if (logo) {
    svg += renderLogo(logo, matrixSize, moduleSize, margin, actualSize);
  }
  
  svg += '</svg>';
  
  return svg;
}

/**
 * Render logo overlay in SVG
 */
function renderLogo(
  logo: LogoConfig,
  matrixSize: number,
  moduleSize: number,
  margin: number,
  _actualSize: number
): string {
  const logoSize = logo.size || 0.2;
  const logoMargin = logo.margin || 2;
  const logoBg = logo.background || '#ffffff';
  
  // Calculate logo dimensions based on QR matrix size (not including margin)
  const logoDimension = matrixSize * logoSize;
  const logoPixelSize = logoDimension * moduleSize;
  
  // Calculate center of QR code matrix (accounting for margin)
  const qrCodeSize = matrixSize * moduleSize;
  const qrCodeStartX = margin * moduleSize;
  const qrCodeStartY = margin * moduleSize;
  const centerX = qrCodeStartX + qrCodeSize / 2;
  const centerY = qrCodeStartY + qrCodeSize / 2;
  
  // Logo background with margin (reduced padding)
  const bgSize = logoPixelSize + (logoMargin * moduleSize);
  const bgX = centerX - bgSize / 2;
  const bgY = centerY - bgSize / 2;
  
  let logoSvg = '';
  
  // Background rectangle without rounded corners
  logoSvg += `<rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" fill="${logoBg}"/>`;
  
  // Logo image
  const logoX = centerX - logoPixelSize / 2;
  const logoY = centerY - logoPixelSize / 2;
  
  logoSvg += `<image x="${logoX}" y="${logoY}" width="${logoPixelSize}" height="${logoPixelSize}" href="${logo.src}" preserveAspectRatio="xMidYMid meet"/>`;
  
  return logoSvg;
}
