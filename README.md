# AICalculator

A **vanilla HTML/CSS/JS** calculator with no framework and no build tools. Inspired by the iOS Calculator design, blending **Claymorphism** (buttons) + **Glassmorphism** (card) over an animated **Gradient Waves (WebGL2)** background.

## Features

- Basic operations: `+`, `−`, `×`, `÷`, percent (`%`), negation (`+/-`), decimal, and clear (`C`)
- Two themes: **dark** & **light**, toggled via the theme icon in the top-left corner
- **Gradient waves** background reactive to the cursor (parallax) — automatically stops when the tab is inactive or the canvas is off-screen
- Number formatting with thousands separators, result precision capped to avoid floating-point artifacts
- Result font auto-scales so long numbers (up to 12 digits) always fit without truncation
- Full keyboard support
- Responsive (mobile-first)

## Running

Open `index.html` directly in a browser (no server, no install). For the best experience use a browser that supports WebGL2.

## File Structure

```
AICalculator/
├── index.html                    # Main page (structure + meta)
├── assets/
│   ├── css/
│   │   ├── variable.css          # Design tokens (CSS custom properties)
│   │   ├── global.css            # Reset + base layout + waves
│   │   ├── components.css        # Card, display, buttons
│   │   ├── responsive.css        # Media queries
│   │   └── style.css             # Entry point (@imports all modules)
│   ├── js/
│   │   ├── gradient-waves.js     # Standalone WebGL2 module (IIFE → window.GradientWaves)
│   │   └── script.js             # Calculator logic + theme control + waves init
│   └── favicon/                  # Site icon
├── docs/
│   ├── ARCHITECTURE.md           # Technical architecture
│   ├── CONTEXT.md                # Project context & decisions
│   ├── DESIGN.md                 # Full design documentation
│   └── SPEC.md                   # Functional specification
├── CHANGELOG.md                  # Release history
└── README.md
```

## Keyboard Shortcuts

| Physical Key | Action              |
| ------------ | ------------------- |
| `0–9`        | Input digit         |
| `.`          | Decimal             |
| `+ - * /`    | Operator            |
| `Enter` / `=` | Evaluate result     |
| `Escape`     | Clear all           |
| `%`          | Percent             |
| `Backspace`  | Delete last digit   |

## Technical Notes

- **WebGL2 required** for the animated background; if unsupported, a solid background is shown and the calculator remains fully functional.
- **`backdrop-filter`**: without support, the card renders as a semi-transparent color without blur (safe degradation).
- **`prefers-reduced-motion`** is respected: wave animation is disabled and CSS transitions are removed.
- No external dependencies (theme icons inlined as SVG).

## Development Rules

This project enforces two mandatory rules for all agent sessions, defined in `.opencode/AGENT.md`:

1. **Git workflow** — every completed implementation is committed with a conventional commit message (`feat:`/`fix:`/`chore:`/`docs:`/`refactor:`) and pushed to `origin/main`.
2. **Documentation sync** — every feature or code change updates `README.md`, `CHANGELOG.md`, and the relevant files under `docs/` (`DESIGN.md`, `ARCHITECTURE.md`, `SPEC.md`, `CONTEXT.md`).

The `.opencode/` folder is intentionally excluded from version control (local project config and rules).