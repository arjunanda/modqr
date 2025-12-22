/**
 * QR Code Matrix Construction
 * Places all patterns and data into the QR code matrix
 */

import type { ErrorCorrectionLevel, VersionInfo } from './version.js';
import { getAlignmentPatternPositions, EC_LEVEL_MAP } from './version.js';

/**
 * QR Code matrix (2D boolean array)
 * true = dark module, false = light module
 */
export type QRMatrix = boolean[][];

/**
 * Module reservation map
 * Tracks which modules are reserved for function patterns
 */
type ReservationMap = boolean[][];

/**
 * Create empty QR code matrix
 */
export function createMatrix(size: number): QRMatrix {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

/**
 * Create reservation map
 */
function createReservationMap(size: number): ReservationMap {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

/**
 * Place finder pattern (7x7 pattern in corners)
 * Pattern: outer 7x7 black border, inner 5x5 white border, center 3x3 black square
 */
function placeFinderPattern(
  matrix: QRMatrix,
  reservation: ReservationMap,
  row: number,
  col: number
): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const y = row + r;
      const x = col + c;
      
      if (y < 0 || y >= matrix.length || x < 0 || x >= matrix.length) {
        continue;
      }
      
      // Determine if this module should be dark
      const isDark =
        (r >= 0 && r <= 6 && (c === 0 || c === 6)) || // Vertical borders
        (c >= 0 && c <= 6 && (r === 0 || r === 6)) || // Horizontal borders
        (r >= 2 && r <= 4 && c >= 2 && c <= 4); // Center 3x3
      
      matrix[y][x] = isDark;
      reservation[y][x] = true;
    }
  }
}

/**
 * Place all three finder patterns
 */
function placeFinderPatterns(
  matrix: QRMatrix,
  reservation: ReservationMap
): void {
  const size = matrix.length;
  
  // Top-left
  placeFinderPattern(matrix, reservation, 0, 0);
  
  // Top-right
  placeFinderPattern(matrix, reservation, 0, size - 7);
  
  // Bottom-left
  placeFinderPattern(matrix, reservation, size - 7, 0);
}

/**
 * Place alignment pattern (5x5 pattern)
 */
function placeAlignmentPattern(
  matrix: QRMatrix,
  reservation: ReservationMap,
  row: number,
  col: number
): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const y = row + r;
      const x = col + c;
      
      if (y < 0 || y >= matrix.length || x < 0 || x >= matrix.length) {
        continue;
      }
      
      // Outer 5x5 border and center dot
      const isDark =
        r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
      
      matrix[y][x] = isDark;
      reservation[y][x] = true;
    }
  }
}

/**
 * Place all alignment patterns
 */
function placeAlignmentPatterns(
  matrix: QRMatrix,
  reservation: ReservationMap,
  version: number
): void {
  const positions = getAlignmentPatternPositions(version);
  
  for (const [row, col] of positions) {
    placeAlignmentPattern(matrix, reservation, row, col);
  }
}

/**
 * Place timing patterns (alternating dark/light modules)
 */
function placeTimingPatterns(
  matrix: QRMatrix,
  reservation: ReservationMap
): void {
  const size = matrix.length;
  
  // Horizontal timing pattern (row 6)
  for (let x = 8; x < size - 8; x++) {
    matrix[6][x] = x % 2 === 0;
    reservation[6][x] = true;
  }
  
  // Vertical timing pattern (column 6)
  for (let y = 8; y < size - 8; y++) {
    matrix[y][6] = y % 2 === 0;
    reservation[y][6] = true;
  }
}

/**
 * Reserve format information areas
 */
function reserveFormatAreas(reservation: ReservationMap): void {
  const size = reservation.length;
  
  // Top-left format info (around top-left finder)
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reservation[8][i] = true; // Horizontal
      reservation[i][8] = true; // Vertical
    }
  }
  
  // Top-right format info
  for (let i = 0; i < 8; i++) {
    reservation[8][size - 1 - i] = true;
  }
  
  // Bottom-left format info
  for (let i = 0; i < 7; i++) {
    reservation[size - 1 - i][8] = true;
  }
  
  // Dark module (always dark)
  reservation[size - 8][8] = true;
}

