# DESIGN.md — Calculator UI

Dokumentasi desain untuk aplikasi kalkulator vanilla HTML/CSS/JS dengan gaya **Claymorphism** (tombol) + **Glassmorphism** (kartu kalkulator) di atas background animasi **Gradient Waves** (WebGL2).

---

## 1. Ringkasan Konsep

Kalkulator ini terinspirasi dari desain iOS Calculator dengan dua lapisan gaya visual yang dipadukan:

| Elemen                         | Gaya                                 | Alasan                                                                                       |
| ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Kartu kalkulator (container)   | **Glassmorphism**                    | Transparan + blur, agar animasi gelombang di belakang tetap terlihat samar menembus kaca     |
| Tombol angka, fungsi, operator | **Claymorphism**                     | Soft-shadow ganda (terang + gelap) membuat tombol terlihat timbul empuk seperti dempul/lilin |
| Background halaman             | **Animated Gradient Waves (WebGL2)** | Lapisan paling belakang, memberi kedalaman dan gerakan tanpa mengganggu keterbacaan angka    |

Dua mode tema (dark/light) tersedia, di-toggle lewat ikon tema (**sun/moon**) di pojok kiri atas kartu.

---

## 2. Arsitektur File

```
AICalculator/
├── index.html                     # Struktur HTML + meta (satu-satunya halaman)
├── assets/
│   ├── css/
│   │   ├── variable.css           # Design tokens (CSS custom properties)
│   │   ├── global.css             # Reset + base layout + waves
│   │   ├── components.css         # Kartu, display, tombol (clay/glass)
│   │   ├── responsive.css         # Media queries
│   │   └── style.css              # Entry point (@import semua modul)
│   ├── js/
│   │   ├── gradient-waves.js      # Modul WebGL2 mandiri (vanilla, tanpa React/ogl)
│   │   └── script.js              # Logic kalkulator + kontrol tema + inisialisasi waves
│   └── favicon/
├── docs/
│   └── DESIGN.md                  # Dokumen ini
└── README.md
```

**CSS modular:** seluruh styling dipecah jadi 4 modul dengan `style.css` sebagai entry point (`@import`). `variable.css` memuat seluruh design tokens sebagai CSS custom properties di bawah `body[data-theme="dark"]` / `body[data-theme="light"]`, sehingga nilai warna tidak tersebar dan mudah disesuaikan.

**Kenapa `gradient-waves.js` dipisah jadi modul:** dibuat sebagai IIFE mandiri yang mengekspos `window.GradientWaves(container, options)` — bisa dipakai ulang di project lain tanpa bergantung pada struktur kalkulator ini.

> Catatan: sebelumnya project memiliki `calculator.html` (versi single-file semua digabung). Versi tersebut dihapus untuk menghilangkan duplikasi; `index.html` + `assets/` kini menjadi satu-satunya sumber kebenaran.

---

## 3. Design Tokens

### 3.1 Warna — Mode Dark

| Token                          | Nilai                                         | Penggunaan                          |
| ------------------------------ | --------------------------------------------- | ----------------------------------- |
| Background halaman             | `#17140f`                                     | Base color di belakang canvas waves |
| Kartu kalkulator (gradient)    | `rgba(40,37,32,0.55)` → `rgba(24,21,18,0.55)` | Fill glass, arah 160deg             |
| Border kartu                   | `rgba(255,255,255,0.08)`                      | Tepi kaca tipis                     |
| Tombol angka/fungsi (gradient) | `#454540` → `#333330`                         | Base clay abu-gelap                 |
| Tombol operator (gradient)     | `#ffb75c` → `#ec9426`                         | Oranye terang → oranye tua          |
| Teks hasil (`.result`)         | `#ffffff`                                     | Kontras utama                       |
| Teks riwayat (`.history`)      | `rgba(255,255,255,0.32)`                      | Redup, sekunder                     |
| Ikon tema                      | `rgba(255,255,255,0.7)`                       | Netral, tidak mendominasi           |

### 3.2 Warna — Mode Light

