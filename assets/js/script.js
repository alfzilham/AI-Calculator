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
  if (e.key === "Escape") {
    e.preventDefault();
    if (profileMenuOpen) {
      closeProfileMenu();
    } else if (sidebarOpen) {
      closeSidebar();
    } else {
      clearAll();
      flashButton('[data-action="clear"]');
    }
    return;
  }

  // Jangan biarkan keyboard shortcut kalkulator mengambil alih input Search.
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return;
  }

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
  } else if (e.key === "%") {
    percent();
    flashButton('[data-action="percent"]');
  } else if (e.key === "Backspace") {
    deleteLast();
    flashButton('[data-action="backspace"]');
  } else if (
    e.key.startsWith("Arrow") ||
    e.key === "PageUp" || e.key === "PageDown" ||
    e.key === "Home" || e.key === "End"
  ) {
     /* Blokir tombol navigasi yang bisa menggulir/melompat halaman agar tidak
        mengganggu kalkulator. Space sengaja tidak diblokir agar tombol native
        tetap dapat diaktifkan melalui keyboard. */
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
const sidebarToggleDockEl = document.getElementById("sidebarToggleDock");
const sidebarHeaderToggleDockEl = document.getElementById("sidebarHeaderToggleDock");
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
  sidebarHeaderToggleDockEl.appendChild(sidebarToggleEl);
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
  sidebarToggleDockEl.appendChild(sidebarToggleEl);
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
  profileMenuEl.hidden = !profileMenuOpen;
  sidebarProfileEl.setAttribute("aria-expanded", String(profileMenuOpen));
  profileChevronEl.classList.toggle("open", profileMenuOpen);
}

function closeProfileMenu() {
  profileMenuOpen = false;
  profileMenuEl.classList.remove("open");
  profileMenuEl.hidden = true;
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

/* --- Nav buttons (demo active state + page switching) --- */

const projectsViewEl = document.getElementById("projectsView");

/* ============================================================
   Projects: data model, state, and rendering
   ============================================================ */

let projects = [];
let currentProjectId = null;
let projectSearchQuery = "";
let projectSortMode = "recent"; // "recent" | "name-asc" | "name-desc"

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createProjectData(name, description) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: name.trim(),
    description: (description || "").trim(),
    pinned: false,
    createdAt: now,
    updatedAt: now,
    instructions: "",
    contextFiles: [],
  };
}

/* --- Demo seed data --- */

const SEED_PROJECTS = [
  {
    name: "AI Calculator",
    description: "A vanilla HTML/CSS/JS calculator with glassmorphism and gradient waves background.",
    pinned: true,
    instructions: "Build a calculator using only vanilla web technologies.",
    contextFiles: [{ name: "calculator-spec.pdf", size: "24 KB" }],
  },
  {
    name: "Study Planner",
    description: "Plan and track study sessions with time blocks and progress indicators.",
    pinned: false,
    instructions: "",
    contextFiles: [],
  },
  {
    name: "Budget Analyzer",
    description: "Analyze monthly expenses, categorize spending, and visualize budget trends.",
    pinned: false,
    instructions: "Help me understand where my money goes each month.",
    contextFiles: [{ name: "expenses-q3.csv", size: "12 KB" }],
  },
  {
    name: "Prompt Workspace",
    description: "A space for crafting, testing, and refining AI prompts for various use cases.",
    pinned: false,
    instructions: "",
    contextFiles: [],
  },
];

function seedProjects() {
  projects = SEED_PROJECTS.map((s) => {
    const p = createProjectData(s.name, s.description);
    p.pinned = s.pinned;
    p.instructions = s.instructions || "";
    p.contextFiles = s.contextFiles || [];
    p.updatedAt = new Date(Date.now() - Math.random() * 7 * 86400000).toISOString();
    return p;
  });
}

/* --- Rendering: projects list view --- */

