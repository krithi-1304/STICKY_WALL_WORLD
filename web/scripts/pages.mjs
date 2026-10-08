import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

// Production only: leave Vite's development connection and transforms unchanged.
const policy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-src 'none'",
].join('; ');

const html = await readFile('dist/index.html', 'utf8');
await writeFile('dist/index.html', html.replace('<head>', `<head>
<meta http-equiv="Content-Security-Policy" content="${policy}">
<meta name="referrer" content="no-referrer">`));

// Known public entry points return 200; dynamic room URLs use Pages' SPA fallback.
for (const route of ['shared', 'new']) {
  await mkdir(`dist/${route}`, { recursive: true });
  await copyFile('dist/index.html', `dist/${route}/index.html`);
}
await copyFile('dist/index.html', 'dist/404.html');
