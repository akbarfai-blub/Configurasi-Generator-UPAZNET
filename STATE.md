# Task State

## Current Phase: Penambahan Opsi Konfigurasi JBG Bridge (UNR C600)
- **Status SPEC.md / PRD**: FINALIZED.
- **Git Status**: Working tree aktif memiliki perubahan yang belum di-commit (*uncommitted changes* ter-scope pada `src/components/form/ConfigTypeSelect.js`, `src/lib/generator.js`, `tests/jbg_bridge.test.mjs`, `STATE.md`, serta perubahan existing pengguna pada `src/lib/commands.js`).
- **Status Pekerjaan**: **CLOSED / Done** (Penambahan opsi JBG Bridge pada dropdown UNR C600 dan generator CLI ZTE C600 telah selesai, terverifikasi AC1–AC4, dan lulus test suite 52/52).

---

## 1. Fitur Baru: JBG Bridge (UNR C600)
- **Komponen UI**: [`src/components/form/ConfigTypeSelect.js`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/src/components/form/ConfigTypeSelect.js)
  - Menambahkan `<option value="unr_jbg_bridge">JBG Bridge</option>` tepat di bawah `<option value="bridge">Bridge Mode</option>` pada tab `configType === "standard"`.
- **Logika Generator**: [`src/lib/generator.js`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/src/lib/generator.js)
  - Menambahkan penanganan `selectedC600Type === "unr_jbg_bridge"` di dalam `generateC600(data)`.
  - Service 1 (PPPoE WAN): `vport-${interfaceOlt}.${onuId}:1`, `user-vlan 1001 vlan 1001`, `service 1 gemport 1 vlan 1001`, `vlan-profile v1001 host 1`.
  - Service 2 (Bridge): `vport-${interfaceOlt}.${onuId}:2`, `user-vlan 131 vlan 131`, `service 2 gemport 2 vlan 131`.
  - Blok konfigurasi dibuka dengan `conf t` dan ditutup dengan `exit` (bukan `config terminal` / `!`).
  - Variabel: `name ${cleanId}` (maksimal 10 karakter), `description ${descText}` (`${cleanId} - ${namaPelanggan.toUpperCase()}` jika nama diisi, atau `${cleanId}` jika kosong).
  - Menggunakan akun `${pppoeUser}` dan `${pppoePass}` sinkron dengan MikroTik secret.
  - Kredensial ACS menggunakan environment variable `${process.env.NEXT_PUBLIC_ACS_USER}` dan `${process.env.NEXT_PUBLIC_ACS_PASS}`.

---

## 2. Matriks Verifikasi & Pengujian

| Pengujian | Perintah / Script | Exit Code | Lingkup & Catatan | Hasil |
|---|---|---|---|---|
| **Unit Test JBG Bridge (AC1–AC4)** | `node --test tests/jbg_bridge.test.mjs` | `0` | 4 test: opsi dropdown, output CLI persis referensi, integritas data (ID/nama berangka 1001/131, cleanId <= 10 char, no undefined/null), dan uji regresi opsi lain | **PASSED** |
| **Seluruh Test Suite** | `npm test` | `0` | 52 test lulus tanpa regresi (hardening, integration, pjk_c600, rjw_v131, tab-selection, jbg_bridge) | **PASSED** |
| **Linter / ESLint** | `npm run lint` | `0` | 0 errors, 1 warning (unrelated anonymous default export pada tailwind.config) | **PASSED** |
| **Pemeriksaan Sintaks Generator** | `node --check src/lib/generator.js` | `0` | Sintaks ECMAScript valid | **PASSED** |

---

## 3. Daftar Berkas Terkait Pekerjaan

### Berkas yang Diperbarui pada Task Ini
1. [`src/components/form/ConfigTypeSelect.js`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/src/components/form/ConfigTypeSelect.js): Menambahkan opsi `<option value="unr_jbg_bridge">JBG Bridge</option>` di bawah `bridge`.
2. [`src/lib/generator.js`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/src/lib/generator.js): Menambahkan template CLI `unr_jbg_bridge` pada `generateC600`.
3. [`tests/jbg_bridge.test.mjs`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/tests/jbg_bridge.test.mjs): Unit test menyeluruh untuk memvalidasi AC1–AC4.
4. [`STATE.md`](file:///d:/Web%20Dev/ConfigGenerator/config-generator-upaznet/STATE.md): Dokumentasi status dan riwayat pengujian.
