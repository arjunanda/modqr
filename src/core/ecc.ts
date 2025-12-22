/**
 * Reed-Solomon Error Correction
 * Implements error correction code generation for QR codes
 * Based on Galois Field GF(2^8) with primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
 */

import type { ErrorCorrectionLevel, VersionInfo } from './version.js';

/**
 * Galois Field GF(256) exponential table
 * exp[i] = 2^i in GF(256)
 */
const GF_EXP: number[] = new Array(256);

/**
 * Galois Field GF(256) logarithm table
 * log[exp[i]] = i
 */
const GF_LOG: number[] = new Array(256);

/**
 * Initialize Galois Field tables
 * Primitive polynomial: x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
 */
function initGaloisField(): void {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    
    // Multiply by 2 (x) in GF(256)
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d; // Reduce by primitive polynomial
    }
  }
  
  // Extend exp table for convenience (wraps around)
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
}

// Initialize on module load
initGaloisField();

/**
 * Multiply two numbers in GF(256)
 */
function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}



/**
 * Polynomial multiplication in GF(256)
 * Polynomials are represented as arrays of coefficients (highest degree first)
 */
function polyMultiply(poly1: number[], poly2: number[]): number[] {
  const result = new Array(poly1.length + poly2.length - 1).fill(0);
  
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      result[i + j] ^= gfMultiply(poly1[i], poly2[j]);
    }
  }
  
  return result;
}

/**
 * Generate Reed-Solomon generator polynomial
 * Generator polynomial = (x - α^0)(x - α^1)...(x - α^(n-1))
 * where α is the primitive element (2 in GF(256))
 * @param degree Number of error correction codewords
 */
function generateGeneratorPolynomial(degree: number): number[] {
  // Start with polynomial (x - α^0) = (x - 1)
  let generator = [1];
  
  // Multiply by (x - α^i) for i = 0 to degree-1
  for (let i = 0; i < degree; i++) {
    const factor = [1, GF_EXP[i]]; // (x - α^i)
    generator = polyMultiply(generator, factor);
  }
  
  return generator;
}

/**
 * Polynomial division in GF(256)
 * Returns the remainder of dividend / divisor
 */
function polyDivide(dividend: number[], divisor: number[]): number[] {
  // Make a copy of dividend (we'll modify it)
  const result = [...dividend];
  
  // Perform polynomial long division
  for (let i = 0; i < dividend.length - divisor.length + 1; i++) {
    const coef = result[i];
    
    if (coef !== 0) {
      for (let j = 1; j < divisor.length; j++) {
        if (divisor[j] !== 0) {
          result[i + j] ^= gfMultiply(divisor[j], coef);
        }
      }
    }
  }
  
  // Return remainder (last divisor.length - 1 terms)
  return result.slice(dividend.length - divisor.length + 1);
}

/**
 * Generate error correction codewords for a data block
 * @param data Data codewords
 * @param eccCount Number of error correction codewords to generate
 * @returns Error correction codewords
 */
export function generateErrorCorrection(
  data: number[],
  eccCount: number
): number[] {
  // Generate generator polynomial
  const generator = generateGeneratorPolynomial(eccCount);
  
  // Multiply data by x^eccCount (shift left by eccCount positions)
  const dividend = [...data, ...new Array(eccCount).fill(0)];
  
  // Divide and get remainder
  const remainder = polyDivide(dividend, generator);
  
  // Pad remainder to eccCount length if needed
  while (remainder.length < eccCount) {
    remainder.unshift(0);
  }
  
  return remainder;
}

/**
 * Get number of error correction codewords per block
 * @param versionInfo Version information
 * @param ecLevel Error correction level
 * @param blockIndex Block index
 * @returns Number of error correction codewords
 */
export function getEccCountPerBlock(
  versionInfo: VersionInfo,
  ecLevel: ErrorCorrectionLevel,
  _blockIndex: number
): number {
  const eccBlocks = versionInfo.eccBlocks[ecLevel];
  
  // Calculate total codewords and data codewords
  const size = versionInfo.size;
  const totalCodewords = Math.floor(((size * size) - 
    (3 * 64) - // Finder patterns
    (2 * (size - 16)) - // Timing patterns
    36 - // Format info (2x)
    (versionInfo.version >= 7 ? 67 : 0)) / 8); // Version info if applicable
  
  let totalDataCodewords = 0;
  for (const [g1Blocks, g1Codewords, g2Blocks, g2Codewords] of eccBlocks) {
    totalDataCodewords += g1Blocks * g1Codewords + g2Blocks * g2Codewords;
  }
  
  const totalEccCodewords = totalCodewords - totalDataCodewords;
  
  // Calculate ECC per block
  let totalBlocks = 0;
  for (const [g1Blocks, , g2Blocks] of eccBlocks) {
    totalBlocks += g1Blocks + g2Blocks;
  }
  
  return Math.floor(totalEccCodewords / totalBlocks);
}

/**
 * Generate error correction codewords for all data blocks
 * @param dataBlocks Array of data blocks
 * @param versionInfo Version information
 * @param ecLevel Error correction level
 * @returns Array of error correction blocks
 */
export function generateErrorCorrectionBlocks(
  dataBlocks: number[][],
  versionInfo: VersionInfo,
  ecLevel: ErrorCorrectionLevel
): number[][] {
  const eccBlocks: number[][] = [];
  
  for (let i = 0; i < dataBlocks.length; i++) {
    const eccCount = getEccCountPerBlock(versionInfo, ecLevel, i);
    const ecc = generateErrorCorrection(dataBlocks[i], eccCount);
    eccBlocks.push(ecc);
  }
  
  return eccBlocks;
}
