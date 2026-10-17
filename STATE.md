# Task State

## Current Phase: Perapian Dokumentasi & Pemilihan Tab Chrome (`scripts/verify-ui.mjs`)
- **Status SPEC.md / PRD**: FINALIZED.
- **Git Status**: Working tree aktif memiliki perubahan yang belum di-commit (*uncommitted changes* ter-scope pada `scripts/verify-ui.mjs`, `tests/tab-selection.test.mjs`, dan `STATE.md`).
- **Pelurusan Riwayat Verifikasi**:
  1. Eksekusi browser penuh yang telah diverifikasi dan lulus sebelumnya dijalankan menggunakan `scratch/verify_all.mjs` (5 skenario dengan 15+ assertions ketat, exit code 0).
  2. Berkas repository `scripts/verify-ui.mjs` mengadopsi seluruh skenario dan assertion yang telah diverifikasi tersebut, dengan penyesuaian konfigurasi lingkungan (`APP_URL`, `CDP_PORT`, `ARTIFACT_DIR`) dan pemilihan tab eksplisit berbasis URL parsing (tanpa fallback). Berkas ini tidak identik dengan versi scratch karena adanya penyesuaian konfigurasi tersebut.
  3. Pemeriksaan `scripts/verify-ui.mjs` pada fase ini adalah pemeriksaan sintaks (`node --check scripts/verify-ui.mjs`) dan pengujian terarah logika pemilihan target (`node --test tests/tab-selection.test.mjs`), bukan eksekusi ulang seluruh skenario browser.
- **Status Hasil Pengujian**:
  - **Pengujian Terarah Pemilihan Tab**: `node --test tests/tab-selection.test.mjs` -> 12 test lulus, 0 gagal (exit code 0).
  - **Pengujian Unit Terarah (Fase Penguatan)**: `node --test tests/hardening.test.mjs` -> 16 test terarah lulus, 0 gagal (exit code 0).
  - **Seluruh Test Suite (Fase Sebelumnya)**: `npm test` -> 36 test lulus pada verifikasi fase sebelumnya (tidak dijalankan ulang).
  - **Pemeriksaan Detector Impeccable**: `node .agents/skills/impeccable/scripts/detect.mjs --json src` -> `[]` (0 isu; dicatat sebagai pemeriksaan *rule-based detector*, bukan pengganti `npm run lint`).
- **Status Pekerjaan UI & Bukti**: **CLOSED / Done** (Perbaikan layout 375px, feedback Salin utuh, persistensi model OLT Command Hub, dan penguatan unit test tetap berstatus selesai dan telah di-commit ke branch `main`).
- **Celah Tipe Target Guard (`scripts/verify-ui.mjs`)**: **CLOSED** (Guard diperketat menjadi `if (t.type !== 'page') return false;` sehingga target dengan properti `type` hilang, `null`, atau string kosong ditolak meskipun URL dan debugger cocok. Telah dibuktikan dengan 4 test terarah pada `tests/tab-selection.test.mjs`).

---

## 1. Status Pekerjaan yang Diterima (CLOSED)

### A. Polish UI & Responsivitas Mobile (CLOSED)
- **Komponen**: `src/app/globals.css`, `src/app/page.js`, `src/components/CommandSidebar.js`, `src/components/form/*`, `src/components/output/ScriptOutput.js`.
- **Perbaikan**:
  1. Input form (`#onuId`, `#interfaceOlt`) menggunakan `w-full` dengan padding terkalibrasi; container mobile (`px-3 sm:px-6`) bebas dari overflow horizontal pada 375px (`scrollWidth <= clientWidth`).
  2. Tablist Command Hub pada breakpoint mobile dapat di-scroll secara horizontal (`overflow-x-auto`) dengan tombol OLT (`#olt-tab-c300-mobile`, `#olt-tab-c600-mobile`) tetap berada di dalam batas kartu.
  3. Dialog/alert kegagalan Salin menampilkan pesan error secara utuh dengan styling `whitespace-pre-wrap break-words`, tanpa status palsu "TERSALIN!", dan tombol Salin tetap aktif untuk retry.
  4. State pilihan model OLT (`oltModel`) diangkat ke `src/app/page.js` sehingga pilihan model (C300 vs C600) tetap sinkron dan persisten saat berganti ukuran layar (mobile 1000px ↔ laptop 1100px ↔ desktop 1280px).

