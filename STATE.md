# Task State

## Current Phase: Completed (Pindahkan PJK C600 ke Tab UGR)
- **Scope Aktif**: Memindahkan opsi `PJK C600` dari tab UNR ke optgroup Standard pada tab UGR dengan identifier `ugr_pjk_c600`.
- **Scope Ditunda**: Penambahan 6 varian UGR C600 lainnya tetap ditunda.
- **Status SPEC.md**: FINALIZED.

## Perubahan yang Dilakukan
1. `src/components/form/ConfigTypeSelect.js`:
   - Dihapus: `<option value="unr_pjk_c600">PJK C600</option>` dari dropdown UNR (`configType === "standard"`).
   - Ditambahkan: `<option value="ugr_pjk_c600">PJK C600</option>` pada optgroup Standard di dropdown UGR (`configType === "ugr"`).
2. `src/lib/generator.js`:
   - Di dalam `generateUGR`: ditambahkan penanganan `selectedUgrType === "ugr_pjk_c600"` yang memanggil `generateC600` dengan meneruskan `{ ...data, selectedC600Type: "unr_pjk_c600" }` secara eksplisit sehingga state `selectedC600Type` lama dari tab UNR tidak memengaruhi output.
   - Di dalam `generateC600`: ditambahkan pengenalan identifier `ugr_pjk_c600`.
3. `PRD.md`: Baris `PJK C600` dipindahkan dari tabel UNR ke tabel UGR di bawah optgroup Standard.
4. `tests/pjk_c600.test.mjs`: Diperbarui untuk menguji ketersediaan opsi di UGR Standard, ketiadaan di UNR, isolasi state cross-tab, kesetaraan output CLI C600 VLAN 1000, serta regresi.
5. `tests/integration.test.mjs`: Diperbarui untuk menguji end-to-end flow tab UGR dengan `selectedUgrType: "ugr_pjk_c600"`.

## Status Acceptance Criteria
- **AC1** (PJK C600 hanya di UGR Standard, tidak ada di UNR): **PASS** (Terbukti di `tests/pjk_c600.test.mjs`).
- **AC2** (Output PJK C600 di UGR identik dengan template acuan): **PASS** (Terbukti di `tests/pjk_c600.test.mjs`).
- **AC3** (Pilihan UNR sebelumnya tidak memengaruhi output PJK C600): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` test #3).
- **AC4** (Beralih antar opsi UGR / UNR tetap menghasilkan template masing-masing): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` test #4).
- **AC5** (Default, konfigurasi existing, dan MikroTik tidak berubah): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` test #5).
- **AC6** (Dokumentasi PRD mencatat PJK C600 di UGR tanpa klaim perubahan CLI): **PASS** (Terbukti di `PRD.md`).

## Hasil Verifikasi
- Unit test runner: `node --test tests/rjw_v131.test.mjs tests/pjk_c600.test.mjs tests/integration.test.mjs` -> 15 passed, 0 failed.
- Linter: `npm run lint` -> exit code 0 (0 error, 1 warning pre-existing di tailwind config).
- Build: `npm run build` -> exit code 0.
