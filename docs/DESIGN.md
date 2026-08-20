# DESIGN.md — Calculator UI

Design documentation for a vanilla HTML/CSS/JS calculator app using **Claymorphism** (buttons) + **Glassmorphism** (calculator card) over an animated **Gradient Waves** (WebGL2) background.

---

## 1. Concept Summary

This calculator is inspired by the iOS Calculator design with two visual layers combined:

| Element                           | Style                                | Reason                                                                                       |
| --------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Calculator card (container)       | **Glassmorphism**                    | Transparent + blurred, so the waves animation behind stays subtly visible through the glass  |
| Number, function, operator buttons | **Claymorphism**                     | Dual soft-shadow (light + dark) makes the buttons look raised and soft, like putty/wax        |
| Page background                   | **Animated Gradient Waves (WebGL2)** | The backmost layer, adding depth and motion without hurting number readability                |

Two theme modes (dark/light) are available, toggled via the theme icon (**sun/moon**) in the top-left corner of the card.

---

## 2. File Architecture

```
AICalculator/
├── index.html                     # HTML structure + meta (the only page)
├── assets/
│   ├── css/
│   │   ├── variable.css           # Design tokens (CSS custom properties)
│   │   ├── global.css             # Reset + base layout + waves
│   │   ├── components.css         # Card, display, buttons (clay/glass)
│   │   ├── responsive.css         # Media queries
│   │   └── style.css              # Entry point (@imports all modules)
│   ├── js/
│   │   ├── gradient-waves.js      # Standalone WebGL2 module (vanilla, no React/ogl)
│   │   └── script.js              # Calculator logic + theme control + waves init
│   └── favicon/
├── docs/
│   ├── ARCHITECTURE.md            # Technical architecture
│   ├── CONTEXT.md                 # Project context & decisions
│   └── DESIGN.md                  # This document
└── README.md
```

**Modular CSS:** all styling is split into 4 modules with `style.css` as the entry point (`@import`). `variable.css` holds every design token as CSS custom properties under `body[data-theme="dark"]` / `body[data-theme="light"]`, so color values are not scattered and are easy to adjust.

**Why `gradient-waves.js` is a separate module:** it is built as a standalone IIFE exposing `window.GradientWaves(container, options)` — reusable in other projects without depending on this calculator's structure.

> Note: the project previously had a `calculator.html` (single-file version with everything bundled). That version was removed to eliminate duplication; `index.html` + `assets/` is now the single source of truth.

---

## 3. Design Tokens

### 3.1 Colors — Dark Mode

| Token                            | Value                                          | Usage                              |
| -------------------------------- | ---------------------------------------------- | ---------------------------------- |
| Page background                  | `#17140f`                                      | Base color behind the waves canvas |
| Calculator card (gradient)       | `rgba(40,37,32,0.55)` → `rgba(24,21,18,0.55)`  | Glass fill, 160deg direction      |
| Card border                      | `rgba(255,255,255,0.08)`                       | Thin glass edge                    |
| Number/function buttons (gradient)| `#454540` → `#333330`                         | Dark-gray clay base                |
| Operator buttons (gradient)      | `#ffb75c` → `#ec9426`                         | Bright orange → dark orange        |
| Result text (`.result`)          | `#ffffff`                                      | Main contrast                      |
| History text (`.history`)        | `rgba(255,255,255,0.32)`                       | Dim, secondary                     |
| Theme icon                       | `rgba(255,255,255,0.7)`                       | Neutral, non-dominant              |

### 3.2 Colors — Light Mode

| Token                            | Value                                               | Usage                         |
| -------------------------------- | --------------------------------------------------- | ----------------------------- |
| Page background                  | `#efe9dd`                                           | Warm cream, matching orange accent |
| Calculator card (gradient)       | `rgba(255,255,255,0.45)` → `rgba(255,255,255,0.25)` | Brighter glass fill           |
| Card border                      | `rgba(255,255,255,0.6)`                             | Glass edge highlight          |
| Number/function buttons (gradient)| `#ffffff` → `#e9e7e0`                               | Ivory-white clay              |
| Operator buttons (gradient)      | same as dark: `#ffb75c` → `#ec9426`                 | Consistent across both modes  |
| Result text (`.result`)          | `#211e17`                                           | Dark brown, almost black      |
| History text (`.history`)        | `rgba(0,0,0,0.32)`                                  | Dim, secondary                |
| Theme icon                       | `rgba(60,55,40,0.6)`                                | Warm neutral                  |

