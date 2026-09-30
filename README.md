# The Black Wall

A private diary of hanging rooms and handwritten notes. The archive is encrypted in the browser with a device-local passphrase. Sharing is an explicit, encrypted, read-only snapshot; there are no accounts or cloud synchronization.

## Use the app

Open **Help & guide** on the entry screen, archive toolbar or note editor for a searchable guide. The same [complete guide](web/src/content/help.md) can be downloaded from the site.

Browser storage belongs to a site origin. To move notes from a local preview to the hosted site, export an encrypted backup locally, then restore that file on the hosted entry screen using the original passphrase. Extra item locks retain their own passphrases.

## Develop

Use Node 22.12 or newer and pnpm 11.23.0 (the checked-in lockfile uses pnpm).

```sh
cd web
pnpm install --frozen-lockfile
npm run dev
```

## Validate

```sh
cd web
npm run lint
npm run build:pages
npx playwright install chromium
cd ..
QA_BASE_URL=http://127.0.0.1:5173 node qa/end-to-end.cjs
```

The ten active browser suites cover the encrypted archive, failure recovery, passphrase changes, media and sharing, large files, physical interactions, UI layouts, help, measured audio output and per-room motion preferences. `qa/archive-interactions.cjs` and `qa/gallery-interactions.cjs` target the retired plaintext UI and are historical fixtures.

## Hosting

`.github/workflows/pages.yml` builds, lints and runs the active browser suites before deploying pushes to `main` with GitHub Pages. Repository Pages settings must use GitHub Actions. The static artifact is `web/dist`; only the app and public assets are deployed.

`npm run build:pages` uses `/STICKY_WALL_WORLD/` as its base path and emits entry pages for `/shared/` and `/new/`. Dynamic room URLs use the custom `404.html` app fallback on refresh; Pages returns HTTP 404 for those URLs while the app still opens the correct room after unlocking. Navigation from the lobby and shared entry URLs use ordinary successful responses.

After deploying, run `QA_BASE_URL=https://krithi-1304.github.io/STICKY_WALL_WORLD/ node qa/deployment.cjs` to check the real origin, assets, encryption, reload and recipient share flow using isolated synthetic browser data.
