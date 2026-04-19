# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Site

This is a **vanilla HTML/CSS/JS static site** with no build step. To develop locally:

```bash
python -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000` in a browser. There is no package manager, bundler, linter, or test suite.

## Architecture

Single-page portfolio with these core files:

- **`index.html`** — All markup. Structured as: glass header (theme toggle, language selector) → profile aside → main tabbed board (General Info, Career, Academic, Applications, Certificates).
- **`styles.css`** — Design system built on CSS custom properties. All colors are defined as variables under `:root` and overridden under `html[data-theme="dark"]`. Max-width is controlled via `--shell: 1440px`. Glass morphism, reveal animations, and responsive layout are all here.
- **`script.js`** — Tab switching (keyboard-accessible with arrow keys), scroll-progress bar, Intersection Observer reveal animations (respects `prefers-reduced-motion`), and the app carousel (prev/next + dot indicators).
- **`cv-download.js`** — Fetches `assets/CV.pdf` as a blob, prompts for a custom filename, sanitizes it, and triggers download. Falls back to a direct link on failure.
- **`i18n/i18n.js`** — Custom i18n system: detects timezone (Istanbul → Turkish default), loads `i18n/en.json` or `i18n/tr.json` dynamically, persists choice in a cookie, and applies a 250ms blur/opacity transition on language switch. All translatable strings in HTML use `data-i18n` attributes; JS-generated strings use `window.t()`.

## Key Patterns

**Theme system**: A tiny inline script in `<head>` reads `localStorage("theme")` and sets `data-theme` on `<html>` before first paint to avoid flash. The toggle button updates `data-theme` and `aria-pressed` together.

**Translations**: Adding a new string requires entries in both `i18n/en.json` and `i18n/tr.json`, plus a `data-i18n="key"` attribute on the element (or a `window.t("key")` call for JS-rendered text).

**Certificates**: Each certificate card in the HTML references a PNG preview from `assets/certificates/previews/` and a PDF from `assets/certificates/`. Both files must exist for a card to work correctly.

**App carousel**: The carousel in the Applications tab is driven entirely by `script.js`. Adding a new app requires both a new card in `index.html` and updating the carousel item count logic in `script.js`.
