const resultEl = document.getElementById("result");
const historyEl = document.getElementById("history");
const buttons = document.querySelectorAll(".btn");
const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const wavesBg = document.getElementById("wavesBg");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

/* Gradient Waves background - orange accent theme, synced with dark/light mode */
const wavesThemes = {
  dark: {
    horizonColor: "#1a1108",
    waveColor: "#7a3d0f",
    crestColor: "#ffb347",
  },
  light: {
    horizonColor: "#f4e3c8",
    waveColor: "#f2a43a",
    crestColor: "#ffe0a3",
  },
};

const themeColorMap = { dark: "#17140f", light: "#efe9dd" };

function applyThemeMeta(theme) {
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", themeColorMap[theme] || themeColorMap.dark);
  }
}

function syncWavesTheme(theme) {
  if (!wavesInstance) return;
  const t = wavesThemes[theme] || wavesThemes.dark;
  wavesInstance.setColors(t.horizonColor, t.waveColor, t.crestColor);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let wavesInstance = null;
if (window.GradientWaves) {
  wavesInstance = window.GradientWaves(wavesBg, {
    horizonColor: wavesThemes.dark.horizonColor,
    waveColor: wavesThemes.dark.waveColor,
    crestColor: wavesThemes.dark.crestColor,
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
    detail: "medium",
    brightness: 1.0,
    opacity: 0.9,
    mouseInteraction: !reduceMotion,
    parallaxStrength: 0.4,
    grain: true,
    grainIntensity: 0.04,
  });
}

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;

function formatNumber(numStr) {
  if (numStr === "") return "0";
  const [intPart, decPart] = numStr.split(".");
  const negative = intPart.startsWith("-");
  const digits = negative ? intPart.slice(1) : intPart;
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let out = (negative ? "-" : "") + withCommas;
  if (decPart !== undefined) out += "." + decPart;
  return out;
}

function updateDisplay() {
  resultEl.textContent = formatNumber(current);
  fitResultFont();
}

/* Mengecilkan font hasil secara progresif agar angka panjang tetap terlihat
   (tidak terpotong ellipsis). Base size diambil dari --result-font-size. */
function fitResultFont() {
  const base = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--result-font-size")) || 48;
  const len = resultEl.textContent.length;
  let scale = 1;
  if (len > 18) scale = 0.45;
  else if (len > 15) scale = 0.56;
  else if (len > 12) scale = 0.69;
  else if (len > 9) scale = 0.83;
  resultEl.style.fontSize = Math.round(base * scale) + "px";
}

function updateHistory(text) {
  historyEl.textContent = text || "\u00A0";
}

function inputNumber(num) {
  if (justEvaluated) {
    current = num;
    justEvaluated = false;
    updateHistory("");
  } else if (current === "0") {
    current = num;
  } else {
    if (current.replace("-", "").replace(".", "").length >= 12) return;
    current += num;
  }
  updateDisplay();
}

function inputDecimal() {
  if (justEvaluated) {
    current = "0.";
    justEvaluated = false;
    updateHistory("");
  } else if (!current.includes(".")) {
    current += ".";
  }
  updateDisplay();
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  updateHistory("");
  updateDisplay();
}

function negate() {
  if (current === "0" || current === "Error") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  updateDisplay();
}

function percent() {
  if (current === "Error") return;
  const val = parseFloat(current) / 100;
  current = String(val);
  updateDisplay();
}

function clearEntry() {
  current = "0";
  justEvaluated = false;
  updateDisplay();
}

function deleteLast() {
  if (justEvaluated) {
    clearAll();
    return;
  }
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-" || current === "-0") current = "0";
  updateDisplay();
}

function square() {
  if (current === "Error") return;
  const result = parseFloat(current) * parseFloat(current);
  current = Number.isFinite(result) ? trimResult(result) : "Error";
  justEvaluated = true;
  updateDisplay();
}

function sqrt() {
  if (current === "Error") return;
  const val = parseFloat(current);
  if (val < 0) {
    current = "Error";
    updateDisplay();
    return;
  }
  current = Number.isFinite(Math.sqrt(val)) ? trimResult(Math.sqrt(val)) : "Error";
  justEvaluated = true;
  updateDisplay();
}

function compute(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case "+":
      return x + y;
    case "−":
      return x - y;
    case "×":
      return x * y;
    case "÷":
      return y === 0 ? NaN : x / y;
    default:
      return y;
  }
}

