/**
 * QR Code Masking and Penalty Calculation
 * Implements mask pattern application and penalty score calculation
 */

import type { QRMatrix } from './matrix.js';
import { createMatrix } from './matrix.js';

/**
 * Mask pattern functions (8 patterns defined in ISO/IEC 18004)
 */
const MASK_PATTERNS: Array<(row: number, col: number) => boolean> = [
  (row, col) => (row + col) % 2 === 0,
  (row, _col) => row % 2 === 0,
  (_row, col) => col % 3 === 0,
  (row, col) => (row + col) % 3 === 0,
  (row, col) => (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0,
  (row, col) => ((row * col) % 2) + ((row * col) % 3) === 0,
  (row, col) => (((row * col) % 2) + ((row * col) % 3)) % 2 === 0,
  (row, col) => (((row + col) % 2) + ((row * col) % 3)) % 2 === 0,
];

/**
 * Apply mask pattern to matrix
 * @param matrix Original matrix
 * @param pattern Mask pattern number (0-7)
 * @param reservation Reservation map (function patterns not masked)
 * @returns Masked matrix
 */
export function applyMask(
  matrix: QRMatrix,
  pattern: number,
  reservation: boolean[][]
): QRMatrix {
  const size = matrix.length;
  const masked = createMatrix(size);
  const maskFn = MASK_PATTERNS[pattern];
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Don't mask function patterns
      if (reservation[row][col]) {
        masked[row][col] = matrix[row][col];
      } else {
        // XOR with mask pattern
        masked[row][col] = matrix[row][col] !== maskFn(row, col);
      }
    }
  }
  
  return masked;
}

/**
 * Calculate penalty score for a matrix
 * Lower score is better
 */
export function calculatePenalty(matrix: QRMatrix): number {
  let penalty = 0;
  
  penalty += penaltyRule1(matrix); // Adjacent modules in row/column
  penalty += penaltyRule2(matrix); // Block of modules
  penalty += penaltyRule3(matrix); // Finder-like patterns
  penalty += penaltyRule4(matrix); // Balance of dark/light modules
  
  return penalty;
}

/**
 * Penalty Rule 1: Adjacent modules in same color
 * 5 or more consecutive modules: N1 + (n - 5) where N1 = 3
 */
function penaltyRule1(matrix: QRMatrix): number {
  const size = matrix.length;
  const N1 = 3;
  let penalty = 0;
  
  // Check rows
  for (let row = 0; row < size; row++) {
    let count = 1;
    let prev = matrix[row][0];
    
    for (let col = 1; col < size; col++) {
      if (matrix[row][col] === prev) {
        count++;
      } else {
        if (count >= 5) {
          penalty += N1 + (count - 5);
        }
        count = 1;
        prev = matrix[row][col];
      }
    }
    
    if (count >= 5) {
      penalty += N1 + (count - 5);
    }
  }
  
  // Check columns
  for (let col = 0; col < size; col++) {
    let count = 1;
    let prev = matrix[0][col];
    
    for (let row = 1; row < size; row++) {
      if (matrix[row][col] === prev) {
        count++;
      } else {
        if (count >= 5) {
          penalty += N1 + (count - 5);
        }
        count = 1;
        prev = matrix[row][col];
      }
    }
    
    if (count >= 5) {
      penalty += N1 + (count - 5);
    }
  }
  
  return penalty;
}

/**
 * Penalty Rule 2: Block of modules in same color
 * 2x2 blocks: N2 * (number of blocks) where N2 = 3
 */
function penaltyRule2(matrix: QRMatrix): number {
  const size = matrix.length;
  const N2 = 3;
  let penalty = 0;
  
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const value = matrix[row][col];
      
      if (
        matrix[row][col + 1] === value &&
        matrix[row + 1][col] === value &&
        matrix[row + 1][col + 1] === value
      ) {
        penalty += N2;
      }
    }
  }
  
  return penalty;
}

/**
 * Penalty Rule 3: Finder-like patterns
 * Pattern: 1:1:3:1:1 ratio (dark:light:dark:light:dark)
 * Preceded or followed by 4 light modules: N3 = 40
 */
function penaltyRule3(matrix: QRMatrix): number {
  const size = matrix.length;
  const N3 = 40;
  let penalty = 0;
  
  // Pattern: 1011101 (dark, light, dark, dark, dark, light, dark)
  const pattern = [true, false, true, true, true, false, true];
  
  // Check rows
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - 7; col++) {
      if (matchPattern(matrix, row, col, pattern, true)) {
        // Pattern found, check for 4 light modules before or after
        
        // 4 light modules before
        let lightBefore = true;
        if (col < 4) {
          lightBefore = false;
        } else {
          for (let i = 1; i <= 4; i++) {
            if (matrix[row][col - i]) {
              lightBefore = false;
              break;
            }
          }
        }
        
        // 4 light modules after
        let lightAfter = true;
        if (col + 7 + 4 > size) {
          lightAfter = false;
        } else {
          for (let i = 0; i < 4; i++) {
            if (matrix[row][col + 7 + i]) {
              lightAfter = false;
              break;
            }
          }
        }
        
        if (lightBefore || lightAfter) {
          penalty += N3;
        }
      }
    }
  }
  
  // Check columns
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - 7; row++) {
      if (matchPattern(matrix, row, col, pattern, false)) {
        // Pattern found, check for 4 light modules before or after
        
        // 4 light modules before
        let lightBefore = true;
        if (row < 4) {
          lightBefore = false;
        } else {
          for (let i = 1; i <= 4; i++) {
            if (matrix[row - i][col]) {
              lightBefore = false;
              break;
            }
          }
        }
        
        // 4 light modules after
        let lightAfter = true;
        if (row + 7 + 4 > size) {
          lightAfter = false;
        } else {
          for (let i = 0; i < 4; i++) {
            if (matrix[row + 7 + i][col]) {
              lightAfter = false;
              break;
            }
          }
        }
        
        if (lightBefore || lightAfter) {
          penalty += N3;
        }
      }
    }
  }
  
  return penalty;
}

/**
 * Match pattern in row or column
 */
function matchPattern(
  matrix: QRMatrix,
  row: number,
  col: number,
  pattern: boolean[],
  horizontal: boolean
): boolean {
  for (let i = 0; i < pattern.length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    
    if (r >= matrix.length || c >= matrix.length) return false;
    if (matrix[r][c] !== pattern[i]) return false;
  }
  
  return true;
}

/**
 * Penalty Rule 4: Balance of dark and light modules
 * Deviation from 50%: N4 * k where k = |dark% - 50%| / 5, N4 = 10
 */
function penaltyRule4(matrix: QRMatrix): number {
  const size = matrix.length;
  const N4 = 10;
  
  let darkCount = 0;
  const totalModules = size * size;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (matrix[row][col]) {
        darkCount++;
      }
    }
  }
  
  const darkPercent = (darkCount * 100) / totalModules;
  const deviation = Math.abs(darkPercent - 50);
  const k = Math.floor(deviation / 5);
  
  return N4 * k;
}

/**
 * Select best mask pattern
 * @param matrices Array of matrices with different mask patterns applied
 * @returns Index of best mask pattern (0-7)
 */
export function selectBestMask(matrices: QRMatrix[]): number {
  let bestPattern = 0;
  let lowestPenalty = Infinity;
  
  for (let i = 0; i < matrices.length; i++) {
    const penalty = calculatePenalty(matrices[i]);
    
    if (penalty < lowestPenalty) {
      lowestPenalty = penalty;
      bestPattern = i;
    }
  }
  
  return bestPattern;
}

export { createReservationMap } from './matrix.js';