| Token                          | Nilai                                               | Penggunaan                       |
| ------------------------------ | --------------------------------------------------- | -------------------------------- |
| Background halaman             | `#efe9dd`                                           | Krem hangat, senada aksen oranye |
| Kartu kalkulator (gradient)    | `rgba(255,255,255,0.45)` → `rgba(255,255,255,0.25)` | Fill glass lebih terang          |
| Border kartu                   | `rgba(255,255,255,0.6)`                             | Highlight tepi kaca              |
| Tombol angka/fungsi (gradient) | `#ffffff` → `#e9e7e0`                               | Clay putih gading                |
| Tombol operator (gradient)     | sama seperti dark: `#ffb75c` → `#ec9426`            | Konsisten di kedua mode          |
| Teks hasil (`.result`)         | `#211e17`                                           | Cokelat gelap nyaris hitam       |
| Teks riwayat (`.history`)      | `rgba(0,0,0,0.32)`                                  | Redup, sekunder                  |
| Ikon tema                      | `rgba(60,55,40,0.6)`                                | Netral hangat                    |

### 3.3 Warna — Gradient Waves (Background WebGL)

Skema **orange-aksen**, senada tombol operator, disinkronkan otomatis saat toggle tema:

| Theme | Horizon Color                    | Wave Color                     | Crest Color               |
| ----- | -------------------------------- | ------------------------------ | ------------------------- |
| Dark  | `#1a1108` (cokelat nyaris hitam) | `#7a3d0f` (oranye gelap/burnt) | `#ffb347` (oranye terang) |
| Light | `#f4e3c8` (krem pucat)           | `#f2a43a` (oranye medium)      | `#ffe0a3` (oranye pastel) |

### 3.4 Tipografi

| Elemen               | Ukuran                            | Weight | Catatan                                                                                                                    |
| -------------------- | --------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Font family          | —                                 | —      | System font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Hasil (`.result`)    | `48px` (→ `40px` di layar sempit) | `600`  | `letter-spacing: -0.5px`, `line-height: 1.1`                                                                               |
| Riwayat (`.history`) | `15px`                            | `400`  | Ellipsis overflow untuk ekspresi panjang                                                                                   |
| Tombol angka/fungsi  | `24px` (→ `21px`)                 | `500`  | —                                                                                                                          |
| Tombol operator      | `24px` (→ `21px`)                 | `600`  | Sedikit lebih tebal dari angka                                                                                             |

### 3.5 Radius & Spacing

| Elemen                    | Radius                         | Padding/Gap                     |
| ------------------------- | ------------------------------ | ------------------------------- |
| Kartu kalkulator          | `44px` (→ `36px` mobile kecil) | `22px 18px 26px`                |
| Tombol (umum)             | `20px` (→ `18px` mobile kecil) | `20px 0` vertikal               |
| Tombol tema                | `16px`                         | `44×44px` fixed                 |
| Grid tombol               | —                              | `gap: 10px`, 4 kolom            |
| Tombol `0` (span 2 kolom) | sama seperti umum              | `padding-left: 28px`, rata kiri |

---

## 4. Detail Implementasi Gaya

### 4.1 Glassmorphism — Kartu Kalkulator

```css
.calculator {
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  backdrop-filter: blur(28px) saturate(160%);
}
```

- **Blur 28px + saturate 160%** dipilih agar warna gelombang di belakang tetap "hidup" saat difilter, bukan malah pudar jadi abu-abu.
- Background kartu pakai `linear-gradient` transparan (bukan flat color) supaya efek kaca terasa punya volume/arah cahaya.
- Border `1px solid` semi-transparan mensimulasikan pantulan tepi kaca.
- Box-shadow tiga lapis:
  1. Shadow luar besar & blur tinggi → mengangkat kartu dari background
  2. `inset 0 1px 0` → highlight tipis di tepi atas (efek kaca kena cahaya)
  3. `inset 0 0 40px` → glow lembut di dalam kartu

### 4.2 Claymorphism — Tombol

Setiap tombol non-operator memakai **shadow ganda arah berlawanan**, prinsip dasar claymorphism:

```css
box-shadow:
  6px 6px 12px rgba(0, 0, 0, 0.35),
  /* shadow gelap, kanan-bawah */ -4px -4px 10px rgba(255, 255, 255, 0.04),
  /* highlight terang, kiri-atas */ inset 0 1px 1px rgba(255, 255, 255, 0.06); /* rim-light tipis di dalam */
```

Saat `:active`, shadow dibalik jadi **inset** (`inset 3px 3px 8px ...`) sehingga tombol terlihat "ditekan masuk" ke dalam material, bukan sekadar redup — ini elemen kunci yang membedakan claymorphism dari flat design biasa.

