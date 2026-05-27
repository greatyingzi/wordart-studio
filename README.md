# WordArt Studio

A powerful, fully customizable WordArt generator — create stunning animated text effects with full control over typography, colors, curves, animations, and visual effects.

![WordArt Studio Preview](preview.png)

## Features

- **12 Built-in Presets** — Rainbow, Neon, Fire, Ice, Chrome, Dream, Retro, Power, Nature, Sky, Sunset, Matrix
- **9 Curve Types** — Straight, Arch, Arc, Wave, Slant, Coil, Bounce, Pulse, Shake
- **9 Animation Modes** — Idle, Wave, Bounce, Spin, Pulse, Flicker, Shake, Glitch, Rainbow
- **Fully Customizable** — Every parameter exposed: font, size, spacing, colors, gradient direction, outline, extrusion depth, speeds, particle types/count
- **High-Res Export** — PNG/JPG/WEBP at 1x/2x/4x scale
- **Share Configurations** — Encode your settings into a URL to share with anyone
- **Undo/Redo** — Full history stack with Ctrl+Z / Ctrl+Y support
- **Keyboard Shortcuts** — Ctrl+S to quick-export

## Tech Stack

Zero dependencies. Pure HTML + CSS + vanilla JavaScript with Canvas 2D rendering.

- Real-time 60fps Canvas animation
- CSS custom properties for theming
- Responsive layout (desktop panels collapse on mobile)

## Development

Just open `index.html` in any modern browser. No build step needed.

```bash
# Quick local server (optional)
npx serve .
# or
python3 -m http.server 8080
```

## Deployment

### Cloudflare Pages (Recommended)

1. Push code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create Page
3. Connect your GitHub repository
4. Framework preset: **Other**
5. Build command: leave blank (static site)
6. Output directory: `/`

That's it — Cloudflare Pages serves static files directly, no build step needed.

### Netlify Alternative

Same flow — connect repo, publish dir: `/`, no build command.

## Usage Guide

1. Select a **preset** from the Style tab, or start from scratch
2. Adjust **text** (content, font, size, spacing, weight)
3. Choose a **curve** shape and tweak curvature/amplitude
4. Pick an **animation** mode and adjust speed/frequency
5. Enable **effects** (glow, particles, grid, scanlines)
6. Hit **Export** to download, or **Share** to get a URL

## License

MIT
