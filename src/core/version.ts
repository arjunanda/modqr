/**
 * QR Code Version Selection and Capacity Tables
 * Based on ISO/IEC 18004:2015
 */

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

/**
 * Error correction level to numeric code mapping
 * L = ~7% recovery, M = ~15%, Q = ~25%, H = ~30%
 */
export const EC_LEVEL_MAP: Record<ErrorCorrectionLevel, number> = {
  L: 1, // Low
  M: 0, // Medium
  Q: 3, // Quartile
  H: 2, // High
};

/**
 * Version information structure
 */
export interface VersionInfo {
  version: number;
  size: number; // Matrix size (version * 4 + 17)
  capacity: {
    L: number; // Data capacity in bytes for error correction level L
    M: number;
    Q: number;
    H: number;
  };
  eccBlocks: {
    L: [number, number, number, number][]; // [blocks in group 1, codewords per block, blocks in group 2, codewords per block]
    M: [number, number, number, number][];
    Q: [number, number, number, number][];
    H: [number, number, number, number][];
  };
  alignmentPatterns: number[]; // Center coordinates of alignment patterns
}

/**
 * QR Code version capacity table (versions 1-40)
 * Each version supports different data capacities based on error correction level
 */
export const VERSION_TABLE: VersionInfo[] = [
  // Version 1
  {
    version: 1,
    size: 21,
    capacity: { L: 17, M: 14, Q: 11, H: 7 },
    eccBlocks: {
      L: [[1, 19, 0, 0]],
      M: [[1, 16, 0, 0]],
      Q: [[1, 13, 0, 0]],
      H: [[1, 9, 0, 0]],
    },
    alignmentPatterns: [],
  },
  // Version 2
  {
    version: 2,
    size: 25,
    capacity: { L: 32, M: 26, Q: 20, H: 14 },
    eccBlocks: {
      L: [[1, 34, 0, 0]],
      M: [[1, 28, 0, 0]],
      Q: [[1, 22, 0, 0]],
      H: [[1, 16, 0, 0]],
    },
    alignmentPatterns: [18],
  },
  // Version 3
  {
    version: 3,
    size: 29,
    capacity: { L: 53, M: 42, Q: 32, H: 24 },
    eccBlocks: {
      L: [[1, 55, 0, 0]],
      M: [[1, 44, 0, 0]],
      Q: [[2, 17, 0, 0]],
      H: [[2, 13, 0, 0]],
    },
    alignmentPatterns: [22],
  },
  // Version 4
  {
    version: 4,
    size: 33,
    capacity: { L: 78, M: 62, Q: 46, H: 34 },
    eccBlocks: {
      L: [[1, 80, 0, 0]],
      M: [[2, 32, 0, 0]],
      Q: [[2, 24, 0, 0]],
      H: [[4, 9, 0, 0]],
    },
    alignmentPatterns: [26],
  },
  // Version 5
  {
    version: 5,
    size: 37,
    capacity: { L: 106, M: 84, Q: 60, H: 44 },
    eccBlocks: {
      L: [[1, 108, 0, 0]],
      M: [[2, 43, 0, 0]],
      Q: [[2, 15, 2, 16]],
      H: [[2, 11, 2, 12]],
    },
    alignmentPatterns: [30],
  },
  // Version 6
  {
    version: 6,
    size: 41,
    capacity: { L: 134, M: 106, Q: 74, H: 58 },
    eccBlocks: {
      L: [[2, 68, 0, 0]],
      M: [[4, 27, 0, 0]],
      Q: [[4, 19, 0, 0]],
      H: [[4, 15, 0, 0]],
    },
    alignmentPatterns: [34],
  },
  // Version 7
  {
    version: 7,
    size: 45,
    capacity: { L: 154, M: 122, Q: 86, H: 64 },
    eccBlocks: {
      L: [[2, 78, 0, 0]],
      M: [[4, 31, 0, 0]],
      Q: [[2, 14, 4, 15]],
      H: [[4, 13, 1, 14]],
    },
    alignmentPatterns: [22, 38],
  },
  // Version 8
  {
    version: 8,
    size: 49,
    capacity: { L: 192, M: 152, Q: 108, H: 84 },
    eccBlocks: {
      L: [[2, 97, 0, 0]],
      M: [[2, 38, 2, 39]],
      Q: [[4, 18, 2, 19]],
      H: [[4, 14, 2, 15]],
    },
    alignmentPatterns: [24, 42],
  },
  // Version 9
  {
    version: 9,
    size: 53,
    capacity: { L: 230, M: 180, Q: 130, H: 98 },
    eccBlocks: {
      L: [[2, 116, 0, 0]],
      M: [[3, 36, 2, 37]],
      Q: [[4, 16, 4, 17]],
      H: [[4, 12, 4, 13]],
    },
    alignmentPatterns: [26, 46],
  },
  // Version 10
  {
    version: 10,
    size: 57,
    capacity: { L: 271, M: 213, Q: 151, H: 119 },
    eccBlocks: {
      L: [[2, 68, 2, 69]],
      M: [[4, 43, 1, 44]],
      Q: [[6, 19, 2, 20]],
      H: [[6, 15, 2, 16]],
    },
    alignmentPatterns: [28, 50],
  },
];

