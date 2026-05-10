# Architecture Notes

## Runtime

This is a static browser project hosted on GitHub Pages.
The main runtime is p5.js in the browser.

## Main files

- `index.html`: entry point loaded by GitHub Pages
- `sketch.js`: main p5.js sketch logic
- `style.css`: page and canvas styling
- `assets/`: images, markers, models, textures, or other media
- `libs/`: local third-party libraries if any

## AR assumptions

Document the AR library or technique here, for example:
- p5.js only
- p5.js + ml5.js
- p5.js + AR.js
- p5.js + MediaPipe
- WebXR
- custom camera overlay

## Deployment

The project is deployed as static files on GitHub Pages.
Avoid server-only code.
Avoid build steps unless explicitly introduced.

## Mobile constraints

- HTTPS required for camera access on deployed site
- Must support mobile viewport
- Must consider orientation
- Must handle camera permission errors gracefully