# AICalculator

A **vanilla HTML/CSS/JS** calculator with no framework and no build tools. Inspired by the iOS Calculator design, blending **Claymorphism** (buttons) + **Glassmorphism** (card) over an animated **Gradient Waves (WebGL2)** background.

## Features

- Basic operations: `+`, `−`, `×`, `÷`, percent (`%`), negation (`+/-`), decimal, and clear (`C`)
- Convenience buttons: backspace (`⌫`), clear entry (`CE`), square (`×²`), and square root (`√`)
- Two themes: **dark** & **light**, toggled via the theme icon in the top-left corner
- **Sidebar navigation** with glassmorphism styling, user profile dropdown, and mobile drawer overlay
- **Projects page** (demo): create, browse, search, sort, pin, and open projects with a chat composer, instructions, context upload, and memory panel; search stays open while results update
- **Gradient waves** background reactive to the cursor (parallax) — automatically stops when the tab is inactive or the canvas is off-screen
- Number formatting with thousands separators, result precision capped to avoid floating-point artifacts
- Result font auto-scales so long numbers (up to 12 digits) always fit without truncation
- Full keyboard support
- Responsive (mobile-first)
- **localStorage** persistence for projects data
- Projects list controls remain stable while filtering, sorting, and re-rendering project cards.

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
│   │   ├── components.css        # Card, display, buttons, sidebar, profile
│   │   ├── responsive.css        # Media queries
│   │   └── style.css             # Entry point (@imports all modules)
│   ├── js/
│   │   ├── gradient-waves.js     # Standalone WebGL2 module (IIFE → window.GradientWaves)
│   │   └── script.js             # Calculator logic + theme control + waves init + sidebar
│   └── favicon/                  # Site icon
├── docs/
│   ├── ARCHITECTURE.md           # Technical architecture
│   ├── CHANGELOG.md              # Release history
│   ├── CONTEXT.md                # Project context & decisions
│   ├── DESIGN.md                 # Full design documentation
│   └── SPEC.md                   # Functional specification
└── README.md
```

## Keyboard Shortcuts

| Physical Key | Action              |
| ------------ | ------------------- |
| `0–9`        | Input digit         |
| `.`          | Decimal             |
| `+ - * /`    | Operator            |
| `Enter` / `=` | Evaluate result     |
| `Escape`     | Clear all / close sidebar |
| `%`          | Percent             |
| `Backspace`  | Delete last digit   |

## Technical Notes

- **WebGL2 required** for the animated background; if unsupported, a solid background is shown and the calculator remains fully functional.
- **`backdrop-filter`**: without support, the card renders as a semi-transparent color without blur (safe degradation).
- **`prefers-reduced-motion`** is respected: wave animation is disabled and CSS transitions are removed.
- No external dependencies (theme icons and sidebar icons inlined as SVG).
- **Sidebar** is collapsible on desktop and becomes a drawer overlay on mobile. Its toggle is fixed to the top-left of the viewport while closed, then moves into the sidebar header beside the brand when open. It shows a three-line hamburger when closed and animates into an X when open.

## Development Rules

This project enforces two mandatory rules for all agent sessions, defined in `.opencode/AGENT.md`:

1. **Git workflow** — every completed implementation is committed with a conventional commit message (`feat:`/`fix:`/`chore:`/`docs:`/`refactor:`) and pushed to `origin/main`.
2. **Documentation sync** — every feature or code change updates `README.md`, `docs/CHANGELOG.md`, and the relevant files under `docs/` (`DESIGN.md`, `ARCHITECTURE.md`, `SPEC.md`, `CONTEXT.md`).

The `.opencode/` folder is intentionally excluded from version control (local project config and rules).