function renderProjectsPage() {
  const container = projectsViewEl.querySelector(".projects-container");
  if (!container) return;

  const filtered = filterProjects(projects);
  const sorted = sortProjects(filtered);

  container.innerHTML = `
    <div class="projects-header">
      <h1 class="projects-title">Projects</h1>
      <div class="projects-actions">
        <button class="projects-action-btn" id="projectsSearchBtn" aria-label="Search projects">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
        </button>
        <div class="projects-search-inline" id="projectsSearchInline" hidden>
          <input type="search" class="projects-search-input" id="projectsSearchInput" placeholder="Search projects..." aria-label="Search projects">
          <button class="projects-search-clear" id="projectsSearchClear" aria-label="Clear search">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
          </button>
        </div>
        <div class="projects-sort-wrapper">
          <button class="projects-action-btn" id="projectsSortBtn" aria-label="Sort projects" aria-haspopup="listbox">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="14" y1="12" y2="12"></line><line x1="4" x2="10" y1="18" y2="18"></line></svg>
          </button>
          <div class="projects-sort-menu" id="projectsSortMenu" role="listbox" aria-label="Sort options" hidden>
            <button class="projects-sort-option${projectSortMode === "recent" ? " active" : ""}" role="option" aria-selected="${projectSortMode === "recent"}" data-sort="recent">Recently updated</button>
            <button class="projects-sort-option${projectSortMode === "name-asc" ? " active" : ""}" role="option" aria-selected="${projectSortMode === "name-asc"}" data-sort="name-asc">Name A–Z</button>
            <button class="projects-sort-option${projectSortMode === "name-desc" ? " active" : ""}" role="option" aria-selected="${projectSortMode === "name-desc"}" data-sort="name-desc">Name Z–A</button>
          </div>
        </div>
        <button class="projects-new-btn" id="projectsNewBtn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
          <span>New project</span>
        </button>
      </div>
    </div>
    <div class="projects-grid" id="projectsGrid">
      ${sorted.length === 0 ? renderEmptyState() : sorted.map(renderProjectCard).join("")}
    </div>
  `;

  bindProjectsListEvents();
}

function renderEmptyState() {
  return `
    <div class="projects-empty">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="projects-empty-icon"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></svg>
      <p class="projects-empty-text">No projects found</p>
      <p class="projects-empty-hint">Create a new project to get started.</p>
    </div>
  `;
}

function renderProjectCard(project) {
  const timeAgo = formatTimeAgo(project.updatedAt);
  return `
    <div class="project-card" data-project-id="${project.id}" tabindex="0" role="button" aria-label="Open project ${project.name}">
      <div class="project-card-header">
        <h3 class="project-card-name">${escapeHtml(project.name)}</h3>
        <div class="project-card-actions">
          <button class="project-card-pin${project.pinned ? " pinned" : ""}" data-pin-id="${project.id}" aria-label="${project.pinned ? "Unpin" : "Pin"} project ${project.name}" title="${project.pinned ? "Unpin" : "Pin"}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${project.pinned ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
          </button>
          <div class="project-card-menu-wrapper">
            <button class="project-card-menu" data-menu-id="${project.id}" aria-label="More options for ${project.name}" aria-haspopup="menu" aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
            <div class="project-card-menu-dropdown" data-menu-dropdown-id="${project.id}" role="menu" hidden>
              <button class="project-card-menu-item" role="menuitem" data-action="rename" data-rename-id="${project.id}">Rename</button>
              <button class="project-card-menu-item project-card-menu-item-danger" role="menuitem" data-action="delete" data-delete-id="${project.id}">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <p class="project-card-desc">${escapeHtml(project.description || "No description")}</p>
      <span class="project-card-time">${timeAgo}</span>
    </div>
  `;
}

function formatTimeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* --- Filter & Sort --- */