function chooseOperator(op) {
  // Mulai bersih jika sebelumnya terjadi error
  if (current === "Error") {
    previous = null;
    operator = null;
    current = "0";
    justEvaluated = false;
  }

  if (operator && previous !== null && !justEvaluated) {
    const result = compute(previous, current, operator);
    current = String(result);
    updateDisplay();
    previous = current;
  } else {
    previous = current;
  }
  operator = op;
  justEvaluated = false;
  current = "0";
  updateHistory(`${formatNumber(previous)} ${operator}`);
}

function equals() {
  if (operator === null || previous === null) return;
  const result = compute(previous, current, operator);
  const resultStr = Number.isFinite(result) ? trimResult(result) : "Error";
  updateHistory(
    `${formatNumber(previous)} ${operator} ${formatNumber(current)}`,
  );
  current = resultStr;
  previous = null;
  operator = null;
  justEvaluated = true;
  updateDisplay();
}

function trimResult(num) {
  if (!Number.isFinite(num)) return "Error";
  if (num === 0) return "0";
  let str = num.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
  if (str.replace("-", "").replace(".", "").length > 12) {
    str = num.toPrecision(10);
    str = parseFloat(str).toString();
  }
  return str;
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const num = btn.dataset.num;
    const op = btn.dataset.op;
    const action = btn.dataset.action;

    if (num !== undefined) {
      inputNumber(num);
    } else if (op !== undefined) {
      chooseOperator(op);
    } else if (action === "clear") {
      clearAll();
    } else if (action === "negate") {
      negate();
    } else if (action === "percent") {
      percent();
    } else if (action === "clear-entry") {
      clearEntry();
    } else if (action === "backspace") {
      deleteLast();
    } else if (action === "square") {
      square();
    } else if (action === "sqrt") {
      sqrt();
    } else if (action === "decimal") {
      inputDecimal();
    } else if (action === "equals") {
      equals();
    }
  });
});

/* Theme toggle */
themeToggle.addEventListener("click", () => {
  const isDark = body.dataset.theme === "dark";
  const newTheme = isDark ? "light" : "dark";
  body.dataset.theme = newTheme;
  applyThemeMeta(newTheme);
  syncWavesTheme(newTheme);
});

/* Keyboard sync: sorot tombol yang bersesuaian saat key ditekan */
function flashButton(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.classList.add("btn-pressed");
  clearTimeout(btn._flashTimer);
  btn._flashTimer = setTimeout(() => btn.classList.remove("btn-pressed"), 150);
}

/* Keyboard support */
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    inputNumber(e.key);
    flashButton(`[data-num="${e.key}"]`);
  } else if (e.key === ".") {
    inputDecimal();
    flashButton('[data-action="decimal"]');
  } else if (e.key === "+") {
    chooseOperator("+");
    flashButton('[data-op="+"]');
  } else if (e.key === "-") {
    chooseOperator("−");
    flashButton('[data-op="−"]');
  } else if (e.key === "*") {
    chooseOperator("×");
    flashButton('[data-op="×"]');
  } else if (e.key === "/") {
    e.preventDefault();
    chooseOperator("÷");
    flashButton('[data-op="÷"]');
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    equals();
    flashButton('[data-action="equals"]');
  } else if (e.key === "Escape") {
    clearAll();
    flashButton('[data-action="clear"]');
  } else if (e.key === "%") {
    percent();
    flashButton('[data-action="percent"]');
  } else if (e.key === "Backspace") {
    deleteLast();
    flashButton('[data-action="backspace"]');
  } else if (
    e.key === " " ||
    e.key.startsWith("Arrow") ||
    e.key === "PageUp" || e.key === "PageDown" ||
    e.key === "Home" || e.key === "End"
  ) {
    /* Mobile/hardware: blokir tombol yang bisa menggulir/melompat agar tidak
       mengganggu kalkulator. Virtual keyboard tidak akan muncul karena halaman
       tidak memiliki <input>/textarea sama sekali. */
    e.preventDefault();
  }
});