### 3.3 Colors — Gradient Waves (WebGL Background)

**Orange-accent** scheme, matching the operator buttons, auto-synced on theme toggle:

| Theme | Horizon Color                    | Wave Color                     | Crest Color               |
| ----- | -------------------------------- | ------------------------------ | ------------------------- |
| Dark  | `#1a1108` (near-black brown)     | `#7a3d0f` (dark/burnt orange)  | `#ffb347` (bright orange) |
| Light | `#f4e3c8` (pale cream)           | `#f2a43a` (medium orange)      | `#ffe0a3` (pastel orange) |

### 3.4 Typography

| Element                | Size                               | Weight | Notes                                                                                      |
| ---------------------- | ---------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| Font family            | —                                  | —      | System font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Result (`.result`)     | `48px` (→ `40px` on small screens) | `600`  | `letter-spacing: -0.5px`, `line-height: 1.1`; font scales down automatically via `--result-font-size` + `fitResultFont()` so long numbers never truncate |
| History (`.history`)   | `15px`                             | `400`  | Ellipsis overflow for long expressions                                                      |
| Number/function buttons| `24px` (→ `21px`)                  | `500`  | —                                                                                           |
| Operator buttons       | `24px` (→ `21px`)                  | `600`  | Slightly bolder than numbers                                                                 |

### 3.5 Radius & Spacing

| Element                    | Radius                          | Padding/Gap                     |
| -------------------------- | ------------------------------- | ------------------------------- |
| Calculator card            | `44px` (→ `36px` small mobile)  | `22px 18px 26px`                |
| Buttons (general)          | `20px` (→ `18px` small mobile)  | `20px 0` vertical                |
| Theme button               | `16px`                          | `44×44px` fixed                 |
| Button grid                | —                               | `gap: 10px`, 4 columns          |
| `0` button (span 2 cols)   | same as general                 | `padding-left: 28px`, left-aligned |

---

## 4. Style Implementation Details

### 4.1 Glassmorphism — Calculator Card

```css
.calculator {
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  backdrop-filter: blur(28px) saturate(160%);
}
```

- **Blur 28px + saturate 160%** was chosen so the waves colors behind stay "alive" when filtered, rather than fading to gray.
- The card background uses a transparent `linear-gradient` (not flat color) so the glass effect feels like it has volume/light direction.
- A `1px solid` semi-transparent border simulates the glass edge reflection.
- Three-layer box-shadow:
  1. Large outer blur shadow → lifts the card from the background
  2. `inset 0 1px 0` → thin highlight on the top edge (glass catching light)
  3. `inset 0 0 40px` → soft glow inside the card

### 4.2 Claymorphism — Buttons

Every non-operator button uses a **dual shadow in opposite directions**, the core principle of claymorphism:

```css
box-shadow:
  6px 6px 12px rgba(0, 0, 0, 0.35),
  /* dark shadow, bottom-right */ -4px -4px 10px rgba(255, 255, 255, 0.04),
  /* light highlight, top-left */ inset 0 1px 1px rgba(255, 255, 255, 0.06); /* thin inner rim-light */
```

On `:active`, the shadow flips to **inset** (`inset 3px 3px 8px ...`) so the button looks "pressed into" the material rather than simply dimmed — a key element that distinguishes claymorphism from flat design.

Operator buttons (÷ × − + =) use a separate orange palette with warm shadows (`rgba(180,100,10,...)` and `rgba(255,200,130,...)`) so their shadow "blends" with the button color instead of a generic gray.

### 4.3 Animated Background — Gradient Waves