/**
 * Place format information (error correction level and mask pattern)
 * @param matrix QR matrix
 * @param ecLevel Error correction level
 * @param maskPattern Mask pattern (0-7)
 */
export function placeFormatInfo(
  matrix: QRMatrix,
  ecLevel: ErrorCorrectionLevel,
  maskPattern: number
): void {
  const size = matrix.length;
  
  // Format info: 5 bits (2 for EC level, 3 for mask) + 10 bits BCH error correction
  const formatBits = generateFormatBits(ecLevel, maskPattern);
  
  // Place format info around top-left finder
  for (let i = 0; i < 6; i++) {
    matrix[8][i] = formatBits[i];
  }
  matrix[8][7] = formatBits[6];
  matrix[8][8] = formatBits[7];
  matrix[7][8] = formatBits[8];
  for (let i = 9; i < 15; i++) {
    matrix[14 - i][8] = formatBits[i];
  }
  
  // Place format info on top-right and bottom-left
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 1 - i] = formatBits[i];
  }
  for (let i = 8; i < 15; i++) {
    matrix[size - 15 + i][8] = formatBits[i];
  }
  
  // Dark module (always dark)
  matrix[size - 8][8] = true;
}

/**
 * Generate format information bits with BCH error correction
 */
function generateFormatBits(
  ecLevel: ErrorCorrectionLevel,
  maskPattern: number
): boolean[] {
  // Format data: 2 bits EC level + 3 bits mask pattern
  const data = (EC_LEVEL_MAP[ecLevel] << 3) | maskPattern;
  
  // BCH(15, 5) error correction with generator polynomial 10100110111
  let bits = data << 10;
  for (let i = 4; i >= 0; i--) {
    if (bits & (1 << (i + 10))) {
      bits ^= 0b10100110111 << i;
    }
  }
  
  // Combine data and error correction
  const formatValue = (data << 10) | bits;
  
  // XOR with mask pattern 101010000010010
  const maskedValue = formatValue ^ 0b101010000010010;
  
  // Convert to boolean array (15 bits)
  const result: boolean[] = [];
  for (let i = 14; i >= 0; i--) {
    result.push(((maskedValue >> i) & 1) === 1);
  }
  
  return result;
}

/**
 * Place data and error correction codewords in the matrix
 */
export function placeData(
  matrix: QRMatrix,
  reservation: ReservationMap,
  data: number[]
): void {
  const size = matrix.length;
  let bitIndex = 0;
  
  // Data is placed in columns from right to left, alternating up and down
  let direction = -1; // -1 = up, 1 = down
  
  for (let col = size - 1; col > 0; col -= 2) {
    // Skip timing column
    if (col === 6) col--;
    
    for (let i = 0; i < size; i++) {
      const row = direction === -1 ? size - 1 - i : i;
      
      // Place in both columns of the current pair
      for (let c = 0; c < 2; c++) {
        const x = col - c;
        
        if (!reservation[row][x]) {
          let bit = false;
          
          if (bitIndex < data.length * 8) {
            const byteIndex = Math.floor(bitIndex / 8);
            const bitOffset = 7 - (bitIndex % 8);
            bit = ((data[byteIndex] >> bitOffset) & 1) === 1;
            bitIndex++;
          }
          
          matrix[row][x] = bit;
        }
      }
    }
    
    direction *= -1; // Reverse direction
  }
}

/**
 * Build complete QR code matrix
 */
export function buildMatrix(
  versionInfo: VersionInfo,
  data: number[],
  ecLevel: ErrorCorrectionLevel,
  maskPattern: number
): QRMatrix {
  const size = versionInfo.size;
  const matrix = createMatrix(size);
  const reservation = createReservationMap(size);
  
  // Place function patterns
  placeFinderPatterns(matrix, reservation);
  placeAlignmentPatterns(matrix, reservation, versionInfo.version);
  placeTimingPatterns(matrix, reservation);
  reserveFormatAreas(reservation);
  
  // Place data
  placeData(matrix, reservation, data);
  
  // Place format information
  placeFormatInfo(matrix, ecLevel, maskPattern);
  
  return matrix;
}
