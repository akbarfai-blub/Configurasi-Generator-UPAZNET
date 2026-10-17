# Task State

## Current Phase: Completed (PJK C600 Bridge pada Tab UGR)
- **Scope Aktif**: Penambahan opsi `PJK C600 Bridge` (`ugr_pjk_c600_bridge`) pada optgroup Standard di tab UGR dengan template C600 Bridge (PPPoE VLAN 1000, Bridge VLAN 1001, profile v1000).
- **Scope Ditunda**: Penambahan 6 varian UGR C600 lainnya tetap ditunda.
- **Status SPEC.md**: FINALIZED.

## Perubahan yang Dilakukan
1. `src/components/form/ConfigTypeSelect.js`:
   - Menambahkan `<option value="ugr_pjk_c600_bridge">PJK C600 Bridge</option>` di dalam optgroup Standard pada tab UGR, berdekatan dengan `PJK C600`.
2. `src/lib/generator.js`:
   - Parameterisasi template bridge di `generateC600` untuk menangani `selectedC600Type === "ugr_pjk_c600_bridge"` dengan PPPoE VLAN 1000, Bridge VLAN 1001, dan WAN profile `v1000`. Template UNR Bridge tetap menghasilkan VLAN 134/129.
   - Penambahan routing di `generateUGR`: `selectedUgrType === "ugr_pjk_c600_bridge"` memanggil `generateC600` dengan meneruskan `{ ...data, selectedC600Type: "ugr_pjk_c600_bridge" }` secara eksplisit, menjamin isolasi state cross-tab.
3. `PRD.md`: Menambahkan baris dokumentasi `PJK C600 Bridge` (1000/1001, C600, + TR-069, ACS) pada tabel UGR.
4. `tests/pjk_c600.test.mjs`: Menambahkan pengujian terarah untuk PJK C600 Bridge: ketersediaan opsi di UI, kecocokan output CLI dengan acuan, integritas angka 1000/1001 dalam data pelanggan, ketiadaan perintah tagging port Ethernet yang tidak ada pada acuan, isolasi state antartab, dan regresi UNR Bridge serta PJK C600 non-bridge.
5. `tests/integration.test.mjs`: Menambahkan pengujian end-to-end flow generator untuk `ugr_pjk_c600_bridge`.

## Status Acceptance Criteria
- **AC1** (PJK C600 Bridge tersedia di UGR Standard & terhubung ke generator): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` test #6 & `tests/integration.test.mjs` test #5).
- **AC2** (Output sesuai acuan UNR Bridge dengan PPPoE 1000, Bridge 1001, profile v1000): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` test #7).
- **AC3** (Parameter pelanggan dari form, angka 1000/1001 di ID/nama tidak terkorupsi, tidak ada perintah tagging eth): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` test #8).
- **AC4** (Pilihan di tab lain tidak memengaruhi hasil; UNR Bridge tetap 134/129): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` test #9).
- **AC5** (PJK non-bridge, konfigurasi existing, dan MikroTik tidak berubah): **PASS** (Terbukti di `tests/pjk_c600.test.mjs` test #9).
- **AC6** (Dokumentasi PRD mencatat PJK C600 Bridge di UGR dengan VLAN 1000/1001): **PASS** (Terbukti di `PRD.md`).

## Hasil Verifikasi
- Unit test runner: `node --test tests/rjw_v131.test.mjs tests/pjk_c600.test.mjs tests/integration.test.mjs` -> 20 passed, 0 failed.
- Linter: `npm run lint` -> exit code 0 (0 error, 1 warning pre-existing di tailwind config).
- Build: `npm run build` -> exit code 0.