**Original source:** [React Bits – Gradient Waves](https://reactbits.dev/backgrounds/gradient-waves), a React + WebGL component using the `ogl` library.

**Vanilla migration:** Since this project is pure HTML/CSS/JS, the entire logic was ported manually:

| Aspect                      | React/ogl (original)        | Vanilla (this project)                                                                     |
| --------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| Render context              | `ogl.Renderer`              | Direct `canvas.getContext('webgl2')`                                                        |
| Geometry                    | `ogl.Triangle`              | Manual buffer: 1 fullscreen triangle `[-1,-1, 3,-1, -1,3]`                                  |
| Program/shader              | `ogl.Program`               | `gl.createProgram()` + manual compile                                                        |
| State/props reactivity      | React `useEffect` deps      | `applyStaticUniforms()` function called once at init                                        |
| Lifecycle (mount/unmount)   | React effect cleanup        | `ResizeObserver`, `IntersectionObserver`, manual event listeners with `destroy()` function  |
| Export                      | ES module `export default`  | `window.GradientWaves` (global function)                                                    |

**Shader (GLSL ES 300)** is unchanged — the **raymarching** technique against a `plasma()` function (a sine combination with swell & turbulence) produces a procedural wave surface, then fog based on distance (`uFogDepth`) transitions horizon → wave → crest colors.

**Performance optimizations kept from the original:**
- Rendering stops automatically when the tab is inactive (`visibilitychange`)
- Rendering stops when the canvas is out of the viewport (`IntersectionObserver`)
- `devicePixelRatio` capped at 2 (`Math.min(dpr, 2)`) to avoid loading Retina/4K screens
- Optional grain noise (`uGrain`) uses lightweight pseudo-random hashing, not a texture

**Parameters used in this calculator:**

```js
{
  speed: 0.35,
  amplitude: 2.2,
  waveScale: 0.55,
  waveRatio: 0.9,
  swell: 30,
  turbulence: 16,
  tilt: 1.15,
  zoom: 1.05,
  height: 5.5,
  fogDepth: 15,
  detail: 'medium',   // 70 raymarch steps
  brightness: 1.0,
  opacity: 0.9,
  mouseInteraction: true,
  parallaxStrength: 0.4,
  grain: true,
  grainIntensity: 0.04
}
```

These values are intentionally lowered from the component defaults (e.g. `speed` 0.4→0.35, `opacity` 1.0→0.9) so the motion is calmer and doesn't distract from the calculator as the main focus.

**Z-index layering:**

```
z-index: 0   → .waves-bg (canvas, position: fixed, inset: 0)
z-index: 1   → .calculator (glass card)
```

---

## 5. Interaction & Behavior

### 5.1 Theme Toggle (Sun/Moon Icon)

The theme icon (sun/moon) is displayed alternately via CSS (`body[data-theme="dark"]` shows the sun, light shows the moon) — no JavaScript, no external icon library (SVGs inlined in HTML).

```js
themeToggle.addEventListener("click", () => {
  const isDark = body.dataset.theme === "dark";
  const newTheme = isDark ? "light" : "dark";
  body.dataset.theme = newTheme;
  applyThemeMeta(newTheme);   // update <meta name="theme-color">
  syncWavesTheme(newTheme);   // update WebGL colors in real time
});
```

- The `data-theme` attribute on `<body>` controls all CSS color variants via the selectors `body[data-theme="dark"]` / `body[data-theme="light"]`.
- On theme change, the WebGL shader colors update via `wavesInstance.setColors(...)` — no canvas re-init needed, just 3 color uniforms (`uHorizonColor`, `uWaveColor`, `uCrestColor`).
- `<meta name="theme-color">` is updated via JS so the browser UI color follows the manual toggle too (not only the OS preference).
- CSS color transitions use `transition: background 0.4s ease` etc. so the switch doesn't "jump" visually.

### 5.2 Mouse Parallax (Desktop)

The waves react subtly to the cursor position (`pointermove` across the whole window), with lerp interpolation (`currentMouse += 0.05 * (target - current)`) so motion feels smooth instead of snapping to the cursor.

### 5.3 Calculator Logic

Standard operations: `+`, `−`, `×`, `÷`, `%`, negate (`+/-`), decimal, and clear (`C`). The expression history (`.history`) shows the first operand + operator when an operator is chosen, then the full expression on `=` — mimicking the iOS Calculator pattern in the reference image.

Number formatting uses automatic thousands separators (`,`) via `formatNumber()`, and decimal results are precision-capped (`toFixed(8)` then trimmed) to avoid floating-point artifacts like `0.1 + 0.2 = 0.30000000000000004`.

### 5.4 Keyboard Support

| Physical Key   | Action              |
| -------------- | ------------------- |
| `0–9`          | Input digit         |
| `.`            | Decimal             |
| `+ - * /`      | Operator            |
| `Enter` / `=`  | Evaluate result     |
| `Escape`       | Clear all           |
| `%`            | Percent             |
| `Backspace`    | Delete last digit   |

When a key is pressed, the matching button briefly lights up (`.btn-pressed`, ~150ms) so the keyboard input feels visually in sync with the UI. Scroll/navigation keys (`Space`, arrows, `PageUp/Down`, `Home/End`) are blocked so they cannot scroll or jump while using a hardware keyboard; the on-screen virtual keyboard never appears because the page has no `<input>`/textarea elements.

---

## 6. Responsive — Mobile First

Base styles are written for narrow screens first, then extended upward:

```css
/* Default: mobile (≤480px), card max-width 340px */

@media (max-width: 360px) {
  /* Very narrow screens: radius & fonts shrink further */
  .calculator {
    max-width: 100%;
    border-radius: 36px;
    padding: 18px 14px 22px;
  }
  .result {
    font-size: 40px;
  }
  .btn {
    font-size: 21px;
    padding: 17px 0;
    border-radius: 18px;
  }
}

@media (min-width: 480px) {
  /* Tablet/desktop: card widens slightly */
  .calculator {
    max-width: 380px;
  }
}
```

The button grid (`grid-template-columns: repeat(4, 1fr)`) stays proportional at all sizes because it is fraction-based, not fixed px.

---

## 7. Accessibility

- The theme button has `aria-label="Toggle dark and light mode"` for screen readers.
- All buttons are real `<button>` elements (not `<div>`), so they automatically get keyboard focus (Tab) and can be activated with Enter/Space.
- `.result` and `.history` use `aria-live="polite"` so value changes are read aloud by screen readers.
- Buttons have a `:focus-visible` style (orange ring) for clear keyboard navigation.
- Text contrast is maintained in both themes: pure white on a dark semi-transparent card, dark brown (`#211e17`) on a light card — not medium gray, which risks failing WCAG AA.
- A soft `text-shadow` on `.result` in both themes keeps readability even as the background behind it moves/dynamically changes.
- `prefers-reduced-motion` is respected: wave animation is disabled (JS & CSS) and all CSS transitions are removed.

---

## 8. External Dependencies

| Library                             | Function                              | Source                                        |
| ----------------------------------- | ------------------------------------- | --------------------------------------------- |
| WebGL2 (native browser API)         | Render the gradient waves animation   | No external library needed — vanilla          |

No external dependencies: the theme icons (sun/moon) are inlined as SVG directly in the HTML. No build tools (Webpack/Vite) — the project can be opened directly as a static file (`index.html`).

---

## 9. Limitations & Technical Notes

- **WebGL2 required**: If the browser does not support WebGL2 (very rare in modern browsers), `gradient-waves.js` logs a `console.warn` and the background animation is not shown — the calculator still works fully because the solid `background` color (`#17140f` / `#efe9dd`) is already the fallback on `body`.
- **`backdrop-filter` browser support**: Widely supported in modern Chrome/Edge/Safari; older Firefox requires a flag. Without support, the card renders as a solid semi-transparent color without blur (good degradation, no layout breakage).
- **Floating-point precision**: Handled by `trimResult()` in `script.js`, capping results to at most 12 digits before falling back to precision notation.
- **Reduced motion**: If the user sets `prefers-reduced-motion: reduce`, the wave animation is not run (transparent canvas → solid background shown) and CSS transitions are removed.
- **No external dependencies**: No CDN/icon library — all assets are local.