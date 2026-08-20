# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Backspace button (`⌫`) to delete the last digit on touch devices (previously keyboard-only).
- Clear Entry button (`CE`) that clears only the current entry while keeping the pending operator and history.
- Square (`×²`) and square root (`√`) buttons as unary operations.

### Fixed

- Long numbers (≥10 digits) no longer truncate with an ellipsis — the result font now scales down progressively (`fitResultFont()` + `--result-font-size`) so all digits remain visible, e.g. `888,888,888,888`.

## [0.1.0] - 2026-08-20

### Added

- Core calculator with `+`, `−`, `×`, `÷`, percent (`%`), negation (`+/-`), decimal, and clear (`C`).
- Dark & light themes toggled via a sun/moon button (`body[data-theme]`), synced with `<meta name="theme-color">` and the WebGL wave colors in real time.
- Animated **Gradient Waves (WebGL2)** background ported to a standalone vanilla module (`window.GradientWaves`), with:
  - Mouse parallax with smooth lerp interpolation.
  - Auto-pause when the tab is hidden (`visibilitychange`) or the canvas is off-screen (`IntersectionObserver`).
  - `devicePixelRatio` capped at 2 and optional lightweight grain noise.
- Thousands separators and precision capping (`trimResult`) to avoid floating-point artifacts.
- Full keyboard support with visual key sync (`flashButton` → `.btn-pressed`).
- Mobile-first responsive layout with breakpoints at `≤360px` and `≥480px`.
- Accessibility: `aria-label`, `aria-live`, `:focus-visible` focus ring, and `prefers-reduced-motion` support.
- Project documentation: `README.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/SPEC.md`, `docs/CONTEXT.md`, and this changelog.

### Changed

- Renamed theme toggle identifiers from legacy `micToggle`/`.mic-btn`/`--mic-*` to `themeToggle`/`.theme-btn`/`--theme-*` to match their actual function.
- Set the HTML document language to `id` and later normalized documentation to English for consistency.
- Removed `maximum-scale=1.0` from the viewport so users can still zoom (accessibility).

### Fixed

- `%` and `+/-` after a division-by-zero error could corrupt the display into `NaN` or `-Error`; both are now no-ops while in the `Error` state.
- Backspace on a negative single digit left a dangling `-` on the display; it now falls back to `0`.
- `Enter`/`=` could double-fire when a button was focused; the default action is now prevented in the key handler.

[Unreleased]: https://github.com/alfzilham/AI-Calculator/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/alfzilham/AI-Calculator/releases/tag/v0.1.0