function filterProjects(list) {
  if (!projectSearchQuery) return list;
  const q = projectSearchQuery.toLowerCase();
  return list.filter(
    (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );
}

function sortProjects(list) {
  const copy = [...list];
  const pinned = copy.filter((p) => p.pinned);
  const unpinned = copy.filter((p) => !p.pinned);

  const sortFn = {
    recent: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    "name-asc": (a, b) => a.name.localeCompare(b.name),
    "name-desc": (a, b) => b.name.localeCompare(a.name),
  };

  pinned.sort(sortFn[projectSortMode] || sortFn.recent);
  unpinned.sort(sortFn[projectSortMode] || sortFn.recent);
  return [...pinned, ...unpinned];
}

/* --- Project pin toggle --- */

function toggleProjectPin(id) {
  const project = projects.find((p) => p.id === id);
  if (!project) return;
  project.pinned = !project.pinned;
  project.updatedAt = new Date().toISOString();
  saveProjects();
  renderProjectsPage();
}

/* --- Persistence --- */

function saveProjects() {
  try {
    localStorage.setItem("aicalc-projects", JSON.stringify(projects));
  } catch (_) { /* ignore */ }
}

function loadProjects() {
  try {
    const raw = localStorage.getItem("aicalc-projects");
    if (raw) { projects = JSON.parse(raw); return true; }
  } catch (_) { /* ignore */ }
  return false;
}

/* --- Bind events (stub — implemented in later commits) --- */

function bindProjectsListEvents() {
  const searchBtn = document.getElementById("projectsSearchBtn");
  const searchInline = document.getElementById("projectsSearchInline");
  const searchInput = document.getElementById("projectsSearchInput");
  const searchClear = document.getElementById("projectsSearchClear");
  const sortBtn = document.getElementById("projectsSortBtn");
  const sortMenu = document.getElementById("projectsSortMenu");
  const newBtn = document.getElementById("projectsNewBtn");

  /* Search toggle */
  if (searchBtn && searchInline && searchInput) {
    searchBtn.addEventListener("click", () => {
      const hidden = searchInline.hidden;
      searchInline.hidden = !hidden;
      if (!hidden) {
        projectSearchQuery = "";
        searchInput.value = "";
        renderProjectsPage();
      } else {
        searchInput.focus();
      }
    });

    searchInput.addEventListener("input", () => {
      projectSearchQuery = searchInput.value;
      renderProjectsPage();
      /* Restore focus and cursor position after re-render */
      const newInput = document.getElementById("projectsSearchInput");
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      }
    });

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        projectSearchQuery = "";
        searchInput.value = "";
        renderProjectsPage();
        const newInput = document.getElementById("projectsSearchInput");
        if (newInput) newInput.focus();
      });
    }
  }

  /* Sort dropdown */
  if (sortBtn && sortMenu) {
    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sortMenu.hidden = !sortMenu.hidden;
    });

    sortMenu.querySelectorAll(".projects-sort-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        projectSortMode = opt.dataset.sort;
        sortMenu.hidden = true;
        renderProjectsPage();
      });
    });
  }

  /* Close sort menu on outside click */
  document.addEventListener("click", (e) => {
    if (sortMenu && !sortMenu.hidden && !sortBtn.contains(e.target) && !sortMenu.contains(e.target)) {
      sortMenu.hidden = true;
    }
  });

  /* New project button */
  if (newBtn) {
    newBtn.addEventListener("click", openCreateProjectModal);
  }

  /* Card click → open detail */
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".project-card-pin") || e.target.closest(".project-card-menu")) return;
      openProjectDetail(card.dataset.projectId);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProjectDetail(card.dataset.projectId);
      }
    });
  });

  /* Pin buttons */
  document.querySelectorAll(".project-card-pin").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleProjectPin(btn.dataset.pinId);
    });
  });

  /* Overflow menu */
  document.querySelectorAll(".project-card-menu").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.menuId;
      const dropdown = document.querySelector(`[data-menu-dropdown-id="${id}"]`);
      if (dropdown) {
        const wasHidden = dropdown.hidden;
        /* Close all other dropdowns first */
        document.querySelectorAll(".project-card-menu-dropdown").forEach((d) => { d.hidden = true; });
        dropdown.hidden = !wasHidden;
        btn.setAttribute("aria-expanded", String(!wasHidden));
      }
    });
  });

  /* Close overflow menus on outside click */
  document.addEventListener("click", () => {
    document.querySelectorAll(".project-card-menu-dropdown").forEach((d) => { d.hidden = true; });
    document.querySelectorAll(".project-card-menu").forEach((b) => { b.setAttribute("aria-expanded", "false"); });
  });

  /* Menu item actions */
  document.querySelectorAll(".project-card-menu-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = item.dataset.action;
      if (action === "rename") {
        const id = item.dataset.renameId;
        const project = projects.find((p) => p.id === id);
        if (project) {
          const newName = prompt("Rename project:", project.name);
          if (newName && newName.trim()) {
            project.name = newName.trim();
            project.updatedAt = new Date().toISOString();
            saveProjects();
            renderProjectsPage();
          }
        }
      } else if (action === "delete") {
        const id = item.dataset.deleteId;
        if (confirm("Delete this project?")) {
          projects = projects.filter((p) => p.id !== id);
          saveProjects();
          renderProjectsPage();
        }
      }
    });
  });
}

/* --- Nav buttons (demo active state + page switching) --- */

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.nav;

    navButtons.forEach((b) => {
      b.classList.remove("active");
      b.removeAttribute("aria-current");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-current", "page");

    /* Page switching */
    if (target === "projects") {
      body.classList.add("page-projects");
      renderProjectsPage();
    } else {
      body.classList.remove("page-projects");
    }
  });
});

/* --- Initialize projects --- */

if (!loadProjects()) {
  seedProjects();
  saveProjects();
}
