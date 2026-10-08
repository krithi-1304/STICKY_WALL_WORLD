# Playwright pre-launch tests

Run from `web`:

```sh
pnpm install --frozen-lockfile
npx playwright install chromium
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:ci
npm run test:e2e:typecheck
npx playwright show-report
```

The runner builds the production Pages bundle and owns a preview server at
`http://127.0.0.1:5190/STICKY_WALL_WORLD/`. Keep port 5190 free. It deliberately
does not reuse an existing server, preventing stale build results. Use
`--project=chromium` or `--grep 'test name'` to narrow a run. On this workspace,
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select the already installed Chromium;
ordinary installs and CI use Playwright's bundled version.

## Isolation and authentication

`fixtures.ts` creates synthetic AES-GCM encrypted seeds with the production
archive format. It derives the seed once per worker, inserts only ciphertext
into a fresh test context, and uses the real unlock form. `authedPage` handles
this setup so journey tests do not repeat login code. Each test owns a separate
browser context and IndexedDB; closing the context cleans up all data.

An unlocked archive cannot be represented by Playwright storageState: its key
is intentionally memory-only. No auth file or application authentication bypass
is added. Tests of creation, wrong phrases, restore and reset exercise those
forms separately. Download fixtures use test-specific output directories.

## Coverage

- Archive creation, bad phrases, malformed backups, refresh and lock boundaries.
- Hide during pending unlock, concealed save-failure export/retry, concurrent tabs.
- Rooms, search/rename/delete, empty states, 500-room limit, final Keep validation.
- Notes, long/multilingual text, rapid writes, confirmation and reload persistence.
- Backup/restore, passphrase rotation and explicit start-fresh recovery.
- Separate item locks and temporary previews; locked content excluded from shares.
- Real share creation, link/file recipients, bad phrase/payload, reveal, Close, refresh.
- Corrupt/valid media, unsafe links, inert markup and plaintext marker checks.
- Light, sound controls, repeated falling-letter toggles, keyboard and 360px layouts.
- Reduced motion, help, failed font requests, offline local editing.
- Production CSP, every generated entry point, cross-origin frame rejection.

`.github/workflows/e2e.yml` runs on every pull request and manual dispatch. It
uses Chromium plus a 360px touch-emulated project, then runs all 13 incumbent
feature scripts plus the edge/security matrices against an isolated dev server.
Those supplemental scripts retain deeper audio, large-media, matchstick,
visibility, nested-lock and capacity probes. They have console logs and their
existing screenshots; **their child browsers are not covered by the new
runner's traces**. The primary native suite is fully traced on failure.

## Failure artifacts

Native tests retain `test-results/**/trace.zip`, failed-page screenshots, error
context, JSON results, and `playwright-report/`. Open a trace with:

```sh
npx playwright show-trace test-results/<failed-test>/trace.zip
```

CI retries twice and uploads artifacts for seven days. Local runs do not retry,
so failures are visible immediately. Uncaught page errors fail native tests.
Artifacts contain only synthetic data and are ignored by Git. CI runs with
read-only repository permissions and no deployment or application secrets.

## Limits

There is no expiring server session or data API: relock/reload and browser storage
failures replace those cases. Offline editing is expected to work after the app
has loaded; offline first load is not supported. Font-network errors must not
prevent local work. Cross-origin framing uses a real temporary local HTTP server,
not request interception, to avoid Chromium's public-to-local network blocking.

Mobile tests emulate Chromium, not real iOS/Android hardware. Safari/Firefox,
OS download dialogs, real clipboard prompts, audible speaker output and a human
screen-reader/usability review remain separate checks. The GitHub workflow itself
cannot be confirmed until it runs on a PR. Passing these tests is not a security
certification.