/**
 * Select the minimum QR code version that can fit the given data
 * @param dataLength Length of data in bytes
 * @param ecLevel Error correction level
 * @returns Version info or null if data is too large
 */
export function selectVersion(
  dataLength: number,
  ecLevel: ErrorCorrectionLevel
): VersionInfo | null {
  // Add 3 bytes for mode indicator (4 bits), character count (8-16 bits), and terminator
  const requiredCapacity = dataLength;

  for (const versionInfo of VERSION_TABLE) {
    if (versionInfo.capacity[ecLevel] >= requiredCapacity) {
      return versionInfo;
    }
  }

  // Data too large for QR code (max version 10 in this implementation)
  // Full implementation would support versions 1-40
  return null;
}

/**
 * Get version info by version number
 */
export function getVersionInfo(version: number): VersionInfo | null {
  return VERSION_TABLE.find((v) => v.version === version) || null;
}

/**
 * Calculate total number of data codewords for a version and EC level
 */
export function getTotalDataCodewords(
  version: number,
  ecLevel: ErrorCorrectionLevel
): number {
  const versionInfo = getVersionInfo(version);
  if (!versionInfo) return 0;

  const blocks = versionInfo.eccBlocks[ecLevel];
  let total = 0;

  for (const [g1Blocks, g1Codewords, g2Blocks, g2Codewords] of blocks) {
    total += g1Blocks * g1Codewords + g2Blocks * g2Codewords;
  }

  return total;
}

/**
 * Get alignment pattern positions for a given version
 * Returns array of [row, col] coordinates
 */
export function getAlignmentPatternPositions(
  version: number
): [number, number][] {
  const versionInfo = getVersionInfo(version);
  if (!versionInfo || versionInfo.alignmentPatterns.length === 0) {
    return [];
  }

  const positions: [number, number][] = [];
  const coords = versionInfo.alignmentPatterns;

  const size = versionInfo.size;

  // Alignment patterns are placed at intersections of coordinates
  // except where they would overlap with finder patterns (8x8 area)
  for (const row of coords) {
    for (const col of coords) {
      // Check if the 5x5 alignment pattern (centered at row, col)
      // overlaps with any of the three 8x8 finder pattern areas.
      
      // Top-left finder: (0,0) to (8,8)
      if (row - 2 < 9 && col - 2 < 9) continue;
      
      // Top-right finder: (0, size - 9) to (8, size - 1)
      if (row - 2 < 9 && col + 2 > size - 9) continue;
      
      // Bottom-left finder: (size - 9, 0) to (size - 1, 8)
      if (row + 2 > size - 9 && col - 2 < 9) continue;

      positions.push([row, col]);
    }
  }

  return positions;
}
/**
 * Calculate the number of available modules for data and ECC
 * @param version QR version
 * @returns Number of available modules
 */
export function getAvailableModules(version: number): number {
  const size = 17 + version * 4;
  const reservation = Array.from({ length: size }, () => Array(size).fill(false));
  
  // 1. Finder patterns + separators (8x8 areas)
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (i < 8 && j < 8) reservation[i][j] = true; // Top-left
      if (i < 8 && size - 1 - j >= size - 8) reservation[i][size - 1 - j] = true; // Top-right
      if (size - 1 - i >= size - 8 && j < 8) reservation[size - 1 - i][j] = true; // Bottom-left
    }
  }
  
  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    reservation[6][i] = true;
    reservation[i][6] = true;
  }
  
  // 3. Alignment patterns
  if (version >= 2) {
    const positions = getAlignmentPatternPositions(version);
    for (const [row, col] of positions) {
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          reservation[row + r][col + c] = true;
        }
      }
    }
  }
  
  // 4. Format info areas
  for (let i = 0; i < 9; i++) {
    reservation[8][i] = true; // Top-left horizontal
    reservation[i][8] = true; // Top-left vertical
  }
  for (let i = 0; i < 8; i++) {
    reservation[8][size - 1 - i] = true; // Top-right horizontal
  }
  for (let i = 0; i < 8; i++) {
    reservation[size - 1 - i][8] = true; // Bottom-left vertical
  }
  
  // 5. Version info areas (for version >= 7)
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reservation[size - 11 + j][i] = true; // Bottom-left
        reservation[i][size - 11 + j] = true; // Top-right
      }
    }
  }
  
  // 6. Dark module
  reservation[size - 8][8] = true;
  
  // Count unreserved modules
  let count = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reservation[r][c]) {
        count++;
      }
    }
  }
  
  return count;
}
