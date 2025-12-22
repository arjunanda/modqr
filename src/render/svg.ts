/**
 * SVG Renderer for QR Codes
 * Generates clean SVG markup with style support
 */

import type { QRMatrix } from '../core/matrix.js';

export interface LogoConfig {
  src: string;
  size?: number;
  background?: string;
  margin?: number;
}

export interface SVGOptions {
  size?: number;
  margin?: number;
  foreground?: string;
  background?: string;
  style?: 'square' | 'dots' | 'rounded';
  logo?: LogoConfig;
}

/**
 * Render QR code as SVG string
 */
export function renderSVG(matrix: QRMatrix, options: SVGOptions = {}): string {
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
  
  // Render modules based on style
  if (style === 'dots') {
    svg += renderDots(matrix, moduleSize, margin, foreground);
  } else if (style === 'rounded') {
    svg += renderRounded(matrix, moduleSize, margin, foreground);
  } else {
    svg += renderSquare(matrix, moduleSize, margin, foreground);
  }
  
  // Add logo if specified
  if (logo) {
    svg += renderLogo(logo, matrixSize, moduleSize, margin, actualSize);
  }
  
  svg += '</svg>';
  
  return svg;
}

/**
 * Render square modules (default style)
 */
function renderSquare(
  matrix: QRMatrix,
  moduleSize: number,
  margin: number,
  foreground: string
): string {
  let paths = '';
  const matrixSize = matrix.length;
  
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col]) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        paths += `M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}z`;
      }
    }
  }
  
  return `<path fill="${foreground}" d="${paths}"/>`;
}

/**
 * Render dot modules
 */
function renderDots(
  matrix: QRMatrix,
  moduleSize: number,
  margin: number,
  foreground: string
): string {
  let circles = '';
  const matrixSize = matrix.length;
  const radius = moduleSize * 0.45; // Slightly smaller than half for visual appeal
  
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col]) {
        // Skip dots in finder patterns - render them as squares
        if (isInFinderPattern(row, col, matrixSize)) {
          const x = (col + margin) * moduleSize;
          const y = (row + margin) * moduleSize;
          circles += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${foreground}"/>`;
        } else {
          const cx = (col + margin + 0.5) * moduleSize;
          const cy = (row + margin + 0.5) * moduleSize;
          circles += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${foreground}"/>`;
        }
      }
    }
  }
  
  return circles;
}

/**
 * Render rounded modules
 */
function renderRounded(
  matrix: QRMatrix,
  moduleSize: number,
  margin: number,
  foreground: string
): string {
  const matrixSize = matrix.length;
  const radius = moduleSize * 0.4;
  let paths = '';
  
  // Group adjacent modules for smoother rounded corners
  const visited = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));
  
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col] && !visited[row][col]) {
        // Find connected region
        const region = findConnectedRegion(matrix, row, col, visited);
        paths += renderRoundedRegion(region, moduleSize, margin, radius);
      }
    }
  }
  
  return `<path fill="${foreground}" d="${paths}"/>`;
}

/**
 * Check if module is in finder pattern
 */
function isInFinderPattern(row: number, col: number, size: number): boolean {
  // Top-left finder
  if (row < 7 && col < 7) return true;
  // Top-right finder
  if (row < 7 && col >= size - 7) return true;
  // Bottom-left finder
  if (row >= size - 7 && col < 7) return true;
  return false;
}

/**
 * Find connected region of dark modules
 */
function findConnectedRegion(
  matrix: QRMatrix,
  startRow: number,
  startCol: number,
  visited: boolean[][]
): [number, number][] {
  const region: [number, number][] = [];
  const queue: [number, number][] = [[startRow, startCol]];
  visited[startRow][startCol] = true;
  
  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    region.push([row, col]);
    
    // Check 4 adjacent cells
    const neighbors: [number, number][] = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];
    
    for (const [r, c] of neighbors) {
      if (
        r >= 0 &&
        r < matrix.length &&
        c >= 0 &&
        c < matrix.length &&
        matrix[r][c] &&
        !visited[r][c]
      ) {
        visited[r][c] = true;
        queue.push([r, c]);
      }
    }
  }
  
  return region;
}

/**
 * Render rounded region
 */
function renderRoundedRegion(
  region: [number, number][],
  moduleSize: number,
  margin: number,
  radius: number
): string {
  // For simplicity, render each module with rounded corners
  // A more sophisticated implementation would merge adjacent modules
  let path = '';
  
  for (const [row, col] of region) {
    const x = (col + margin) * moduleSize;
    const y = (row + margin) * moduleSize;
    
    // Rounded rectangle path
    path += `M${x + radius},${y}`;
    path += `h${moduleSize - 2 * radius}`;
    path += `a${radius},${radius} 0 0 1 ${radius},${radius}`;
    path += `v${moduleSize - 2 * radius}`;
    path += `a${radius},${radius} 0 0 1 -${radius},${radius}`;
    path += `h-${moduleSize - 2 * radius}`;
    path += `a${radius},${radius} 0 0 1 -${radius},-${radius}`;
    path += `v-${moduleSize - 2 * radius}`;
    path += `a${radius},${radius} 0 0 1 ${radius},-${radius}z`;
  }
  
  return path;
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
