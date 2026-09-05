# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Projects page (demo) with glassmorphism card grid, accessible from sidebar navigation.
- Project data model with id, name, description, pinned, timestamps, instructions, and context files.
- Demo seed data: AI Calculator, Study Planner, Budget Analyzer, Prompt Workspace projects.
- Projects header with title, search toggle, sort dropdown (Recently updated, Name A–Z, Name Z–A), and "New project" button.
- Project cards with name, description, last updated time, pin/unpin toggle, and overflow menu (rename, delete).
- Create project modal with glassmorphism styling, name validation, description textarea, and Escape/backdrop close.
- Project detail page with breadcrumb navigation, title, description, pin/menu actions.
- Chat composer demo with message input, Enter/Shift+Enter support, auto-reply demo, loading dots animation, Chat/Cowork mode toggle, model selector, voice button, and attachment button.
- Instructions panel with add/edit instruction via prompt demo.
- Memory panel with "Only you" badge (demo placeholder).
- Context panel with file upload demo (displays file name and size metadata), and empty state prompt.
- localStorage persistence for projects (with fallback if unavailable).
- Responsive layout: single-column cards on mobile, detail body collapses to single column.
- Project-specific CSS design tokens: `--projects-card-bg`, `--projects-card-border`.
- Breadcrumb navigation back to projects list from detail view.
- Page switching between calculator and projects via sidebar nav (`body.page-projects`).
- Sidebar navigation with glassmorphism styling, collapsible on desktop and drawer overlay on mobile.
- Brand section with "AI Calculator" name and icon in the sidebar.
- Search bar with inline SVG icon in the sidebar.
- Navigation menu: Home (active), AI Chatbot (demo), Projects, Settings (demo) — all with inline SVG icons and semantic `<button>` elements.
- Sticky user profile section at the bottom of the sidebar with avatar, name ("Alfiz"), plan status ("Free Plan"), and dropdown menu (Settings, Upgrade plan, Log out).
- Sidebar toggle button (hamburger ↔ X) fixed to the viewport's top-left with aria-label and aria-expanded support.
- Mobile overlay backdrop behind sidebar; click backdrop or press Escape to close.
- Keyboard support: Escape key closes profile menu first, then sidebar.
- Demo badges on AI Chatbot and Settings menu items.
- New CSS design tokens for sidebar: `--sidebar-bg`, `--sidebar-border`, `--sidebar-shadow`, `--sidebar-text`, `--sidebar-text-dim`, `--sidebar-hover-bg`, `--sidebar-active-bg`, `--sidebar-active-color`, `--sidebar-profile-bg`, `--sidebar-profile-border`.
- Hamburger icon animates to X when sidebar is open (CSS transform on SVG lines).
- Backspace button (`⌫`) to delete the last digit on touch devices (previously keyboard-only).
- Clear Entry button (`CE`) that clears only the current entry while keeping the pending operator and history.
- Square (`×²`) and square root (`√`) buttons as unary operations.

### Changed
- Sidebar navigation with glassmorphism styling, collapsible on desktop and drawer overlay on mobile.
- Brand section with "AI Calculator" name and icon in the sidebar.
- Search bar with inline SVG icon in the sidebar.
- Navigation menu: Home (active), AI Chatbot (demo), Projects (demo), Settings (demo) — all with inline SVG icons and semantic `<button>` elements.
- Sticky user profile section at the bottom of the sidebar with avatar, name ("Alfiz"), plan status ("Free Plan"), and dropdown menu (Settings, Upgrade plan, Log out).
- Sidebar toggle button (hamburger ↔ X) fixed to the viewport's top-left with aria-label and aria-expanded support.
- Mobile overlay backdrop behind sidebar; click backdrop or press Escape to close.
- Sidebar toggle behavior: `toggleSidebar()`, `openSidebar()`, `closeSidebar()`, `toggleProfileMenu()` functions.
- Keyboard support: Escape key closes profile menu first, then sidebar.
- Nav button active state with left accent indicator bar.
- Demo badges on AI Chatbot, Projects, and Settings menu items.
- Visual section divider between Home and demo navigation items.
- New CSS design tokens for sidebar: `--sidebar-bg`, `--sidebar-border`, `--sidebar-shadow`, `--sidebar-text`, `--sidebar-text-dim`, `--sidebar-hover-bg`, `--sidebar-active-bg`, `--sidebar-active-color`, `--sidebar-profile-bg`, `--sidebar-profile-border`.
- Hamburger icon animates to X when sidebar is open (CSS transform on SVG lines).

### Changed

- Positioned the sidebar toggle as a fixed control at the top-left of the viewport, outside the calculator card.
- Replaced the incorrect arrow-like open state with a true hamburger-to-X line animation.
- Moves the same sidebar toggle into the sidebar header beside the brand while the sidebar is open, avoiding z-index overlap with the panel.

- Backspace button icon alignment fixed: button now uses `display: flex; align-items: center; justify-content: center` to perfectly center the SVG icon horizontally and vertically.
- Calculator top bar (`calc-top`) now remains dedicated to the theme toggle; the sidebar toggle is a global viewport control.

### Fixed

- Projects search no longer collapses or loses its input while filtering or sorting the rendered project list.
- Projects search now preserves the visible query text across list re-renders.
- Dynamic Projects menus now use one stable outside-click listener instead of registering new document listeners on every render.
- Create Project now closes on Escape, traps focus while open, and safely normalizes malformed persisted project data.
- `Escape` now closes the profile menu/sidebar before clearing the calculator, and calculator shortcuts no longer intercept text entered in the sidebar Search field.
- Space is no longer globally blocked, preserving native keyboard activation for sidebar and calculator buttons.

- Backspace SVG icon is now precisely centered in the button across all states (desktop, mobile, active, focus-visible).

Backspace button (`⌫`) to delete the last digit on touch devices (previously keyboard-only).
- Clear Entry button (`CE`) that clears only the current entry while keeping the pending operator and history.
- Square (`×²`) and square root (`√`) buttons as unary operations.

### Changed

- Reworked the button grid layout: `0` no longer spans two columns (it is a normal-width button), `+/-` moved to the left of `0`, and `=` now spans two rows for an iOS-style tall equals button.
- Backspace now uses an inline SVG icon (Lucide `delete` path) instead of the `⌫` text glyph — keeping the zero-dependency, offline-friendly approach. The icon is sized with `1em` so it exactly matches the button labels at every breakpoint.

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