Tombol operator (÷ × − + =) memakai palet oranye terpisah dengan shadow warna hangat (`rgba(180,100,10,...)` dan `rgba(255,200,130,...)`) supaya bayangannya terasa "menyatu" dengan warna tombol, bukan bayangan abu-abu generik.

### 4.3 Animated Background — Gradient Waves

**Sumber asli:** [React Bits – Gradient Waves](https://reactbits.dev/backgrounds/gradient-waves), komponen React + WebGL via library `ogl`.

**Migrasi ke vanilla:** Karena project ini murni HTML/CSS/JS, seluruh logic di-porting manual:

| Aspek                     | React/ogl (asli)           | Vanilla (project ini)                                                                     |
| ------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| Render context            | `ogl.Renderer`             | `canvas.getContext('webgl2')` langsung                                                    |
| Geometry                  | `ogl.Triangle`             | Buffer manual: 1 triangle fullscreen `[-1,-1, 3,-1, -1,3]`                                |
| Program/shader            | `ogl.Program`              | `gl.createProgram()` + compile manual                                                     |
| State/props reactivity    | React `useEffect` deps     | Fungsi `applyStaticUniforms()` dipanggil sekali saat init                                 |
| Lifecycle (mount/unmount) | React effect cleanup       | `ResizeObserver`, `IntersectionObserver`, event listener manual dengan fungsi `destroy()` |
| Export                    | ES module `export default` | `window.GradientWaves` (global function)                                                  |

**Shader (GLSL ES 300)** tidak diubah sama sekali — teknik **raymarching** terhadap fungsi `plasma()` (kombinasi sinus dengan swell & turbulence) menghasilkan permukaan gelombang prosedural, lalu diberi efek fog berdasarkan jarak (`uFogDepth`) untuk transisi warna horizon → wave → crest.

**Optimisasi performa yang dipertahankan dari versi asli:**

- Render berhenti otomatis saat tab tidak aktif (`visibilitychange`)
- Render berhenti saat canvas di luar viewport (`IntersectionObserver`)
- `devicePixelRatio` dibatasi maksimal 2 (`Math.min(dpr, 2)`) agar tidak membebani layar retina/4K
- Grain noise opsional (`uGrain`) memakai hash pseudo-random ringan, bukan texture

**Parameter yang dipakai di kalkulator ini:**

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

Nilai-nilai ini sengaja diturunkan sedikit dari default komponen (mis. `speed` 0.4→0.35, `opacity` 1.0→0.9) agar gerakan lebih tenang dan tidak mengalihkan perhatian dari kalkulator sebagai fokus utama.

**Z-index layering:**

```
z-index: 0   → .waves-bg (canvas, position: fixed, inset: 0)
z-index: 1   → .calculator (glass card)
```

---

## 5. Interaksi & Perilaku

### 5.1 Toggle Tema (Ikon Sun/Moon)

Ikon tema (sun/moon) ditampilkan bergantian lewat CSS (`body[data-theme="dark"]` menampilkan sun, light menampilkan moon) — tanpa JavaScript, dan tanpa library ikon eksternal (SVG di-inline di HTML).

```js
themeToggle.addEventListener("click", () => {
  const newTheme = isDark ? "light" : "dark";
  body.dataset.theme = newTheme;
  applyThemeMeta(newTheme);   // perbarui <meta name="theme-color">
  syncWavesTheme(newTheme);   // update warna WebGL secara real-time
});
```

- Atribut `data-theme` di `<body>` mengontrol seluruh varian warna CSS lewat selector `body[data-theme="dark"]` / `body[data-theme="light"]`.
- Saat tema berganti, warna shader WebGL ikut di-update via `wavesInstance.setColors(...)` — tidak perlu re-init canvas, cukup ganti 3 uniform warna (`uHorizonColor`, `uWaveColor`, `uCrestColor`).
- `<meta name="theme-color">` diperbarui lewat JS agar warna UI browser ikut menyesuaikan toggle manual (tidak hanya mengikuti preferensi OS).
- Transisi warna CSS pakai `transition: background 0.4s ease` dkk. agar pergantian tidak "meloncat" secara visual.

### 5.2 Parallax Mouse (Desktop)

Gelombang bereaksi halus terhadap posisi kursor (`pointermove` di seluruh window), dengan interpolasi lerp (`currentMouse += 0.05 * (target - current)`) agar gerakan terasa smooth, bukan langsung snap ke posisi kursor.

### 5.3 Logic Kalkulator

Operasi standar: `+`, `−`, `×`, `÷`, `%`, negate (`+/-`), desimal, dan clear (`C`). Riwayat ekspresi (`.history`) menampilkan operand pertama + operator saat operator dipilih, lalu ekspresi lengkap saat `=` ditekan — meniru pola iOS Calculator di gambar referensi.

Format angka otomatis pakai pemisah ribuan (`,`) melalui fungsi `formatNumber()`, dan hasil desimal dibatasi presisi (`toFixed(8)` lalu di-trim) untuk menghindari floating-point artifact seperti `0.1 + 0.2 = 0.30000000000000004`.

### 5.4 Dukungan Keyboard

| Tombol Fisik  | Aksi                 |
| ------------- | -------------------- |
| `0–9`         | Input angka          |
| `.`           | Desimal              |
| `+ - * /`     | Operator             |
| `Enter` / `=` | Hitung hasil         |
| `Escape`      | Clear all            |
| `%`           | Persen               |
| `Backspace`   | Hapus digit terakhir |

---

## 6. Responsif — Mobile First

Base style ditulis untuk layar sempit terlebih dahulu, lalu diperluas ke atas:

```css
/* Default: mobile (≤480px), max-width kartu 340px */

@media (max-width: 360px) {
  /* Layar sangat sempit: radius & font diperkecil lagi */
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
  /* Tablet/desktop: kartu sedikit melebar */
  .calculator {
    max-width: 380px;
  }
}
```

Grid tombol (`grid-template-columns: repeat(4, 1fr)`) otomatis proporsional di semua ukuran layar karena berbasis fraksi, bukan px tetap.

---

## 7. Aksesibilitas

- Tombol tema punya `aria-label="Toggle dark and light mode"` untuk screen reader.
- Semua tombol adalah elemen `<button>` asli (bukan `<div>`), sehingga otomatis dapat fokus keyboard (Tab) dan teraktivasi dengan Enter/Space.
- `.result` dan `.history` memakai `aria-live="polite"` agar perubahan nilai dibacakan screen reader.
- Tombol punya gaya `:focus-visible` (ring oranye) untuk navigasi keyboard yang jelas.
- Kontras teks dijaga di kedua tema: putih murni di atas kartu gelap semi-transparan, cokelat gelap (`#211e17`) di atas kartu terang — bukan abu-abu medium yang berisiko gagal WCAG AA.
- `text-shadow` halus ditambahkan pada `.result` di kedua tema untuk menjaga keterbacaan meskipun background di belakangnya bergerak/dinamis.
- `prefers-reduced-motion` dihormati: animasi waves dimatikan (JS & CSS) dan semua transisi CSS ditiadakan.

---

## 8. Dependensi Eksternal

| Library                            | Fungsi                              | Sumber                                  |
| ---------------------------------- | ----------------------------------- | --------------------------------------- |
| WebGL2 (native browser API)        | Render animasi gradient waves       | Tidak perlu library eksternal — vanilla |

Tidak ada dependensi eksternal: ikon tema (sun/moon) di-inline sebagai SVG langsung di HTML. Tidak ada build tool (Webpack/Vite) — project bisa dibuka langsung sebagai file statis (`index.html`).

---

## 9. Batasan & Catatan Teknis

- **WebGL2 required**: Jika browser tidak mendukung WebGL2 (sangat jarang di browser modern), `gradient-waves.js` akan `console.warn` dan background animasi tidak tampil — kalkulator tetap berfungsi penuh karena `background` solid color (`#17140f` / `#efe9dd`) sudah jadi fallback di `body`.
- **`backdrop-filter` browser support**: Didukung luas di Chrome/Edge/Safari modern; Firefox versi lama memerlukan flag. Tanpa dukungan, kartu akan tampil sebagai warna solid semi-transparan tanpa efek blur (degradasi baik, tidak merusak layout).
- **Precision floating-point**: Ditangani lewat fungsi `trimResult()` di `script.js`, membatasi hasil ke maksimal 12 digit sebelum fallback ke notasi presisi.
- **Reduced motion**: Jika pengguna menetapkan `prefers-reduced-motion: reduce`, animasi waves tidak dijalankan (canvas transparan → background solid tampil) dan transisi CSS ditiadakan.
- **Tanpa dependensi eksternal**: Tidak ada CDN/library ikon — seluruh aset lokal.
