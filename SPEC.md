# Specification: Penambahan Opsi PJK C600 pada Tab UNR

## Status: FINALIZED

## 1. Working Tree Baseline
- **Branch**: `main`
- **Baseline**: Bersih dari perubahan tak ter-commit.
- **Scope Task**: Penambahan opsi `PJK C600` (`unr_pjk_c600`) pada dropdown tab UNR, template generator C600 dengan VLAN 1000 dan TR-069 ACS, pengujian terarah, dan pembaruan dokumentasi. Penambahan UGR C600 tetap ditunda.

---

## 2. Pilihan Konfigurasi UI
- **Tab**: UNR (`configType="standard"`).
- **Label Opsi**: `PJK C600` (persis).
- **Identifier**: `unr_pjk_c600` pada `selectedC600Type`.
- **Posisi Dropdown**: Pada `ConfigTypeSelect.js` di dalam grup `configType === "standard"`. Opsi existing (`standard`, `unr_v130`, `bridge`, `unr_v1001`, `unr_v131`, `unr_ddr`) dipertahankan sepenuhnya.
- Alur `configType` tetap `"standard"`; tidak menambahkan case `configType` baru yang tidak digunakan UI.

---

## 3. Acuan CLI & Logika Generator
- **Target Perangkat & Sintaks**: ZTE C600 (`gpon_olt-`, `gpon_onu-`, `vport-${interfaceOlt}.${onuId}:1`).
- **Mode Layanan**: PPPoE (VLAN 1000, profile `v1000`) + TR-069 ACS.
- **Template CLI Acuan**:
  ```text
  conf t
  interface gpon_olt-${interfaceOlt}
  onu ${onuId} type ALL sn ${sn}
  exit
  interface gpon_onu-${interfaceOlt}:${onuId}
  name ${cleanId}
  description ${descText}
  tcont 1 profile kusuma
  gemport 1 tcont 1
  exit
  interface vport-${interfaceOlt}.${onuId}:1
  service-port 1 user-vlan 1000 vlan 1000
  exit
  pon-onu-mng gpon_onu-${interfaceOlt}:${onuId}
  service 1 gemport 1 vlan 1000
  security-mgmt 1 state enable mode forward protocol web
  wan-ip 1 ipv4 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v1000 host 1
  wan 1 service tr069 internet
  tr069-mgmt 1 state unlock
  tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username ${acsUser} password ${acsPass}
  exit
  exit
  write
  ```
- **Aturan Parameter**:
  - `cleanId` = `idPelanggan.toString().slice(0, 10)`
  - `descText` = `namaPelanggan ? `${cleanId} - ${namaPelanggan.toUpperCase()}` : cleanId`
  - PPPoE username = `pppoeUser` (sesuai field form, bukan `cleanId`)
  - PPPoE password = `pppoePass`
  - Kredensial ACS = `process.env.NEXT_PUBLIC_ACS_USER` dan `process.env.NEXT_PUBLIC_ACS_PASS`
  - Tidak melakukan penggantian global string ("replace all") pada output.

---

## 4. Acceptance Criteria
- **AC1**: Pilihan PJK C600 tersedia di tab UNR dan menghasilkan template yang benar saat Generate ditekan.
- **AC2**: Output sesuai acuan: sintaks C600, VLAN 1000, profile v1000, konfigurasi WAN/TR-069, serta urutan perintah.
- **AC3**: Seluruh parameter mengambil sumber yang benar; tidak ada identitas pelanggan atau kredensial contoh yang di-hardcode.
- **AC4**: Output konfigurasi existing, default pilihan, dan generator MikroTik tetap mempertahankan perilakunya.
- **AC5**: Dokumentasi sesuai implementasi dan output untuk input valid tidak mengandung undefined/null atau placeholder yang tertinggal.

---

## 5. Rencana Pengujian
1. **Unit Test Terarah**:
   - Pengujian `generateC600` dengan `selectedC600Type: "unr_pjk_c600"` terhadap expected CLI string yang dibuat dari acuan.
   - Pembuktian bahwa data pelanggan yang memuat angka VLAN `1000` (misal ID `1000123456`) tidak termodifikasi.
   - Pengujian aturan identitas pelanggan (`cleanId` 10 karakter, uppercase description, fallback nama kosong).
   - Pengujian pemakaian `pppoeUser` dari form (bukan `cleanId`).
   - Pengujian regresi terhadap varian UNR lain (`standard`, `unr_v130`, `bridge`, `unr_v1001`, `unr_v131`, `unr_ddr`) dan MikroTik secret.
2. **Pengujian Integrasi UI**:
   - Memeriksa keberadaan `<option value="unr_pjk_c600">PJK C600</option>` di `ConfigTypeSelect.js`.
   - Memastikan aliran dropdown -> form state -> generator menghasilkan skrip PJK C600.
3. **Lint & Build**:
   - `npm run lint` & `npm run build` berjalan bebas error.
