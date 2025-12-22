/**
 * QR Code Data Encoding
 * Implements byte mode encoding per ISO/IEC 18004
 */

import type { ErrorCorrectionLevel, VersionInfo } from './version.js';
import { getTotalDataCodewords } from './version.js';

/**
 * Mode indicator for byte mode (0100 in binary)
 */
const MODE_BYTE = 0b0100;

/**
 * Padding bytes alternating pattern
 */
const PAD_BYTES = [0b11101100, 0b00010001];

/**
 * Encode data into QR code format
 * @param data Input string to encode
 * @param versionInfo Version information
 * @param ecLevel Error correction level
 * @returns Array of data codewords (bytes)
 */
export function encodeData(
  data: string,
  versionInfo: VersionInfo,
  ecLevel: ErrorCorrectionLevel
): number[] {
  // Convert string to bytes (UTF-8)
  const dataBytes = stringToBytes(data);
  const dataLength = dataBytes.length;

  // Calculate total data capacity in bits
  const totalDataCodewords = getTotalDataCodewords(versionInfo.version, ecLevel);
  const totalBits = totalDataCodewords * 8;

  // Build bit stream
  const bits: number[] = [];

  // 1. Mode indicator (4 bits) - Byte mode = 0100
  appendBits(bits, MODE_BYTE, 4);

  // 2. Character count indicator
  // For byte mode: 8 bits for versions 1-9, 16 bits for versions 10-26, 16 bits for 27-40
  const charCountBits = versionInfo.version < 10 ? 8 : 16;
  appendBits(bits, dataLength, charCountBits);

  // 3. Data bits
  for (const byte of dataBytes) {
    appendBits(bits, byte, 8);
  }

  // 4. Terminator (up to 4 bits of zeros)
  const terminatorLength = Math.min(4, totalBits - bits.length);
  appendBits(bits, 0, terminatorLength);

  // 5. Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // 6. Convert bits to bytes
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (bits[i + j] || 0);
    }
    codewords.push(byte);
  }

  // 7. Add padding bytes if needed
  let padIndex = 0;
  while (codewords.length < totalDataCodewords) {
    codewords.push(PAD_BYTES[padIndex % 2]);
    padIndex++;
  }

  return codewords;
}

/**
 * Convert string to byte array (UTF-8 encoding)
 */
function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    
    if (code < 0x80) {
      // 1-byte character (ASCII)
      bytes.push(code);
    } else if (code < 0x800) {
      // 2-byte character
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      // 3-byte character
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      // 4-byte character (surrogate pairs)
      const high = code;
      const low = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
      
      if (low >= 0xdc00 && low <= 0xdfff) {
        i++; // Skip low surrogate
        const codePoint = 0x10000 + ((high & 0x3ff) << 10) + (low & 0x3ff);
        bytes.push(0xf0 | (codePoint >> 18));
        bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
        bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
        bytes.push(0x80 | (codePoint & 0x3f));
      } else {
        // Invalid surrogate pair, encode as replacement character
        bytes.push(0xef, 0xbf, 0xbd);
      }
    }
  }
  
  return bytes;
}

/**
 * Append bits to bit array
 * @param bits Bit array to append to
 * @param value Value to append
 * @param length Number of bits to append
 */
function appendBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >> i) & 1);
  }
}

/**
 * Split data codewords into blocks according to error correction structure
 * @param data Data codewords
 * @param versionInfo Version information
 * @param ecLevel Error correction level
 * @returns Array of data blocks
 */
export function splitIntoBlocks(
  data: number[],
  versionInfo: VersionInfo,
  ecLevel: ErrorCorrectionLevel
): number[][] {
  const blocks: number[][] = [];
  const eccBlocks = versionInfo.eccBlocks[ecLevel];
  
  let offset = 0;
  
  for (const [g1Blocks, g1Codewords, g2Blocks, g2Codewords] of eccBlocks) {
    // Group 1 blocks
    for (let i = 0; i < g1Blocks; i++) {
      blocks.push(data.slice(offset, offset + g1Codewords));
      offset += g1Codewords;
    }
    
    // Group 2 blocks
    for (let i = 0; i < g2Blocks; i++) {
      blocks.push(data.slice(offset, offset + g2Codewords));
      offset += g2Codewords;
    }
  }
  
  return blocks;
}

/**
 * Interleave data and error correction blocks
 * @param dataBlocks Data blocks
 * @param eccBlocks Error correction blocks
 * @returns Interleaved codewords
 */
export function interleaveBlocks(
  dataBlocks: number[][],
  eccBlocks: number[][]
): number[] {
  const result: number[] = [];
  
  // Find max block length
  const maxDataLength = Math.max(...dataBlocks.map(b => b.length));
  const maxEccLength = Math.max(...eccBlocks.map(b => b.length));
  
  // Interleave data blocks
  for (let i = 0; i < maxDataLength; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) {
        result.push(block[i]);
      }
    }
  }
  
  // Interleave error correction blocks
  for (let i = 0; i < maxEccLength; i++) {
    for (const block of eccBlocks) {
      if (i < block.length) {
        result.push(block[i]);
      }
    }
  }
  
  return result;
}
