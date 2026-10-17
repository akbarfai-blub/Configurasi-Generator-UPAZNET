# Specification: Penambahan Opsi PJK C600 Bridge pada Tab UGR

## Status: FINALIZED

## 1. Working Tree Baseline
- **Branch**: `main`
- **Baseline**: Bersih dari perubahan tak ter-commit.
- **Scope Task**:
  1. Menambahkan opsi `PJK C600 Bridge` (`ugr_pjk_c600_bridge`) pada tab UGR di dalam optgroup Standard, berdekatan dengan `PJK C600`.
  2. Mengimplementasikan generator berbasis acuan **UNR Bridge existing** pada `generateC600` dengan penggantian terarah:
     - VLAN PPPoE: 134 -> 1000
     - VLAN Bridge: 129 -> 1001
     - WAN vlan-profile: v134 -> v1000
  3. Routing generator UGR meneruskan subtype secara eksplisit tanpa terpengaruh pilihan tab UNR sebelumnya.
  4. Mempertahankan konfigurasi existing: UNR Bridge tetap 134/129, PJK C600 non-Bridge tetap 1000, dan varian lainnya tidak terganggu.
  5. Memperbarui dokumentasi di `PRD.md`.
  6. Menyiapkan unit test dan integration test terarah.

---

## 2. Pilihan Konfigurasi UI
- **File**: `src/components/form/ConfigTypeSelect.js`
- **Tab**: UGR (`configType === "ugr"`)
- **Optgroup**: `Standard`
- **Label**: `PJK C600 Bridge` (persis)
- **Identifier**: `ugr_pjk_c600_bridge` pada `selectedUgrType`
- **Posisi**: Tepat di bawah `ugr_pjk_c600`:
  ```jsx
  <optgroup label="Standard">
    <option value="ugr_standard">Standard (PPPoE)</option>
    <option value="ugr_bridge">Bridge Mode</option>
    <option value="ugr_pjk_c600">PJK C600</option>
    <option value="ugr_pjk_c600_bridge">PJK C600 Bridge</option>
  </optgroup>
  ```

---

## 3. Acuan & Logika CLI
- **Acuan CLI**: Struktur UNR Bridge (`selectedC600Type === "bridge"`)
- **Template CLI PJK C600 Bridge**:
  ```text
  config terminal
  interface gpon_olt-${interfaceOlt}
  onu ${onuId} type ALL sn ${sn}
  !
  interface gpon_onu-${interfaceOlt}:${onuId}
  name ${cleanId}
  description ${descText}
  tcont 1 profile kusuma
  gemport 1 tcont 1
  gemport 2 tcont 1
  !
  interface vport-${interfaceOlt}.${onuId}:1
  service-port 1 user-vlan 1000 vlan 1000
  !
  interface vport-${interfaceOlt}.${onuId}:2
  service-port 2 user-vlan 1001 vlan 1001
  !
  pon-onu-mng gpon_onu-${interfaceOlt}:${onuId}
  service 1 gemport 1 vlan 1000
  service 2 gemport 2 vlan 1001
  security-mgmt 1 state enable mode forward protocol web
  wan-ip 1 ipv4 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v1000 host 1
  wan 1 service tr069 internet
  tr069-mgmt 1 state unlock
  tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username ${process.env.NEXT_PUBLIC_ACS_USER} password ${process.env.NEXT_PUBLIC_ACS_PASS}
  !
  !
  write
  ```
- **Routing**:
  - `generateUGR`: Saat `selectedUgrType === "ugr_pjk_c600_bridge"`, memanggil `generateC600({ ...data, selectedC600Type: "ugr_pjk_c600_bridge" })`.
  - `generateC600`: Melakukan parameterisasi aman pada blok bridge untuk `ugr_pjk_c600_bridge` (PPPoE VLAN 1000, Bridge VLAN 1001, WAN profile v1000) vs `bridge` biasa (134/129/v134).
  - Tidak melakukan penggantian global string pada output.

---

## 4. Acceptance Criteria
- **AC1**: PJK C600 Bridge tersedia pada optgroup Standard tab UGR dan terhubung ke generator yang benar.
- **AC2**: Output sesuai acuan UNR Bridge, dengan PPPoE VLAN 1000, Bridge VLAN 1001, dan profile v1000.
- **AC3**: Seluruh parameter pelanggan berasal dari form sesuai aturan existing; angka 1000/1001 dalam data pelanggan tidak ikut berubah.
- **AC4**: Pilihan terakhir di tab lain tidak memengaruhi hasil. Kembali ke UNR Bridge tetap menghasilkan VLAN 134/129.
- **AC5**: PJK non-Bridge, konfigurasi existing yang terdampak, dan output MikroTik tetap sama.
- **AC6**: Dokumentasi mencatat opsi PJK C600 Bridge di UGR dengan pasangan VLAN 1000/1001.
