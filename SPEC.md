# Specification: Penambahan Opsi RJW VLAN 131 pada Tab UNR

## Status: FINALIZED

## 1. Working Tree Baseline
- **Branch**: `main`
- **Pre-existing changes** (harus dijaga dan tidak ditimpa/diklaim):
  - `PRD.md`: Perubahan dokumentasi Command Hub & responsive layout
  - `AGENTS.MD`: Dokumen instruksi agent
- **Task Scope Terkini**: Penambahan opsi `V131 (RJW)` pada tab UNR berbasis template RJW V1001 existing (`unr_v1001`). Penambahan UGR C600 ditunda sesuai arahan pengguna.

---

## 2. Acuan & Perilaku Template
- **Template Acuan**: `selectedC600Type === "unr_v1001"` pada `src/lib/generator.js`.
- **Target Perangkat & Sintaks**: ZTE C300/C320 (`gpon-olt_` dan `gpon-onu_`).
- **Mode Layanan**: PPPoE.
- **Perbedaan spesifik terhadap V1001**:
  - VLAN: 1001 -> 131 (`service-port 1 vport 1 user-vlan 131 vlan 131` & `service 1 gemport 1 vlan 131`)
  - VLAN Profile: `v1001` -> `v131` (`vlan-profile v131 host 1`)
- **Aturan yang dipertahankan sama persis**:
  - `cleanId` = `idPelanggan.toString().slice(0, 10)`
  - `descText` = `namaPelanggan ? `${cleanId} - ${namaPelanggan.toUpperCase()}` : cleanId`
  - `name ${cleanId}`
  - `description ${descText}`
  - `tcont 1 profile kusuma`
  - `gemport 1 tcont 1`
  - `security-mgmt 1 state enable mode forward protocol web`
  - PPPoE username = `${cleanId}` (mengikuti kontrak RJW V1001)
  - PPPoE password = `${pppoePass}`
  - Struktur CLI: urutan `conf t`, `exit`, dan penutup `write`.
- **Catatan Keamanan Data**:
  - Tidak melakukan penggantian global string ("replace all") pada teks output agar data pelanggan sintetis/riil yang memuat deret angka `1001` (misal ID pelanggan `1001001234`) tidak berubah secara keliru.

---

## 3. Rencana Perubahan Kode
1. **Dropdown UI (`src/components/form/ConfigTypeSelect.js`)**:
   - Menambahkan `<option value="unr_v131">V131 (RJW)</option>` berdekatan dengan `<option value="unr_v1001">V1001 (RJW)</option>`.
2. **Generator (`src/lib/generator.js`)**:
   - Menangani `selectedC600Type === "unr_v131"` pada `generateC600` dengan parameterisasi aman atau blok khusus tanpa modifikasi global.
3. **Hook Routing Generator (`src/hooks/useScriptGenerator.js`)**:
   - Memastikan `unr_v131` ter-route dengan benar ke `generateC600`.
4. **Dokumentasi (`PRD.md`)**:
   - Menambahkan catatan baris opsi V131 pada tabel UNR C600 tanpa mengubah bagian lain dokumen.
5. **Testing Terarah**:
   - Menyiapkan suite unit test independen dengan data sintetis untuk memverifikasi V131, regresi V1001, serta pembuktian integritas data pelanggan berangka `1001`.

---

## 4. Acceptance Criteria
- **AC1**: Opsi V131 (RJW) tersedia di tab UNR dan terhubung ke generator yang benar.
- **AC2**: Untuk input yang sama, hasil RJW V131 mengikuti template RJW V1001 dengan perubahan hanya pada nilai VLAN (131) dan vlan-profile (`v131`).
- **AC3**: Aturan identitas pelanggan, username PPPoE (`cleanId`), password, serta struktur CLI tetap sama dengan acuan.
- **AC4**: RJW V1001, pilihan default, output MikroTik, dan konfigurasi existing yang terdampak tetap mempertahankan perilakunya.
- **AC5**: Output untuk input valid tidak mengandung `undefined`/`null` atau placeholder yang tertinggal; dokumentasi sesuai hasil implementasi.
