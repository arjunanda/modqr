import { generateSVG, QRCodeOptions } from '../src/index';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const OUT_DIR = 'test-colors';

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR);
}

const data = "https://modqr.free.nf/";

// Test 1: Global finder color
// Explicitly typing options to demonstrate type safety
const options1: Partial<QRCodeOptions> = {
  finderColor: '#ff0000', // Red finders
  foreground: '#000000',
};

const svg1 = generateSVG(data, options1);
writeFileSync(join(OUT_DIR, 'global-color.svg'), svg1);
console.log('Generated global-color.svg');

// Test 2: Custom corner colors
const options2: Partial<QRCodeOptions> = {
  foreground: '#000000',
  customFinderStyles: {
    topLeft: { style: 'rounded', color: '#ff0000' }, // Red
    topRight: { style: 'dots', color: '#00ff00' },   // Green
    bottomLeft: { style: 'leaf', color: '#0000ff' }  // Blue
  }
};

const svg2 = generateSVG(data, options2);
writeFileSync(join(OUT_DIR, 'custom-colors.svg'), svg2);
console.log('Generated custom-colors.svg');

// Test 3: Mixed string and object config
const options3: Partial<QRCodeOptions> = {
  foreground: '#000000',
  customFinderStyles: {
    topLeft: 'rounded', // Should be gray
    topRight: { style: 'dots', color: '#ff00ff' }, // Magenta
  }
};

const svg3 = generateSVG(data, options3);
writeFileSync(join(OUT_DIR, 'mixed-colors.svg'), svg3);
console.log('Generated mixed-colors.svg');
