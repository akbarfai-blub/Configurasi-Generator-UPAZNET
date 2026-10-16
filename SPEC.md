# Specification: Pemindahan Opsi PJK C600 ke Tab UGR

## Status: FINALIZED

## 1. Working Tree Baseline
- **Branch**: `main`
- **Baseline**: Bersih dari perubahan tak ter-commit (semua commit sebelumnya telah di-push).
- **Scope Task**:
  1. Menghapus opsi `PJK C600` dari dropdown tab UNR (`configType === "standard"`).
  2. Menambahkan opsi `PJK C600` pada optgroup **Standard** di dropdown tab UGR (`configType === "ugr"`).
  3. Menggunakan identifier `ugr_pjk_c600` pada `selectedUgrType`.
  4. Routing generator: Ketika `configType === "ugr"` dan `selectedUgrType === "ugr_pjk_c600"`, memanggil template PJK C600 secara eksplisit tanpa terpengaruh nilai `selectedC600Type` terakhir dari tab UNR.
  5. Menjaga konfigurasi CLI PJK C600 tetap identik: C600, VLAN 1000, profile `v1000`, PPPoE username dari `pppoeUser`, TR-069 ACS.
  6. Memperbarui dokumentasi di `PRD.md`.
  7. Menyesuaikan pengujian unit test dan integrasi.

---

## 2. Rencana Perubahan UI
- **File**: `src/components/form/ConfigTypeSelect.js`
- **Tab UNR (`configType === "standard"`)**:
  - Hapus `<option value="unr_pjk_c600">PJK C600</option>`.
- **Tab UGR (`configType === "ugr"`)**:
  - Di dalam `<optgroup label="Standard">`:
    ```jsx
    <optgroup label="Standard">
      <option value="ugr_standard">Standard (PPPoE)</option>
      <option value="ugr_bridge">Bridge Mode</option>
      <option value="ugr_pjk_c600">PJK C600</option>
    </optgroup>
    ```
  - Label: persis `PJK C600`.
  - Identifier: `ugr_pjk_c600`.

---

## 3. Rencana Routing Generator
- **File**: `src/lib/generator.js`
  - Di dalam `generateUGR`:
    ```javascript
    if (selectedUgrType === "ugr_pjk_c600") {
      return generateC600({ ...data, selectedC600Type: "unr_pjk_c600" });
    }
    ```
  - Di dalam `generateC600`:
    Mendukung `selectedC600Type === "unr_pjk_c600"` maupun `selectedC600Type === "ugr_pjk_c600"` atau `selectedUgrType === "ugr_pjk_c600"`.
- **Independensi State**:
  - Karena `generateUGR` meneruskan `{ ...data, selectedC600Type: "unr_pjk_c600" }` secara eksplisit, nilai `selectedC600Type` lama dari tab UNR (misal `unr_v130`, `unr_v1001`, dll.) tidak akan memengaruhi output PJK C600 saat user berada di tab UGR.

---

## 4. Acceptance Criteria
- **AC1**: PJK C600 hanya tersedia pada optgroup Standard tab UGR dan tidak lagi tersedia pada dropdown UNR.
- **AC2**: Memilih PJK C600 di UGR lalu Generate menghasilkan output yang sama dengan template PJK sebelum pemindahan.
- **AC3**: Pilihan terakhir pada tab UNR tidak memengaruhi output PJK. Contohnya, UNR V130 lalu UGR PJK tetap menghasilkan C600 VLAN 1000.
- **AC4**: Setelah memilih PJK, berpindah ke UGR Standard/Babadan/KWD atau kembali ke UNR menghasilkan template sesuai pilihan masing-masing.
- **AC5**: Default, konfigurasi existing, dan output MikroTik tidak berubah.
- **AC6**: Dokumentasi menempatkan PJK C600 di UGR dan menjelaskan perubahan lokasi tanpa mengklaim perubahan CLI.

---

## 5. Rencana Pengujian
1. **Pemeriksaan UI**:
   - Memastikan `unr_pjk_c600` tidak ada lagi di blok UNR.
   - Memastikan `ugr_pjk_c600` ada di optgroup Standard pada blok UGR.
2. **Pengujian Independensi State Tab (Cross-tab isolation)**:
   - Form data dengan `selectedC600Type: "unr_v130"` dan `selectedUgrType: "ugr_pjk_c600"` saat di-generate dengan `generateUGR` tetap menghasilkan VLAN 1000 (bukan VLAN 130).
3. **Pengujian Output PJK C600**:
   - Identik dengan expected string acuan CLI.
4. **Pengujian Regresi**:
   - Varian UGR lain (`ugr_standard`, `ugr_bridge`, `ugr_babadan_pppoe`, `ugr_babadan_bridge`, `ugr_kwd_pppoe`, `ugr_kwd_bridge`).
   - Varian UNR (`standard`, `unr_v130`, `bridge`, `unr_v1001`, `unr_v131`, `unr_ddr`).
   - Generator MikroTik.
