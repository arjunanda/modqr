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
export function createReservationMap(size: number): ReservationMap {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

/**
 * Place finder pattern (7x7 pattern in corners)
 * Pattern: outer 7x7 black border, inner 5x5 white border, center 3x3 black square
 * Also adds a mandatory 1-module white separator around the pattern.
 */
function placeFinderPattern(
  matrix: QRMatrix,
  reservation: ReservationMap,
  row: number,
  col: number
): void {
  const size = matrix.length;
  
  // Place 7x7 finder pattern + 1-module separator
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const y = row + r;
      const x = col + c;
      
      // Skip if out of bounds
      if (y < 0 || y >= size || x < 0 || x >= size) {
        continue;
      }
      
      // Determine if this module is part of the 7x7 finder pattern
      if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
        const isDark =
          r === 0 || r === 6 || // Horizontal borders
          c === 0 || c === 6 || // Vertical borders
          (r >= 2 && r <= 4 && c >= 2 && c <= 4); // Center 3x3
        
        matrix[y][x] = isDark;
      } else {
        // This is the separator area - must be white
        matrix[y][x] = false;
      }
      
      // Always reserve finder + separator
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
  
  // Top-left (0,0)
  placeFinderPattern(matrix, reservation, 0, 0);
  
  // Top-right (0, size-7)
  placeFinderPattern(matrix, reservation, 0, size - 7);
  
  // Bottom-left (size-7, 0)
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
  // ISO: No alignment patterns for version 1
  if (version < 2) return;

  const positions = getAlignmentPatternPositions(version);
  
  for (const [row, col] of positions) {
    // Skip if already reserved (overlaps with finder patterns)
    if (reservation[row][col]) continue;
    
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
  
  // Timing patterns start at row/col 6 and alternate
  // They run between the finder pattern separators
  for (let i = 8; i < size - 8; i++) {
    // Horizontal timing pattern (row 6)
    if (!reservation[6][i]) {
      matrix[6][i] = i % 2 === 0;
      reservation[6][i] = true;
    }
    
    // Vertical timing pattern (column 6)
    if (!reservation[i][6]) {
      matrix[i][6] = i % 2 === 0;
      reservation[i][6] = true;
    }
  }
}

/**
 * Place dark module (always dark)
 */
function placeDarkModule(
  matrix: QRMatrix,
  reservation: ReservationMap
): void {
  const size = matrix.length;
  const row = size - 8;
  const col = 8;
  
  matrix[row][col] = true;
  reservation[row][col] = true;
}

/**
 * Reserve format information areas
 */
export function reserveFormatAreas(reservation: ReservationMap): void {
  const size = reservation.length;
  
  // Top-left format info (around top-left finder)
  for (let i = 0; i < 9; i++) {
    reservation[8][i] = true; // Horizontal
    reservation[i][8] = true; // Vertical
  }
  
  // Top-right format info
  for (let i = 0; i < 8; i++) {
    reservation[8][size - 1 - i] = true;
  }
  
  // Bottom-left format info
  for (let i = 0; i < 7; i++) {
    reservation[size - 1 - i][8] = true;
  }
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
  // formatBits[0] = MSB (bit 14), formatBits[14] = LSB (bit 0)
  const formatBits = generateFormatBits(ecLevel, maskPattern);
  
  // === Top-Left Area ===
  // Bits 14-9 -> (8,0) to (8,5)
  for (let i = 0; i < 6; i++) {
    matrix[8][i] = formatBits[i];
  }
  // Bit 8 -> (8,7)
  matrix[8][7] = formatBits[6];
  // Bit 7 -> (8,8)
  matrix[8][8] = formatBits[7];
  // Bit 6 -> (7,8)
  matrix[7][8] = formatBits[8];
  // Bits 5-0 -> (5,8) to (0,8)
  for (let i = 0; i < 6; i++) {
    matrix[5 - i][8] = formatBits[9 + i];
  }
  
  // === Top-Right Area ===
  // Bits 7-0 -> (8, size-8) to (8, size-1)
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 8 + i] = formatBits[7 + i];
  }
  
  // === Bottom-Left Area ===
  // Bits 14-8 -> (size-1, 8) to (size-7, 8)
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = formatBits[i];
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
 * Build complete QR code matrix (excluding masking and format info)
 */
export function buildMatrix(
  versionInfo: VersionInfo,
  data: number[],
  reservation: ReservationMap
): QRMatrix {
  const size = versionInfo.size;
  const matrix = createMatrix(size);
  
  // 1. Place function patterns
  placeFinderPatterns(matrix, reservation);
  placeAlignmentPatterns(matrix, reservation, versionInfo.version);
  placeTimingPatterns(matrix, reservation);
  
  // 2. Place dark module
  placeDarkModule(matrix, reservation);
  
  // 3. Reserve format areas
  reserveFormatAreas(reservation);
  
  // 4. Place data (will be masked later)
  placeData(matrix, reservation, data);
  
  return matrix;
}
