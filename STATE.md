# Task State

## Current Phase: Completed (Scope PJK C600 pada Tab UNR)
- **Scope Aktif**: Penambahan opsi `PJK C600` (`unr_pjk_c600`) pada tab UNR.
- **Scope Ditunda**: Penambahan 6 varian UGR C600 tetap ditunda.
- **Status SPEC.md**: FINALIZED.

## Perubahan yang Dilakukan
1. `src/components/form/ConfigTypeSelect.js`: Menambahkan `<option value="unr_pjk_c600">PJK C600</option>`.
2. `src/lib/generator.js`: Parameterisasi template C600 `unr_v130` dan `unr_pjk_c600` (`targetVlan` 1000 vs 130) tanpa global replacement.
3. `PRD.md`: Menambahkan baris dokumentasi `PJK C600` (C600, VLAN 1000, + TR-069, ACS) pada tabel UNR C600.
4. `tests/pjk_c600.test.mjs`: Unit test terarah mencakup pengujian output PJK C600, parameter pppoeUser & cleanId, deskripsi fallback, integritas angka 1000 pada data pelanggan, serta regresi varian lain.
5. `tests/integration.test.mjs`: Ditambahkan pengujian end-to-end generator flow untuk `unr_pjk_c600`.

## Status Acceptance Criteria
- **AC1** (Pilihan PJK C600 tersedia di tab UNR & menghasilkan template benar): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` & `tests/integration.test.mjs`).
- **AC2** (Output sesuai acuan: C600, VLAN 1000, profile v1000, WAN/TR-069, urutan perintah): **PASS** (Terbukti di `tests/pjk_c600.test.mjs`).
- **AC3** (Seluruh parameter mengambil sumber yang benar; pppoeUser dari form, cleanId <= 10 karakter, tidak ada kredensial nyata di-hardcode): **PASS** (Terbukti di `tests/pjk_c600.test.mjs`).
- **AC4** (Output konfigurasi existing, default, dan MikroTik tetap aman tanpa regresi): **PASS** (Terbukti di `tests/pjk_c600.test.mjs`).
- **AC5** (Dokumentasi sesuai dan output tidak mengandung undefined/null): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` & `PRD.md`).

## Hasil Verifikasi
- Unit test runner: `node --test tests/rjw_v131.test.mjs tests/pjk_c600.test.mjs tests/integration.test.mjs` -> 16 tests passed, 0 failed.
- Linter: `npm run lint` -> exit code 0 (0 error, 1 warning pre-existing di tailwind config).
- Build: `npm run build` -> exit code 0.
