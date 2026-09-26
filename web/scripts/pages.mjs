import { copyFile, mkdir } from 'node:fs/promises';

// Known public entry points return 200; dynamic room URLs use Pages' SPA fallback.
for (const route of ['shared', 'new']) {
  await mkdir(`dist/${route}`, { recursive: true });
  await copyFile('dist/index.html', `dist/${route}/index.html`);
}
await copyFile('dist/index.html', 'dist/404.html');
