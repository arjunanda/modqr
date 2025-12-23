import { generateSVG } from '../dist/index.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const data = "https://github.com/arjunanda/modqr";

if (!existsSync('test-corners')) {
  mkdirSync('test-corners');
}

console.log('Generating QR codes with custom corner styles...');

// 1. Global finder style
const svg1 = generateSVG(data, {
  size: 400,
  finderStyle: 'rounded'
});
writeFileSync('test-corners/global-rounded.svg', svg1);
console.log('✅ Generated: test-corners/global-rounded.svg');

// 2. Extra rounded
const svg2 = generateSVG(data, {
  size: 400,
  finderStyle: 'extra-rounded'
});
writeFileSync('test-corners/global-extra-rounded.svg', svg2);
console.log('✅ Generated: test-corners/global-extra-rounded.svg');

// 3. Dots finder
const svg3 = generateSVG(data, {
  size: 400,
  finderStyle: 'dots'
});
writeFileSync('test-corners/global-dots.svg', svg3);
console.log('✅ Generated: test-corners/global-dots.svg');

// 4. Custom corners
const svg4 = generateSVG(data, {
  size: 400,
  customFinderStyles: {
    topLeft: 'leaf',
    topRight: 'rounded-tr',
    bottomLeft: 'rounded-bl'
  }
});
writeFileSync('test-corners/custom-corners.svg', svg4);
console.log('✅ Generated: test-corners/custom-corners.svg');

// 5. Leaf style global
const svg5 = generateSVG(data, {
  size: 400,
  finderStyle: 'leaf'
});
writeFileSync('test-corners/global-leaf.svg', svg5);
console.log('✅ Generated: test-corners/global-leaf.svg');

console.log('\nDone! Check the test-corners directory.');
