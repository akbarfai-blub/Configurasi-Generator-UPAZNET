# Task State

## Current Phase: Revisi Konfigurasi PJK C600 Bridge (ugr_pjk_c600_bridge) VLAN 200 (Tab UGR)
- **Status SPEC.md / PRD**: FINALIZED.
- **Git Status**: Working tree aktif memiliki perubahan yang belum di-commit (*uncommitted changes* ter-scope pada `src/lib/generator.js`, `tests/pjk_c600.test.mjs`, `tests/integration.test.mjs`, `tests/jbg_bridge.test.mjs`, dan `STATE.md`).
- **Status Pekerjaan**: **CLOSED / Done** (Revisi VLAN Bridge `ugr_pjk_c600_bridge` menjadi VLAN 200 telah selesai, terverifikasi AC1–AC3, dan lulus seluruh test suite 52/52).

---

## 1. Scope Perubahan: PJK C600 Bridge (Tab UGR)
- **Logika Generator**: [`src/lib/generator.js`](file:///d:/Web/ConfigGenerator/config-generator-upaznet/src/lib/generator.js)
  - Pada `generateC600(data)` untuk kondisi `isPjkBridge` (`selectedC600Type === "ugr_pjk_c600_bridge"`):
    - `activePppoeVlan` tetap `"1000"` (`vlan-profile v1000`, `service-port 1 ... vlan 1000`).
    - `activeBridgeVlan` diubah dari `"1001"` menjadi `"200"`.
    - Menghasilkan:
      - Service 1 (PPPoE WAN): `service-port 1 user-vlan 1000 vlan 1000`, `service 1 gemport 1 vlan 1000`, `vlan-profile v1000 host 1`.
      - Service 2 (Bridge): `service-port 2 user-vlan 200 vlan 200`, `service 2 gemport 2 vlan 200`.
  - Kondisi `selectedC600Type === "bridge"` (UNR Bridge biasa) tetap terjaga menggunakan PPPoE VLAN `134` dan Bridge VLAN `129`.
  - Kredensial ACS tetap menggunakan environment variable `${process.env.NEXT_PUBLIC_ACS_USER}` dan `${process.env.NEXT_PUBLIC_ACS_PASS}`.

---

## 2. Matriks Verifikasi & Pengujian

| Pengujian | Perintah / Script | Exit Code | Lingkup & Catatan | Hasil |
|---|---|---|---|---|
| **Unit Test PJK C600 Bridge** | `node --test tests/pjk_c600.test.mjs` | `0` | Memvalidasi AC1–AC4: dropdown option, template CLI bridge persis referensi (VLAN 1000 & 200), integritas data ID/nama berangka 1000/200, cleanId <= 10 char, dan isolasi cross-tab | **PASSED** |
| **Integration Test** | `node --test tests/integration.test.mjs` | `0` | E2E generator flow untuk `ugr_pjk_c600_bridge` dengan assertion VLAN 200 pada service-port 2 dan service 2 gemport 2 | **PASSED** |
| **JBG Bridge Regression Test** | `node --test tests/jbg_bridge.test.mjs` | `0` | Memvalidasi AC1–AC4 JBG Bridge serta uji regresi `ugr_pjk_c600_bridge` dengan VLAN 200 | **PASSED** |
| **Seluruh Test Suite** | `npm test` | `0` | 52 test lulus tanpa regresi (hardening, integration, pjk_c600, rjw_v131, tab-selection, jbg_bridge) | **PASSED** |
| **Linter / ESLint** | `npm run lint` | `0` | 0 errors, 1 warning (unrelated anonymous default export pada tailwind.config) | **PASSED** |
| **Pemeriksaan Sintaks Generator** | `node --check src/lib/generator.js` | `0` | Sintaks ECMAScript valid | **PASSED** |

---

## 3. Daftar Berkas Terkait Pekerjaan

### Berkas yang Diperbarui pada Task Ini
1. [`src/lib/generator.js`](file:///d:/Web/ConfigGenerator/config-generator-upaznet/src/lib/generator.js): Mengubah `activeBridgeVlan` dari `"1001"` menjadi `"200"` untuk `isPjkBridge`.
2. [`tests/pjk_c600.test.mjs`](file:///d:/Web/ConfigGenerator/config-generator-upaznet/tests/pjk_c600.test.mjs): Memperbarui test AC2, AC3, dan AC4 dengan assertion VLAN 200 dan mock data angka 200.
3. [`tests/integration.test.mjs`](file:///d:/Web/ConfigGenerator/config-generator-upaznet/tests/integration.test.mjs): Memperbarui flow test `ugr_pjk_c600_bridge` ke VLAN 200.
4. [`tests/jbg_bridge.test.mjs`](file:///d:/Web/ConfigGenerator/config-generator-upaznet/tests/jbg_bridge.test.mjs): Memperbarui placement check AC1 (agar selaras dengan optgroup Bridge Mode) dan assertion regresi nomor 7 `ugr_pjk_c600_bridge` ke VLAN 200.
5. [`STATE.md`](file:///d:/Web/ConfigGenerator/config-generator-upaznet/STATE.md): Dokumentasi status dan riwayat pengujian.
