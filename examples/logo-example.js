/**
 * QR Code with Logo Example - Using actual logo image
 */

import { generateSVG } from '../dist/index.js';
import { writeFileSync } from 'fs';

console.log('🎨 Generating QR codes with actual logo image...\n');

// Use the generated logo image
const logoPath = 'https://image-service-cdn.seek.com.au/1bc3d061b5b9045b5586989008d4ce274a9ddb49/f3c5292cec0e05e4272d9bf9146f390d366481d0';

// Example 1: QR code with logo (20% size) - Rounded style
console.log('Example 1: QR code with logo (20% size) - Rounded style');

const qrWithLogo20 = generateSVG('https://example.com', {
  size: 500,
  errorCorrection: 'H', // High error correction needed for logo overlay
  style: 'rounded',
  foreground: '#1a73e8',
  background: '#ffffff',
  logo: {
    src: logoPath,
    size: 0.20,
    margin: 2,
    background: '#ffffff'
  }
});

writeFileSync('qrcode-with-logo-20.svg', qrWithLogo20);
console.log('✅ Generated: qrcode-with-logo-20.svg\n');

// Example 2: QR code with larger logo (25% size) - Dots style
console.log('Example 2: QR code with larger logo (25% size) - Dots style');

const qrWithLogo25 = generateSVG('file:///home/rbz/development/packages/qrcode-js/qrcode-with-logo-20.svg', {
  size: 500,
  errorCorrection: 'M',
  style: 'dots',
  foreground: '#000000',
  background: '#ffffff',
  logo: {
    src: logoPath,
    size: 0.25, // 25% of QR code size
    margin: 1,
    background: '#f0f0f0'
  }
});

writeFileSync('qrcode-with-logo-25.svg', qrWithLogo25);
console.log('✅ Generated: qrcode-with-logo-25.svg\n');

// Example 3: QR code with small logo (15% size) - Square style
console.log('Example 3: QR code with small logo (15% size) - Square style');

const qrWithLogo15 = generateSVG('https://accounts.google.com/signin/oauth/consent?authuser=2&part=AJi8hAPkel2DLtd7mYY8lTRQFMbOBhpX7xZm1pJXAtt4b9KLa_jxF8g0hewtpCmEfQ3VMYziY_942MnbKR2nverxO2ES1pMgkqjfw4idJuwS3QPjIyKgQWRMeRBUR2jQdOpzK2vTHLkS0CJWbw6qU6nmcv2zbgh7wC-NVy0KmDSoHS_lFtEvRvYcM_3a0vwneV8HwcE0O9e51osLsB0TlopOC02XLVoScJeDSKJmXdZ_e1aFZFJ1fz9DsX0IRBr-m3l3wIvnKevCwkb_8WeTiBzH6ZSg5csByUSAj7264wTbbGclGyCjkSK5bEji0IakH4q4nw_QjQcFA2-hGs1giGeZbNfBuh8LGDbD7VI5i9BLyJF_YLpctcurOFXn7Ru3fM-OGYtsI0GXrILhJkDy3IumqaPwee_HPW581u83knko1okUphI8YFNZv8Pk1WugwShTnoOoJ68UlxZfO2chmw7mH8wwBDouTKWNoMqS_8-5qMmziQcRQJ0&flowName=GeneralOAuthFlow&as=S322553770%3A1766222440518151&client_id=1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com&requestPath=%2Fsignin%2Foauth%2Fconsent&pli=1&rapt=AEjHL4M3XI7aVtJvdHOGUqLQOSC3GJ9z3vjgYIbfCpDSO1aNa8Phm5b_19ftntWQwffg5rWUwopkksnxg8bGqyi8CsX3l3jtyvYJ_7ARIFDtG_lWFSiIXhs', {
  size: 700,
  style: 'square',
  foreground: '#2e7d32',
  background: '#ffffff',
  logo: {
    src: logoPath,
    size: 0.15, // 15% of QR code size
    margin: 1,
    background: '#e8f5e9'
  }
});

writeFileSync('qrcode-with-logo-15.svg', qrWithLogo15);
console.log('✅ Generated: qrcode-with-logo-15.svg\n');

// Example 4: Comparison - without logo
console.log('Example 4: Comparison - without logo');

const qrNoLogo = generateSVG('https://example.com/home/rbz/development/packages/qrcode-js/qrcode-with-logo-20.svg', {
  size: 500,
  style: 'rounded',
  foreground: '#1a73e8',
  background: '#ffffff'
});

writeFileSync('qrcode-no-logo.svg', qrNoLogo);
console.log('✅ Generated: qrcode-no-logo.svg (for comparison)\n');

console.log('✅ All QR codes with logo generated successfully!\n');
console.log('Generated files:');
console.log('  - qrcode-with-logo-15.svg (15% logo, square style)');
console.log('  - qrcode-with-logo-20.svg (20% logo, rounded style)');
console.log('  - qrcode-with-logo-25.svg (25% logo, dots style)');
console.log('  - qrcode-no-logo.svg (no logo, for comparison)');
console.log('\n📝 Note: The logo image is embedded in the SVG using <image> tag.');
console.log('   Error correction level H (30%) ensures the QR code remains scannable.');
console.log('\n🔍 Open view-logo-qrcodes.html in your browser to see the results!');