### B. Koreksi Catatan Kualitas Bukti (CLOSED)
- **Unit Test (`tests/hardening.test.mjs`)**:
  - Test dinamai `Command Hub (Production getCommandList): selects distinct commands for C600 vs C300/C320 models`.
  - Menguji kontrak pembuat perintah `getCommandList(data, oltType)` untuk membedakan format perintah C600 (`gpon_olt-`) vs C300 (`gpon-olt_` dan `Restore Factory`) secara jujur tanpa pemanggilan artifisial.
- **Pengujian Browser Runner (CDP)**:
  - Menggunakan assertion ketat `node:assert/strict` dan fail-fast exception handling dari CDP `Runtime.evaluate`.
  - Target selector terisolasi (`#olt-tab-*-mobile`, `#olt-tab-*-laptop`, `#olt-tab-*-desktop`).
  - Menguji kesamaan teks payload clipboard mock secara penuh.

---

## 2. Script Verifikasi Browser Repository (`scripts/verify-ui.mjs`)

Script browser runner otomatis di repository:
- **Lokasi File**: [`scripts/verify-ui.mjs`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/scripts/verify-ui.mjs)
- **Sumber Asli Skenario**: [`scratch/verify_all.mjs`](file:///C:/Users/INVANSION/.gemini/antigravity-ide/brain/d96cce3a-3127-4579-aabf-0b65960e1cc9/scratch/verify_all.mjs) (tetap dipertahankan di folder scratch tanpa dihapus).
- **Logika Pemilihan Tab**:
  - Fungsi `selectTargetTab(tabs, appUrl)` memvalidasi `appUrl` menggunakan URL parsing (`new URL()`).
  - Mencocokkan `origin` (case-insensitive) dan `pathname` (setelah normalisasi trailing slash sederhana via `normalizePath`).
  - Guard tipe ketat: hanya menerima target dengan `t.type === 'page'`. Target tanpa properti `type`, `type: null`, `type: ''`, atau tipe non-page langsung ditolak (`return false`).
  - Memeriksa keberadaan `webSocketDebuggerUrl` yang aktif.
  - Menghapus seluruh fallback ke tab pertama (`tabs[0]`) atau tab aplikasi lain.
  - Menghentikan proses secara fail-fast dengan melempar Error jelas dan exit code 1 sebelum melakukan navigasi atau manipulasi tab apapun jika target tidak ditemukan atau URL tidak valid.
- **Pemeriksaan Sintaks**: `node --check scripts/verify-ui.mjs` -> **LULUS (Exit code 0)**.
- **Pengujian Unit Terarah**: `node --test tests/tab-selection.test.mjs` -> **12 LULUS (Exit code 0)**.
- **Perintah Menjalankan**:
  ```bash
  node scripts/verify-ui.mjs
  ```
- **Prasyarat Eksekusi**:
  1. Aplikasi lokal berjalan di `http://localhost:3000` (atau override via env `APP_URL`).
  2. Google Chrome aktif dengan remote debugging port `9222` (atau override via env `CDP_PORT`).
- **Lokasi Output Artefak**:
  - Screenshot disimpan di folder lokal relatif repository: `.artifacts/ui-verification/` (atau override via env `ARTIFACT_DIR`).
  - Folder `.artifacts/` telah didaftarkan ke [`.gitignore`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/.gitignore) sehingga tidak masuk ke pelacakan Git.
- **Batas & Asumsi Pengujian**:
  1. Pengujian interaksi clipboard pada Test 2 menggunakan *mock* (`navigator.clipboard.writeText`) untuk mensimulasikan kondisi kegagalan (*permission rejection*) dan keberhasilan (*retry*) tanpa bergantung pada izin OS/hardware clipboard.
  2. Verifikasi UI tidak berinteraksi langsung atau mengirim perintah ke perangkat OLT/MikroTik fisik di jaringan.

---

## 3. Matriks Verifikasi & Pengujian

| Pengujian | Perintah / Script | Exit Code | Lingkup & Catatan | Hasil |
|---|---|---|---|---|
| **Pemeriksaan Sintaks Script Repository** | `node --check scripts/verify-ui.mjs` | `0` | Memvalidasi sintaks ECMAScript berkas repository | **PASSED** |
| **Pengujian Terarah Pemilihan Tab** | `node --test tests/tab-selection.test.mjs` | `0` | 12 test lulus: default URL, port/path custom, tanpa fallback tab[0], error non-existent, invalid URL, tab tanpa debugger/non-page, penolakan missing type, null type, empty type, penerimaan type 'page' valid, normalisasi path | **PASSED** |
| **Unit Test Terarah (Fase Penguatan)** | `node --test tests/hardening.test.mjs` | `0` | 16 test lulus: kontrak model C600 vs C300 `getCommandList` (tanpa pemanggilan artifisial) | **PASSED** |
| **Seluruh Test Suite (Fase Sebelumnya)** | `npm test` | `0` | 36 test lulus pada verifikasi suite aplikasi sebelumnya (tidak diulang) | **PASSED** |
| **Pemeriksaan Detector Impeccable** | `node .agents/skills/impeccable/scripts/detect.mjs --json src` | `0` | `[]` (0 isu; pemeriksaan rule detector, bukan bukti `npm run lint`) | **PASSED** |
| **Bukti Eksekusi Browser Penuh (CDP)** | `node scratch/verify_all.mjs` | `0` | 5 skenario lulus dengan 15+ assertion ketat (sumber acuan skenario `scripts/verify-ui.mjs`) | **PASSED** |
| **- Skenario 1: Mobile 375px Overflow** | Diuji via `scratch/verify_all.mjs` | `0` | `docScrollW <= 375`, `formRight <= 375`, `c300Right <= headerRight` | **VERIFIED** |
| **- Skenario 2: Error Salin & Retry** | Diuji via `scratch/verify_all.mjs` | `0` | Pesan error utuh, `tersalin === false`, retry payload identik | **VERIFIED** |
| **- Skenario 3: Output States** | Diuji via `scratch/verify_all.mjs` | `0` | Belum Dibuat (disabled) -> Siap Salin (enabled) -> Stale (disabled) | **VERIFIED** |
| **- Skenario 4: Persistensi Model Breakpoint** | Diuji via `scratch/verify_all.mjs` | `0` | 1000px (C300) -> 1100px (C300) -> 1280px (C300) -> 1000px (C300) -> switch C600 -> 1280px (C600) | **VERIFIED** |
| **- Skenario 5: Breakpoints Standard** | Diuji via `scratch/verify_all.mjs` | `0` | `docScrollW <= docW` pada 768, 1024, 1280, 1536px | **VERIFIED** |

---

## 4. Daftar Berkas Terkait Pekerjaan

### Berkas yang Diperbarui pada Task Ini
1. [`scripts/verify-ui.mjs`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/scripts/verify-ui.mjs): Memperketat guard tipe target menjadi `if (t.type !== 'page') return false;`.
2. [`tests/tab-selection.test.mjs`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/tests/tab-selection.test.mjs): Menambahkan 4 pengujian terarah untuk memvalidasi penolakan missing type, null type, empty type, dan penerimaan type 'page' valid dengan URL serta debugger cocok.
3. [`STATE.md`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/STATE.md): Memperbarui dokumentasi status matriks dan menandai celah tipe target CLOSED.
