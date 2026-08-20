# AICalculator

Kalkulator berbasis **HTML/CSS/JS vanilla** tanpa framework dan tanpa build tool. Terinspirasi desain iOS Calculator, memadukan **Claymorphism** (tombol) + **Glassmorphism** (kartu) di atas background animasi **Gradient Waves (WebGL2)**.

## Fitur

- Operasi dasar: `+`, `−`, `×`, `÷`, persen (`%`), negasi (`+/-`), desimal, dan clear (`C`)
- Dua tema: **dark** & **light**, di-toggle lewat ikon tema di pojok kiri atas
- Background **gradient waves** reaktif terhadap kursor (parallax) — berhenti otomatis saat tab tidak aktif / canvas keluar layar
- Format angka dengan pemisah ribuan, presisi hasil dibatasi untuk menghindari artefak floating-point
- Dukungan keyboard penuh
- Responsif (mobile-first)

## Menjalankan

Buka `index.html` langsung di browser (tanpa server, tanpa install). Untuk pengalaman terbaik gunakan browser yang mendukung WebGL2.

## Struktur File

```
AICalculator/
├── index.html                    # Halaman utama (struktur + meta)
├── assets/
│   ├── css/
│   │   ├── variable.css          # Design tokens (CSS custom properties)
│   │   ├── global.css            # Reset + base layout + waves
│   │   ├── components.css        # Kartu, display, tombol
│   │   ├── responsive.css        # Media queries
│   │   └── style.css             # Entry point (@import semua modul)
│   ├── js/
│   │   ├── gradient-waves.js     # Modul WebGL2 mandiri (IIFE → window.GradientWaves)
│   │   └── script.js             # Logika kalkulator + kontrol tema + init waves
│   └── favicon/                  # Ikon situs
├── docs/
│   └── DESIGN.md                 # Dokumentasi desain lengkap
└── README.md
```

## Shortcut Keyboard

| Tombol Fisik  | Aksi                 |
| ------------- | -------------------- |
| `0–9`         | Input angka          |
| `.`           | Desimal              |
| `+ - * /`     | Operator             |
| `Enter` / `=` | Hitung hasil         |
| `Escape`      | Clear all            |
| `%`           | Persen               |
| `Backspace`   | Hapus digit terakhir |

## Catatan Teknis

- **WebGL2 required** untuk background animasi; jika tidak didukung, background solid tetap tampil dan kalkulator tetap berfungsi penuh.
- **`backdrop-filter`**: tanpa dukungan, kartu tampil sebagai warna semi-transparan tanpa blur (degradasi aman).
- **`prefers-reduced-motion`** dihormati: animasi waves dimatikan dan transisi CSS ditiadakan.
- Tanpa dependensi eksternal (ikon tema di-inline sebagai SVG).