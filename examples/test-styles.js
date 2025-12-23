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

// Generate HTML for comparison
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ModQR Style Comparison: SVG vs Canvas</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background: #f9fafb; }
        .comparison-row { 
            display: flex; 
            gap: 2rem; 
            margin-bottom: 3rem; 
            background: white; 
            padding: 2rem; 
            border-radius: 1rem; 
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .preview { flex: 1; display: flex; flex-direction: column; align-items: center; }
        h2 { margin-bottom: 0.5rem; text-transform: capitalize; color: #1f2937; }
        h3 { margin-bottom: 1rem; color: #6b7280; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        canvas, svg { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); border-radius: 0.5rem; }
    </style>
</head>
<body>
    <h1>SVG vs Canvas Rendering Comparison</h1>
    <div id="container"></div>

    <script type="module">
        import { generateQR } from '../dist/index.js';

        const styles = ${JSON.stringify(styles)};
        const data = "${data}";
        const container = document.getElementById('container');

        styles.forEach(style => {
            const row = document.createElement('div');
            row.className = 'comparison-row';
            
            // SVG Container
            const svgContainer = document.createElement('div');
            svgContainer.className = 'preview';
            svgContainer.innerHTML = \`
                <h2>\${style}</h2>
                <h3>SVG Renderer</h3>
                <div id="svg-\${style}"></div>
            \`;
            
            // Canvas Container
            const canvasContainer = document.createElement('div');
            canvasContainer.className = 'preview';
            canvasContainer.innerHTML = \`
                <h2>\${style}</h2>
                <h3>Canvas Renderer</h3>
                <canvas id="canvas-\${style}"></canvas>
            \`;

            row.appendChild(svgContainer);
            row.appendChild(canvasContainer);
            container.appendChild(row);

            // Render SVG
            try {
                const qrSvg = generateQR(data, {
                    size: 300,
                    style: style,
                    renderer: 'svg',
                    foreground: '#000000',
                    background: '#ffffff'
                });
                document.getElementById(\`svg-\${style}\`).innerHTML = qrSvg.svg;
            } catch (e) {
                console.error(\`Error rendering SVG for \${style}:\`, e);
            }

            // Render Canvas
            try {
                const canvas = document.getElementById(\`canvas-\${style}\`);
                const qrCanvas = generateQR(data, {
                    size: 300,
                    style: style,
                    renderer: 'canvas',
                    foreground: '#000000',
                    background: '#ffffff'
                });
                qrCanvas.drawCanvas(canvas);
            } catch (e) {
                console.error(\`Error rendering Canvas for \${style}:\`, e);
            }
        });
    </script>
</body>
</html>
`;

writeFileSync('test-styles/index.html', htmlContent);
console.log('✅ Generated: test-styles/index.html (Open this file in a browser to compare SVG vs Canvas)');
