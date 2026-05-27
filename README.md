# WordArt Studio

A powerful, fully customizable WordArt generator — create stunning animated text effects with full control over typography, colors, curves, animations, and visual effects. Export as static images or animations (GIF, MP4/WebM).

![WordArt Studio](preview.png)

## Features

### Visual Creation
- **12 Built-in Presets** — Rainbow, Neon, Fire, Ice, Chrome, Dream, Retro, Power, Nature, Sky, Sunset, Matrix
- **9 Curve Types** — Straight, Arch, Arc, Wave, Slant, Coil, Bounce, Pulse, Shake
- **9 Animation Modes** — Idle, Wave, Bounce, Spin, Pulse, Flicker, Shake, Glitch, Rainbow
- **4 Particle Systems** — Stars, Embers, Snow, Dots (adjustable count)
- **Visual Effects** — Glow (blur/opacity), perspective grid, scanlines
- **Full Typography Control** — 8 fonts, size, weight, letter spacing
- **Rich Styling** — Dual-color gradients (4 directions), outline color/width, 3D extrusion depth

### Export Formats
- **Static Images** — PNG, JPG, WEBP at 1x/2x/4x resolution
- **GIF** — Animated GIF with configurable duration (1-10s) and FPS (10-60)
- **MP4/WebM** — Video export via MediaRecorder API (VP9/H.264 codec)
- **Live Recording** — Click Record to capture real-time animation, then export

### Workflow
- **Undo/Redo** — Full history stack (Ctrl+Z / Ctrl+Y)
- **Share Configurations** — Encode settings into a URL to share
- **Keyboard Shortcuts** — Space to record, Ctrl+S to export
- **Responsive** — Works on desktop and mobile

## Tech Stack

**Zero build dependencies.** Pure HTML + CSS + vanilla JavaScript with Canvas 2D.

External libraries (loaded at runtime from CDN):
- [gif.js](https://github.com/jnordberg/gif.js) — GIF encoding (only loaded when exporting GIF)

## Local Development

Just open `index.html` in any modern browser. No build step needed.

```bash
# Optional: local server for better experience
npx serve .
# or
python3 -m http.server 8080
```

## Deployment

### Cloudflare Pages

1. Push to GitHub
2. Cloudflare Dashboard → Workers & Pages → Create Page
3. Connect GitHub repository
4. Framework preset: **Other**
5. Build command: (leave blank)
6. Output directory: `/`

### GitHub Pages

Already configured — enabled via `Settings → Pages → Source: main branch`.

Visit: https://greatyingzi.github.io/wordart-studio/

## Browser Support

- Static export: All browsers with Canvas 2D
- GIF export: Requires gif.js to load from CDN (Chrome, Firefox, Edge, Safari)
- Video export: Requires `MediaRecorder` + `captureStream` (Chrome, Edge, Firefox; Safari limited)

## License

MIT
