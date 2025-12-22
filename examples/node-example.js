/**
 * Node.js Example - QR Code Generation
 * Demonstrates SVG generation and file output
 */

import { generateSVG, generateASCII, generateQR } from '../dist/index.js';
import { writeFileSync } from 'fs';

// Example 1: Generate SVG and save to file
console.log('Example 1: Generating SVG QR code...\n');

const svg = generateSVG('https://github.com', {
  size: 500,
  errorCorrection: 'H',
  style: 'rounded',
  foreground: '#1a73e8',
  background: '#ffffff'
});

writeFileSync('qrcode.svg', svg);
console.log('✅ SVG QR code saved to qrcode.svg\n');

// Example 2: Generate ASCII QR code for terminal
console.log('Example 2: ASCII QR code\n');

const ascii = generateASCII('Hello, World!', {
  margin: 2
});

console.log(ascii);

// Example 3: Generate multiple QR codes with different styles
console.log('\nExample 3: Generating multiple styled QR codes...\n');

const styles = ['square', 'dots', 'rounded'];
const data = 'https://example.com';

styles.forEach(style => {
  const svg = generateSVG(data, {
    size: 400,
    style,
    foreground: '#000000',
    background: '#ffffff',
    errorCorrection: 'M'
  });
  
  writeFileSync(`qrcode-${style}.svg`, svg);
  console.log(`✅ Generated qrcode-${style}.svg`);
});

// Example 4: Get QR code information
console.log('\nExample 4: QR code information\n');

const result = generateQR('https://example.com/very/long/url/path', {
  errorCorrection: 'L'
});

console.log(`Version: ${result.version}`);
console.log(`Matrix Size: ${result.matrix.length}×${result.matrix.length}`);
console.log(`Error Correction: ${result.errorCorrectionLevel}`);

// Example 5: Generate QR code with different error correction levels
console.log('\nExample 5: Error correction comparison\n');

const ecLevels = ['L', 'M', 'Q', 'H'];
const testData = 'Error correction test';

ecLevels.forEach(level => {
  const result = generateQR(testData, { errorCorrection: level });
  console.log(`${level} (${['7%', '15%', '25%', '30%'][ecLevels.indexOf(level)]} recovery): Version ${result.version}, ${result.matrix.length}×${result.matrix.length}`);
});

console.log('\n✅ All examples completed!');
console.log('\nGenerated files:');
console.log('  - qrcode.svg');
console.log('  - qrcode-square.svg');
console.log('  - qrcode-dots.svg');
console.log('  - qrcode-rounded.svg');
