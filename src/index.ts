/**
 * modqr - QR Code Generator
 * Zero-dependency QR code generation library
 */

import type { ErrorCorrectionLevel, VersionInfo } from './core/version.js';
import { selectVersion } from './core/version.js';
import { encodeData, splitIntoBlocks, interleaveBlocks } from './core/encoder.js';
import { generateErrorCorrectionBlocks } from './core/ecc.js';
import { buildMatrix, placeFormatInfo, type QRMatrix } from './core/matrix.js';
import { applyMask, selectBestMask, createReservationMap } from './core/mask.js';
import { renderSVG } from './render/svg.js';
import { renderCanvas } from './render/canvas.js';
import { renderASCII } from './render/ascii.js';
import { QRStyle, FinderStyle, CustomFinderStyles } from './render/types.js';

/**
 * Logo configuration
 */
export interface LogoConfig {
  src: string;
  size?: number; // 0.1 - 0.3 (10% - 30% of QR code size)
  background?: string;
  margin?: number;
}

/**
 * QR Code generation options
 */
export interface QRCodeOptions {
  size?: number;
  margin?: number;
  foreground?: string;
  background?: string;
  errorCorrection?: ErrorCorrectionLevel;
  style?: QRStyle;
  finderStyle?: FinderStyle;
  finderColor?: string;
  customFinderStyles?: CustomFinderStyles;
  logo?: LogoConfig;
  renderer?: 'svg' | 'canvas' | 'ascii';
}

/**
 * QR Code generation result
 */
export interface QRResult {
  svg?: string;
  drawCanvas?: (canvas: HTMLCanvasElement) => void;
  ascii?: string;
  matrix: QRMatrix;
  version: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

/**
 * Generate QR Code
 * @param data Input data to encode
 * @param options Generation options
 * @returns QR code result with rendered output and matrix
 */
export function generateQR(data: string, options: QRCodeOptions = {}): QRResult {
  const {
    size = 300,
    margin = 4,
    foreground = '#000000',
    background = '#ffffff',
    errorCorrection = 'M',
    style = 'square',
    logo,
    renderer = 'svg',
  } = options;

  // 1. Select appropriate version
  const versionInfo = selectVersion(data.length, errorCorrection);
  if (!versionInfo) {
    throw new Error('Data too large for QR code');
  }

  // 2. Encode data
  const encodedData = encodeData(data, versionInfo, errorCorrection);

  // 3. Split into blocks
  const dataBlocks = splitIntoBlocks(encodedData, versionInfo, errorCorrection);

  // 4. Generate error correction
  const eccBlocks = generateErrorCorrectionBlocks(dataBlocks, versionInfo, errorCorrection);

  // 5. Interleave blocks
  const finalData = interleaveBlocks(dataBlocks, eccBlocks);

  // 6. Try all mask patterns and select best
  const reservation = createReservationMap(versionInfo.size);
  const matrix = buildMatrix(versionInfo, finalData, reservation);
  const maskedMatrices: QRMatrix[] = [];

  for (let maskPattern = 0; maskPattern < 8; maskPattern++) {
    const masked = applyMask(matrix, maskPattern, reservation);
    maskedMatrices.push(masked);
  }

  const bestMaskPattern = selectBestMask(maskedMatrices);
  let finalMatrix = maskedMatrices[bestMaskPattern];

  // 7. Place format information LAST
  placeFormatInfo(finalMatrix, errorCorrection, bestMaskPattern);

  // 7. Apply logo if specified
  if (logo) {
    finalMatrix = applyLogo(finalMatrix, logo);
  }

  // 8. Render
  const result: QRResult = {
    matrix: finalMatrix,
    version: versionInfo.version,
    errorCorrectionLevel: errorCorrection,
  };

  const renderOptions = { 
    size, 
    margin, 
    foreground, 
    background, 
    style, 
    finderStyle: options.finderStyle,
    finderColor: options.finderColor,
    customFinderStyles: options.customFinderStyles,
    logo 
  };


  if (renderer === 'svg') {
    result.svg = renderSVG(finalMatrix, renderOptions);
  } else if (renderer === 'canvas') {
    result.drawCanvas = (canvas: HTMLCanvasElement) => {
      renderCanvas(finalMatrix, canvas, renderOptions);
    };
  } else if (renderer === 'ascii') {
    result.ascii = renderASCII(finalMatrix, { margin });
  }

  return result;
}

/**
 * Apply logo overlay to QR matrix
 * Clears modules in the center for logo placement
 */
function applyLogo(matrix: QRMatrix, logo: LogoConfig): QRMatrix {
  const logoSize = logo.size || 0.2; // Default 20%
  const logoMargin = logo.margin || 2;

  if (logoSize < 0.1 || logoSize > 0.3) {
    throw new Error('Logo size must be between 0.1 and 0.3');
  }

  const matrixSize = matrix.length;
  const logoDimension = Math.floor(matrixSize * logoSize);
  const startPos = Math.floor((matrixSize - logoDimension) / 2);

  // Create a copy of the matrix
  const result = matrix.map(row => [...row]);

  // Clear modules in logo area
  for (let row = startPos - logoMargin; row < startPos + logoDimension + logoMargin; row++) {
    for (let col = startPos - logoMargin; col < startPos + logoDimension + logoMargin; col++) {
      if (row >= 0 && row < matrixSize && col >= 0 && col < matrixSize) {
        result[row][col] = false;
      }
    }
  }

  return result;
}

/**
 * Generate QR code as SVG string
 * Convenience function for SVG output
 */
export function generateSVG(data: string, options: Omit<QRCodeOptions, 'renderer'> = {}): string {
  const result = generateQR(data, { ...options, renderer: 'svg' });
  return result.svg!;
}

/**
 * Generate QR code on canvas
 * Convenience function for canvas output
 */
export function generateCanvas(
  data: string,
  canvas: HTMLCanvasElement,
  options: Omit<QRCodeOptions, 'renderer'> = {}
): void {
  const result = generateQR(data, { ...options, renderer: 'canvas' });
  result.drawCanvas!(canvas);
}

/**
 * Generate QR code as ASCII art
 * Convenience function for ASCII output
 */
export function generateASCII(data: string, options: Omit<QRCodeOptions, 'renderer'> = {}): string {
  const result = generateQR(data, { ...options, renderer: 'ascii' });
  return result.ascii!;
}

// Export types
export type { ErrorCorrectionLevel, QRMatrix, VersionInfo };
