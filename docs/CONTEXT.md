# CONTEXT.md — Project Context

Context, rationale, decisions, and conventions for the AICalculator project. Read this first for a quick mental model of why the project exists and how it is maintained.

---

## 1. Background & Problem

A personal calculator project: a clean, modern, mobile-first calculator that looks and feels like the iOS Calculator but is built with **zero dependencies** — plain HTML, CSS, and JavaScript that can run directly from the file system. It serves as a design playground for combining two popular visual styles:

- **Claymorphism** — soft, extruded, tactile buttons.
- **Glassmorphism** — a frosted, semi-transparent card.

The original background animation was ported by hand from a React WebGL component (React Bits – Gradient Waves, built on `ogl`) into a standalone vanilla module, because this project deliberately avoids any framework or build tooling.

---

## 2. Goals & Non-Goals

**Goals**

- A fully functional calculator supporting basic arithmetic with clean UX.
- Beautiful, responsive visuals on both desktop and mobile.
- Keyboard support that feels native and visually synced with the UI.
- Zero external dependencies, CDNs, or build steps.
- A codebase small enough to read and understand in one sitting.

**Non-Goals**

- Scientific/engineering functions, memory, or programming modes.
- Persistence, history storage, or cloud features.
- A bundled single-file variant (`calculator.html` was removed to prevent duplication).
- Support for browsers without WebGL2 as a first-class target (they still get a working calculator with a solid background).

---

## 3. Architecture Decision Records (ADR)

Concise decision log. See `docs/ARCHITECTURE.md` for the resulting structure and `docs/SPEC.md` for behavior.

### ADR-001 — Vanilla stack, no framework or build tool

- **Context:** The project must be trivially runnable and hackable by a single developer.
- **Decision:** Use plain HTML/CSS/JS. No React, Vite, Webpack, or package.json.
- **Consequence:** Fast startup, no install step, easy debugging — at the cost of no component hot-reload or framework ecosystem.

### ADR-002 — Modular CSS via `@import` with design tokens

- **Context:** Theming and maintainability matter; colors are reused heavily.
- **Decision:** Split CSS into `variable.css` (tokens), `global.css` (base), `components.css` (components), `responsive.css` (breakpoints), assembled by `style.css`.
- **Consequence:** Tokens live in one place; theming is a matter of swapping `body[data-theme]`; a small cost in file count.

### ADR-003 — `gradient-waves.js` as a standalone IIFE

- **Context:** The background animation is self-contained and could be reused elsewhere.
- **Decision:** Expose a factory `window.GradientWaves(container, opts)` returning `{ setColors, destroy }`; keep the module independent of the calculator's DOM.
- **Consequence:** Reusable and testable in isolation; requires a deliberate hand-off of colors on theme change.

### ADR-004 — Remove the single-file `calculator.html`

- **Context:** An earlier single-file version duplicated the logic and styling, causing drift.
- **Decision:** Delete it; `index.html` + `assets/` is the single source of truth.
- **Consequence:** No duplication; the docs tree reflects exactly what ships.

### ADR-005 — Rename `micToggle` → `themeToggle`

- **Context:** The top-left control used to be a microphone icon in early design iterations; it is actually a theme switcher (sun/moon) today.
- **Decision:** Rename the id (`micToggle` → `themeToggle`), class (`.mic-btn` → `.theme-btn`), and CSS variables (`--mic-*` → `--theme-*`) to match the real function.
- **Consequence:** Clean, self-documenting identifiers; the `aria-label` was already correct.

### ADR-006 — Error-state guards on `%` and `+/-`

- **Context:** After `÷ 0`, `current` becomes `Error`. `negate()` and `percent()` could corrupt it into `-Error` / `NaN`.
- **Decision:** Guard both functions to be no-ops while `current === "Error"`; operators/digits/clear already reset cleanly.
- **Consequence:** The calculator can never show garbage after an error.

---

## 4. Conventions

**Language & naming**

- Documentation is written in **English** (including `README.md`, `DESIGN.md`, and this file). UI strings and code identifiers are English.
- Identifiers describe what they do (`themeToggle`, `updateDisplay`, `flashButton`), not legacy concepts.
- CSS custom properties use a `--<area>-<role>` scheme (`--btn-op-bg`, `--theme-color`).

**Code structure**

- Functions are small and single-purpose; pure logic (`compute`, `trimResult`, `formatNumber`) is separated from DOM side effects.
- State lives in module-level variables in `script.js` and is always rendered through `updateDisplay()` / `updateHistory()`.
- The WebGL module mutates nothing outside its own canvas.

**Errors**

- Never show raw `NaN`/`Infinity` to the user — normalize to `Error` or a finite value.
- Guard user-triggered actions against the `Error` state.

**Commits**

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.
- One logical change per commit; each commit is pushed to `origin/main`.
- `.env` (and other secrets) must never be committed.

---

## 5. Risks & Limitations

| Risk/Limitation                          | Mitigation                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| WebGL2 unavailable                       | Solid background fallback; `console.warn`; calculator still fully works.    |
| `backdrop-filter` unsupported (old Firefox)| Semi-transparent card without blur (safe degradation).                    |
| Floating-point artifacts                 | `trimResult()` caps precision; `toPrecision(10)` for very large values.     |
| Reduced-motion users                     | `prefers-reduced-motion` disables animation and transitions.                |
| Very long expressions overflow the display | Ellipsis truncation on `.history` / `.result`.                            |

---

## 6. Project History

```mermaid
gitGraph
    commit id: "b60ccd7" tag: "chore: reset repository"
    branch main
    checkout main
    commit id: "62d6249" tag: "feat: initial release"
    commit id: "3b2b4a1" tag: "docs: translate README.md to English"
    commit id: "0726020" tag: "docs: translate DESIGN.md to English"
    commit id: "543c7d6" tag: "docs: add ARCHITECTURE.md"
    commit id: "00e0ad0" tag: "docs: add SPEC.md"
    commit id: "context" tag: "docs: add CONTEXT.md"
    commit id: "changelog" tag: "docs: add CHANGELOG.md"
    commit id: "meta" tag: "chore: align index.html meta description"
```

Full chronological detail with dated releases lives in `CHANGELOG.md`.

---

## 7. Glossary

| Term             | Meaning                                                           |
| ---------------- | ----------------------------------------------------------------- |
| Claymorphism     | Soft, "squeezable" UI style using dual light/dark shadows.        |
| Glassmorphism    | Frosted-glass look via transparency + `backdrop-filter` blur.     |
| Raymarching      | Shader technique marching along rays to render the procedural wave surface. |
| Design tokens    | Named CSS custom properties centralizing design values.            |
| DPR              | Device pixel ratio; capped at 2 to limit GPU work on HiDPI screens. |

---

## 8. Related Documents

| Document              | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `README.md`           | Overview, features, quick start.                 |
| `docs/DESIGN.md`      | Visual/UX design, tokens, shader details.        |
| `docs/ARCHITECTURE.md`| Code structure, data flow, state machine.        |
| `docs/SPEC.md`        | Testable requirements and verification matrix.   |
| `CHANGELOG.md`        | Release history.                                 |