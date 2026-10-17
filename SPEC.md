# Specification: Perbaikan Segmen Kosong Interface, Identitas Stabil Clipboard, dan Bukti UI

## Status: FINALIZED

## 1. Working Tree Baseline
- **Branch**: `main`
- **Scope Task (3 Temuan)**:
  1. **Tolak segmen kosong pada pemisah alternatif (`formatOltInterfaceInput`)**:
     - Ganti regex `[.,\s-]+` menjadi `[.,\s-]` (tanpa `+`) sehingga setiap karakter pemisah dikonversi 1-to-1 menjadi `/`.
     - `1..2..16` menjadi `1//2//16`, yang memiliki segmen kosong dan DITOLAK oleh `isValidOltInterface`.
     - `1,,2,16` menjadi `1//2/16`, DITOLAK.
     - `1//2/16` tetap `1//2/16`, DITOLAK.
     - `1.2.16`, `1,2,16`, `1 2 16`, `1-2-16` menjadi `1/2/16`, VALID.
     - `1216` (tanpa separator), `1a/2b/16c` (huruf tidak dibersihkan), `1/2/16/99` (tidak dipotong), `1/2/` (parsial) tetap DITOLAK.
  2. **Identitas perintah yang stabil untuk status clipboard**:
     - Ganti penamaan berbasis indeks `cmd_${idx}` menjadi `item.id` yang stabil (`c600_delete_onu`, `c300_restore_factory`, dll.) dari `getCommandList()`.
     - `copyCommand` menerima `(text, commandId)` dan menyetel status per `commandId`.
     - `isCopied(item.id)` dan `getError(item.id)` mengisolasi status antarperintah.
     - React key pada daftar perintah menggunakan `item.id`.
     - Status sukses/error C600 tidak bocor ke C300/C320 saat mode OLT diganti.
  3. **Bukti UI pada revisi terbaru**:
     - Menjalankan script automasi UI browser langsung pada halaman aktif (Chrome CDP port 9222) tanpa membuat subagent.
     - Mengisi target sintetis valid (`1/4/2`, `88`, `ZTEGD2327302`).
     - Menguji simulasi clipboard ditolak -> error tampil pada perintah, `COPIED!` tidak muncul.
     - Menguji simulasi clipboard sukses -> retry berhasil, error hilang, `COPIED!` muncul.
     - Menguji pergantian mode OLT (C600 ke C300) saat status aktif -> status tidak bocor ke perintah lain.
     - Menguji pada desktop dan mobile viewport.
     - Menyimpan screenshot empiris ke direktori artifacts.

---

## 2. Acceptance Criteria
- **AC1 (Segmen Kosong Ditolak)**: `1..2..16`, `1,,2,16`, `1//2/16`, `1/2/`, `1216`, `1a/2b/16c`, dan `1/2/16/99` ditolak oleh validasi; `1/2/16`, `1.2.16`, `1,2,16`, `1 2 16` valid; interface invalid menonaktifkan perintah Command Hub dan form generator.
- **AC2 (Identitas Stabil Clipboard)**: Menggunakan `item.id`; status perintah C600 tidak pernah muncul pada perintah C300; pergantian mode OLT menjaga isolasi state; retry dan timer bekerja per `item.id`.
- **AC3 (Bukti UI Lengkap)**: Bukti interaksi UI pada revisi terbaru di desktop dan mobile captured dan terverifikasi secara empiris; semua unit test (38/38) dan lint/build lulus 100%.