applyThemeMeta(body.dataset.theme);
updateDisplay();

/* ============================================================
   Sidebar: toggle, profile menu, nav, mobile overlay, keyboard
   ============================================================ */

const sidebarEl = document.getElementById("sidebar");
const sidebarToggleEl = document.getElementById("sidebarToggle");
const sidebarOverlayEl = document.getElementById("sidebarOverlay");
const sidebarProfileEl = document.getElementById("sidebarProfile");
const profileMenuEl = document.getElementById("profileMenu");
const profileChevronEl = document.querySelector(".sidebar-profile-chevron");
const navButtons = document.querySelectorAll(".sidebar-nav-btn");

let sidebarOpen = false;
let profileMenuOpen = false;

/* --- Sidebar open / close --- */

function openSidebar() {
  sidebarOpen = true;
  sidebarEl.classList.add("open");
  sidebarOverlayEl.classList.add("active");
  sidebarOverlayEl.setAttribute("aria-hidden", "false");
  sidebarToggleEl.setAttribute("aria-expanded", "true");
  sidebarToggleEl.setAttribute("aria-label", "Close sidebar");
  body.classList.add("sidebar-open");
  /* On mobile: trap focus inside sidebar */
  sidebarEl.focus();
}

function closeSidebar() {
  sidebarOpen = false;
  sidebarEl.classList.remove("open");
  sidebarOverlayEl.classList.remove("active");
  sidebarOverlayEl.setAttribute("aria-hidden", "true");
  sidebarToggleEl.setAttribute("aria-expanded", "false");
  sidebarToggleEl.setAttribute("aria-label", "Open sidebar");
  body.classList.remove("sidebar-open");
  closeProfileMenu();
  sidebarToggleEl.focus();
}

function toggleSidebar() {
  if (sidebarOpen) closeSidebar();
  else openSidebar();
}

sidebarToggleEl.addEventListener("click", toggleSidebar);
sidebarOverlayEl.addEventListener("click", closeSidebar);

/* --- Profile dropdown --- */

function toggleProfileMenu() {
  profileMenuOpen = !profileMenuOpen;
  profileMenuEl.classList.toggle("open", profileMenuOpen);
  sidebarProfileEl.setAttribute("aria-expanded", String(profileMenuOpen));
  profileChevronEl.classList.toggle("open", profileMenuOpen);
}

function closeProfileMenu() {
  profileMenuOpen = false;
  profileMenuEl.classList.remove("open");
  sidebarProfileEl.setAttribute("aria-expanded", "false");
  profileChevronEl.classList.remove("open");
}

sidebarProfileEl.addEventListener("click", toggleProfileMenu);

/* Close profile menu when clicking outside */
document.addEventListener("click", (e) => {
  if (profileMenuOpen && !sidebarProfileEl.contains(e.target) && !profileMenuEl.contains(e.target)) {
    closeProfileMenu();
  }
});

/* --- Nav buttons (demo active state) --- */

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => {
      b.classList.remove("active");
      b.removeAttribute("aria-current");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-current", "page");
  });
});

/* --- Keyboard: Escape closes sidebar & profile --- */

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (profileMenuOpen) {
      closeProfileMenu();
    } else if (sidebarOpen) {
      closeSidebar();
    }
  }
});