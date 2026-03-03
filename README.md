# Interrogate

## Repository Layout

- `docs/`, `specs/`, `plans/`, `tasks/`, `decisions/`, `roadmap/`: documentation and planning artifacts
- `app/`: all application code and runtime assets

## App Layout

- `app/src/`: source code
- `app/public/`: static public assets
- `app/tests/`: test suites (`unit`, `integration`)
- `app/scripts/`: development and automation scripts

No code-related files should be placed at repository root.

## Local Development Requirements

- Git
- Modern browser (Chrome, Edge, or Firefox)
- Node.js 20+ and `npx` (recommended) or Python 3.10+ (`python -m http.server`) for a local static server

### Run Locally (Static HTML/CSS/JS)

```bash
# Option A: Node static server
npx serve app -l 5173

# Option B: Python static server
cd app
python -m http.server 5173
```

Open `http://localhost:5173/public/`.

Note: runtime modules are imported from both `app/public/` and `app/src/`, so serve the `app/` directory (not `app/public/`).

## Linting (Automated)

Lint tooling is configured under `app/`:

- JavaScript: ESLint
- CSS: Stylelint
- HTML: html-validate

Setup once:

```bash
cd app
npm install
```

Run manually:

```bash
cd app
npm run lint
npm run lint:fix
```

Automation:

- A git `pre-commit` hook is installed automatically on `npm install` (via `app/scripts/install-git-hooks.js`).
- The hook runs `cd app && npm run lint` before each commit.
- A git `pre-push` hook is installed automatically and runs `cd app && npm test` before push.

## Testing

Run tests from `app/`:

```bash
cd app
npm test
npm run test:watch
npm run test:coverage
```

## Itch.io Target Notes

- Target is an HTML5 upload.
- Upload a zip where `index.html` is at the root of the uploaded folder.
- Use relative asset paths only.
- No backend/server runtime is available on itch.io for this project type.
