# ModQR

[![npm version](https://img.shields.io/npm/v/modqr.svg)](https://www.npmjs.com/package/modqr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight and highly customizable QR Code generator for JavaScript and TypeScript with **zero external dependencies**. Native implementation of ISO/IEC 18004 standard with advanced styling, custom finder patterns, and logo integration.

[**📚 Full Documentation**](https://modqr.free.nf/)

## Features

- ✅ **Zero Dependencies** - No external packages, no polyfills.
- ✅ **Advanced Styling** - 15+ module styles and 9+ finder pattern styles.
- ✅ **Custom Finder Styles** - Style each corner (Top-Left, Top-Right, Bottom-Left) independently.
- ✅ **Multiple Renderers** - High-fidelity SVG, Canvas, and ASCII output.
- ✅ **Logo Support** - Overlay logos with automatic module clearing and background padding.
- ✅ **TypeScript First** - Full type safety and IntelliSense.
- ✅ **Universal** - Works in Browser, Node.js, and Edge runtimes.
- ✅ **Error Correction** - Reed-Solomon implementation (L, M, Q, H levels).

## Installation

```bash
npm install modqr
```

## Quick Start

### Browser (SVG)

```javascript
import { generateQR } from "modqr";

const qr = generateQR("https://github.com/arjunanda/modqr", {
  style: "liquid",
  finderStyle: "leaf",
  foreground: "#6366f1",
  logo: {
    src: "https://example.com/logo.png",
    size: 0.2,
  },
});

document.body.innerHTML = qr.svg;
```

### Browser (Canvas)

```javascript
import { generateQR } from "modqr";

const canvas = document.getElementById("qr-canvas");
const qr = generateQR("https://example.com", {
  renderer: "canvas",
  style: "blob",
  finderStyle: "extra-rounded",
  foreground: "#f43f5e",
});

qr.drawCanvas(canvas);
```

## Styling Options

### Module Styles (`style`)

`square` (default), `dots`, `rounded`, `liquid`, `blob`, `wave`, `pixel`, `gradient`, `neon`, `glass`, `dot-matrix`, `diamond`, `star`, `glitch`, `plus-cross`, `smooth-connected`.

### Finder Styles (`finderStyle`)

`square` (default), `rounded`, `extra-rounded`, `dots`, `leaf`, `rounded-tl`, `rounded-tr`, `rounded-bl`, `rounded-br`, `round-tr-cut`, `round-br-cut`, `round-tl-cut`, `round-bl-cut`.

### Custom Finder Styles

You can customize each corner individually:

```javascript
const qr = generateQR("Data", {
  customFinderStyles: {
    topLeft: "rounded",
    topRight: "leaf",
    bottomLeft: "dots",
  },
});
```

### Finder Colors

You can set a global color for all finders or customize each corner:

```javascript
const qr = generateQR("Data", {
  foreground: "#000000",
  // Global finder color
  finderColor: "#ff0000",

  // Or per-corner color
  customFinderStyles: {
    topLeft: { style: "rounded", color: "#ff0000" },
    topRight: { style: "dots", color: "#00ff00" },
    bottomLeft: "leaf", // Inherits finderColor or foreground
  },
});
```

## API Reference

### `generateQR(data, options)`

Main function for QR code generation.

**Parameters:**

- `data` (string): Data to encode
- `options` (object, optional):
  - `size` (number): Output size in pixels (default: 300)
  - `margin` (number): Quiet zone size in modules (default: 4)
  - `foreground` (string): Foreground color (default: '#000000')
  - `background` (string): Background color (default: '#ffffff')
  - `errorCorrection` ('L' | 'M' | 'Q' | 'H'): Error correction level (default: 'M')
  - `style` (QRStyle): Module style (default: 'square')
  - `finderStyle` (FinderStyle): Global finder pattern style
  - `finderColor` (string): Global finder pattern color (default: inherits foreground)
  - `customFinderStyles` (object): Individual finder styles
  - `renderer` ('svg' | 'canvas' | 'ascii'): Output renderer (default: 'svg')
  - `logo` (object, optional): Logo overlay configuration
    - `src` (string): Logo image URL/source
    - `size` (number): Logo size as fraction of QR code (0.1 - 0.3, default: 0.2)
    - `background` (string): Logo background color (default: '#ffffff')
    - `margin` (number): Logo margin in modules (default: 2)

**Returns:** `QRResult` object containing:

- `svg` (string): SVG markup (if renderer is 'svg')
- `drawCanvas` (function): Function to draw on canvas (if renderer is 'canvas')
- `ascii` (string): ASCII art representation (if renderer is 'ascii')
- `matrix` (boolean[][]): Raw QR code matrix
- `version` (number): QR code version (1-40)

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please ensure:

- Zero dependencies policy is maintained.
- All code is properly typed.
- New styles include both SVG and Canvas implementations.

## Acknowledgments

Implemented based on ISO/IEC 18004:2015 specification.
