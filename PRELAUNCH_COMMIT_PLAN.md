# Pre-launch atomic commit plan

Execution status — October 9: the user authorized execution of this reviewed
sequence. Created 2e5fe87 (security), a963c01 (E2E), ef54a52 (CI), and b052a02
(cleanup). The final documentation commit records this execution and evidence.
No push or deployment is included. The commands below are the original reviewed
recipe, retained for audit; do not rerun them against the new HEAD.

| Order | Intent | Why this is independently reviewable |
|---|---|---|
| 1 | Security fix | Frame guard and production CSP only; no test or cleanup changes. |
| 2 | Test infrastructure | Runner, encrypted fixtures, test IDs, scripts and dependency additions together. |
| 3 | CI | Workflow depends on the test commands in commit 2. |
| 4 | Approved cleanup | Remove unreachable code and its dependency together, preserving a buildable tree. |
| 5 | Documentation | Evidence, operating instructions and this exact command plan. |

No breaking public API rename or persisted-format change is intended. Only the
approved unreferenced exports are removed. Unused store actions, crypto helper
extraction and CSS/file splitting are explicitly deferred.

The package files contain two different intents. The embedded index-only patch
stages the Playwright additions in commit 2 while retaining framer-motion there.
Commit 4 stages the remaining dependency deletion alongside its consumer's
removal. This avoids a commit with an unresolved framer-motion import. The patch
was checked against the current index without modifying the real staging area.

The security stage and complete pre-cleanup source state were validated during
Stages 1–2. The post-cleanup state is checked again. CI and documentation commits
do not change runtime behavior. Separate historical commit checkouts were not
created or claimed as tested; actual GitHub workflow execution remains pending.

## Exact commands

The block contains the complete file lists, literal partial-staging patch and
Conventional Commits messages. Review the diff before running it. It intentionally
does not stage unrelated paths or use `git add .`.

