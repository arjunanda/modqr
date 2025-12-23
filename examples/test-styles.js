import { generateSVG } from '../dist/index.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const data = "https://github.com/arjunanda/modqr";
const styles = [
  'liquid', 'blob', 'wave', 'pixel', 
  'gradient', 'neon', 'glass', 'dot-matrix',
  'diamond', 'star', 'glitch', 'plus-cross', 'smooth-connected'
];

if (!existsSync('test-styles')) {
  mkdirSync('test-styles');
}

console.log('Generating QR codes with advanced styles...');

for (const style of styles) {
  try {
    const svg = generateSVG(data, {
      size: 400,
      style: style,
      foreground: '#000000',
      background: '#ffffff'
    });
    writeFileSync(`test-styles/qr-${style}.svg`, svg);
    console.log(`✅ Generated: test-styles/qr-${style}.svg`);
  } catch (err) {
    console.error(`❌ Failed to generate ${style}:`, err.message);
  }
}

console.log('\nDone! Check the test-styles directory.');