```sh
set -e
cd '/Users/krithi/Desktop/Sticky wall'
# This recipe targets the reviewed baseline and an empty staging area.
test "$(git rev-parse HEAD)" = '5e6c8ec1ae083d17b462d972c2d532c2b214f721'
git diff --cached --quiet

# 1. Security hardening only.
git add web/src/main.tsx web/scripts/pages.mjs
git commit -F - <<'MESSAGE'
fix(security): block framing and restrict production CSP

Prevent the private archive UI from mounting inside a frame and
restrict script, connection and media sources in the Pages build.

Keep development connections unchanged. The render guard is a
fallback; response-level frame-ancestors remains a hosting concern.
MESSAGE

# 2. Stage ONLY the test-runner package additions, retaining framer-motion
# in this commit. The working files remain untouched by --cached.
git apply --cached <<'TOOLING_PATCH'
diff --git a/web/package.json b/web/package.json
index d298766..afda0fe 100644
--- a/web/package.json
+++ b/web/package.json
@@ -8,7 +8,11 @@
     "build": "tsc -b && vite build",
     "build:pages": "tsc -b && vite build --base=/STICKY_WALL_WORLD/ && node scripts/pages.mjs",
     "lint": "oxlint",
-    "preview": "vite preview"
+    "preview": "vite preview",
+    "test:e2e": "playwright test",
+    "test:e2e:ui": "playwright test --ui",
+    "test:e2e:ci": "playwright test --forbid-only --retries=2",
+    "test:e2e:typecheck": "tsc -p tsconfig.e2e.json"
   },
   "dependencies": {
     "framer-motion": "^13.2.0",
@@ -18,6 +22,7 @@
     "zustand": "^5.0.15"
   },
   "devDependencies": {
+    "@playwright/test": "1.62.1",
     "@types/node": "^24.13.3",
     "@types/react": "^19.2.17",
     "@types/react-dom": "^19.2.3",
diff --git a/web/pnpm-lock.yaml b/web/pnpm-lock.yaml
index d34e21e..8591f8a 100644
--- a/web/pnpm-lock.yaml
+++ b/web/pnpm-lock.yaml
@@ -24,6 +24,9 @@ importers:
         specifier: ^5.0.15
         version: 5.0.15(@types/react@19.2.18)(react@19.2.8)
     devDependencies:
+      '@playwright/test':
+        specifier: 1.62.1
+        version: 1.62.1
       '@types/node':
         specifier: ^24.13.3
         version: 24.13.3
@@ -176,6 +179,11 @@ packages:
     cpu: [x64]
     os: [win32]

+  '@playwright/test@1.62.1':
+    resolution: {integrity: sha512-DTcUc8qii+cpHvtOwggMtBRMjKZHXYWdw8syRYu2vtzuq4Wxphqq4NfCs5Zt44L6mA8rfDfj+PHnxFc/FeK6mQ==}
+    engines: {node: '>=20'}
+    hasBin: true
+
   '@rolldown/binding-android-arm-eabi@1.2.5':
     resolution: {integrity: sha512-DLe/i+l8ynIBY7XEQ191TeZvCoowIGa18R+dIV30GW7DiOtp74i/xX8hs8GUjW5ARV7VZuie3d6AumSmCwbeRA==}
     engines: {node: ^20.19.0 || >=22.12.0}
@@ -640,6 +648,10 @@ snapshots:
   '@oxlint/binding-win32-x64-msvc@1.79.0':
     optional: true

+  '@playwright/test@1.62.1':
+    dependencies:
+      playwright: 1.62.1
+
   '@rolldown/binding-android-arm-eabi@1.2.5':
     optional: true

TOOLING_PATCH

git add .gitignore web/playwright.config.ts web/tsconfig.e2e.json \
  web/e2e/fixtures.ts web/e2e/archive.spec.ts \
  web/e2e/sharing.spec.ts web/e2e/responsive.spec.ts \
  web/e2e/security.spec.ts web/e2e/README.md \
  web/src/components/DiaryNote.tsx \
  web/src/components/FairyLights.tsx \
  web/src/components/FallingLetters.tsx
git commit -F - <<'MESSAGE'
test(e2e): add isolated private archive journeys

Exercise production routing, privacy, recovery, sharing and responsive
controls with synthetic encrypted seeds and real UI unlocking.

Retain failure traces and screenshots. Add stable IDs only where
repeated accessible names cannot identify the intended control.
Keys remain memory-only; authenticated storageState is not introduced.
MESSAGE

# 3. CI depends on the scripts and fixtures in commit 2.
git add .github/workflows/e2e.yml
git commit -F - <<'MESSAGE'
ci(e2e): run browser checks on pull requests

Run production Playwright journeys and the existing deeper regression
suites before merge, with read-only permissions and failure artifacts.

Retry native tests twice and keep synthetic artifacts for seven days.
The workflow does not deploy or require application secrets.
MESSAGE

# 4. Now stage the approved removals and remaining dependency removal.
git add web/src/components/RainbowFlame.tsx \
  web/src/components/RoomToolsMenu.tsx \
  web/src/components/StickyNote.tsx \
  web/src/components/WebGLTorchField.tsx \
  web/src/components/WorldAtmosphere.tsx \
  web/src/components/WritingStylePicker.tsx \
  web/src/assets/react.svg web/src/assets/vite.svg web/src/assets/hero.png \
  web/src/domain/motion.ts web/src/domain/slug.ts web/src/domain/types.ts \
  web/package.json web/pnpm-lock.yaml
git commit -F - <<'MESSAGE'
refactor(app): remove approved unreachable code

Remove the six unmounted components, three unreferenced source assets,
letterMotion, slugify with SLUG_MAX, and the unused WallState type.

Remove framer-motion and its orphaned dependencies after its sole
consumer is deleted. Preserve store APIs, CSS ordering, crypto formats
and historical tests; those broader changes were not approved.
MESSAGE

# 5. Record evidence and the deliberately limited cleanup scope.
git add INSTRUCTIONS.md PROGRESS.md DECISIONS.md COMMIT_LOG.md \
  PRELAUNCH_COMMIT_PLAN.md \
  qa/results/prelaunch-e2e-2026-10-08.json \
  qa/results/prelaunch-cleanup-2026-10-08.json
git commit -F - <<'MESSAGE'
docs(prelaunch): record validation and commit sequence

Record the approved security, testing and cleanup work with measured
results and explicit limits so future passes do not repeat discovery.

Keep deployment, real-device coverage and hosting-header enforcement
separate from the checks completed locally.
MESSAGE

git status --short
```
