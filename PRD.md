# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Nama Produk:** Upaznet Config & Command Generator  
**Versi:** 2.0.0  
**Platform:** Web Application (Desktop Optimized, Mobile Responsive)  
**Tech Stack:** React (Next.js), Tailwind CSS, Node.js  
**Terakhir Diperbarui:** Juni 2026

---

## 1. Ringkasan Eksekutif (Executive Summary)

Upaznet Config & Command Generator adalah internal web tool yang dirancang khusus untuk mengoptimalkan dan mempercepat alur kerja tim Helpdesk dan Network Engineer UPAZNET. Aplikasi ini mengotomatiskan pembuatan skrip konfigurasi untuk perangkat OLT ZTE (C600, C300, C320) dan MikroTik (PPPoE Secret).

Sejak versi 1.0.0, aplikasi telah berkembang signifikan dengan penambahan tab konfigurasi baru, sub-opsi konfigurasi yang lebih lengkap, optimasi UI/UX untuk mobile, dan fitur Quick Fill untuk mempercepat input data. Antarmuka 3-kolom yang intuitif meminimalisir kesalahan input manual dan menyediakan akses cepat ke perintah troubleshooting jaringan secara real-time.

---

## 2. Target Pengguna (User Personas)

**Tier 1 Helpdesk / NOC**
Membutuhkan tools yang cepat untuk registrasi pelanggan baru, aktivasi layanan, ganti perangkat (modem/ONU), dan pencarian status modem (troubleshooting dasar). Bekerja di traffic-desk dengan desktop browser.

**Network Engineer**
Membutuhkan generator skrip presisi tinggi yang sesuai dengan standar keamanan dan topologi VLAN/Bridge perusahaan. Menggunakan tool untuk konfigurasi khusus dan validasi script.

---

## 3. Fitur Utama (Key Features)

### 3.1. Config Type Tabs

Navigasi utama berupa tab horizontal full-width di atas form dan output. Tab yang tersedia:

| Tab      | Keterangan                                  |
| -------- | ------------------------------------------- |
| UNR C600 | Pelanggan reguler jaringan C600             |
| UNB      | Pelanggan jaringan UNB dengan berbagai VLAN |
| UHO      | Pelanggan jaringan UHO                      |
| UBL      | Pelanggan jaringan UBL                      |
| UGR      | Pelanggan jaringan UGR (Babadan & KWD)      |
| UCD      | Pelanggan jaringan UCD                      |

### 3.2. Tipe Konfigurasi per Tab

Setiap tab memiliki dropdown "Tipe Konfigurasi" yang menentukan template script yang digunakan.

#### UNR C600

| Opsi                  | Format Interface | VLAN    | Catatan                                        |
| --------------------- | ---------------- | ------- | ---------------------------------------------- |
| Standard (PPPoE)      | C600             | 134     | + TR-069, ACS                                  |
| Bridge Mode           | C600             | 134/129 | + TR-069, ACS                                  |
| V1001                 | C300/C320        | 1001    | -                                              |
| V131                  | C300/C320        | 131     | RJW PPPoE                                      |
| Standard (PPPoE) V130 | C600             | 130     | + TR-069, ACS                                  |
| DDR Prisma V2104      | C600             | 2104    | + QoS traffic-policy DDR, format name: ID_Nama |

#### UNB

Dropdown menggunakan optgroup:

**Standard (PPPoE):**
| Opsi | Format Interface | VLAN | Catatan |
|------|-----------------|------|---------|
| UNB V100 | C300/C320 | 100 | vlan-profile v100 |
| UNB V1600 (AL KHOIRIYAH) | C300/C320 | 1600 | - |
| UNB V1501 (BOLO) | C300/C320 | 1501 | - |
| UNB V602 (ALNET) | C300/C320 | 602 | + Metro Profile dropdown |
| UNB V903 (LEXXA) | C300/C320 | 903 | + encrypt downstream |
| UNB V511 (CADAR) | C300/C320 | 511 | - |

**Bridge Mode:**
| Opsi | Format Interface | VLAN | Catatan |
|------|-----------------|------|---------|
| UNB Bridge | C300/C320 | 105/102 | - |
| Bridge Bolo | C300/C320 | 1500/1501 | vlan port hybrid |

#### UHO

| Opsi             | Format Interface | VLAN | Catatan                                              |
| ---------------- | ---------------- | ---- | ---------------------------------------------------- |
| Standard (PPPoE) | C300/C320        | 110  | -                                                    |
| DDR Prisma       | C300/C320        | 2104 | + traffic-limit downstream DDR, format name: ID_Nama |

#### UBL

| Opsi             | Format Interface | VLAN | Catatan       |
| ---------------- | ---------------- | ---- | ------------- |
| Standard (PPPoE) | C300/C320        | 1002 | Single config |

#### UGR

Dropdown menggunakan optgroup:

| Optgroup | Opsi             | VLAN      | Catatan          |
| -------- | ---------------- | --------- | ---------------- |
| Standard | Standard (PPPoE) | 1000      | -                |
| Standard | Bridge Mode      | 1000/200  | -                |
| Standard | PJK C600         | 1000      | C600, + TR-069, ACS |
| Babadan  | Babadan PPPoE    | 207       | -                |
| Babadan  | Babadan Bridge   | 207/206   | -                |
| KWD      | KWD PPPoE        | 1006      | -                |
| KWD      | KWD Bridge       | 1006/1007 | 4x vlan port eth |

#### UCD

| Opsi             | Format Interface | VLAN    | Catatan                      |
| ---------------- | ---------------- | ------- | ---------------------------- |
| Standard (PPPoE) | C300/C320        | 511     | + sn-bind, switchport hybrid |
| Bridge           | C300/C320        | 514/511 | -                            |

### 3.3. Standar Penamaan Script

#### Non-DDR (semua tab kecuali DDR):

```
name        → ID Pelanggan (cleanId)
description → ID Pelanggan - NAMA UPPERCASE
Contoh:
name 1010112678
description 1010112678 - BUDI SANTOSO
```

#### DDR (UNR DDR Prisma V2104, UHO DDR Prisma):

```
name        → ID_NamaPelanggan (underscore, tidak uppercase)
description → ID_NamaPelanggan (sama persis dengan name)
Contoh:
name 1010112678_Budi
description 1010112678_Budi
```

### 3.4. Form Input Cerdas (Smart Input Form)

- **Auto-Masking / Smart Separator:** Input Interface OLT mengonversi karakter Spasi, Titik (`.`), atau Koma (`,`) menjadi Garis Miring (`/`) secara real-time. Memblokir input alfabet.
- **Sinkronisasi ID:** Input ID Pelanggan otomatis menyalin nilainya ke kolom Username PPPoE.
- **Dynamic Dropdown:** Tipe Konfigurasi berubah sesuai tab aktif, menggunakan optgroup untuk tab dengan banyak opsi (UNB, UGR).
- **Metro Profile Dropdown:** Muncul khusus saat tab UNB opsi ALNET (V602) dipilih. Opsi: Metro 10, Metro 30, Metro 100. Default: Metro 10.

### 3.5. Quick Fill Modal

Tombol "Quick Fill dari Detail Koneksi" di bagian atas form membuka modal dengan dua mode:

**Mode Detail ONU** (default — untuk kasus ganti alat):

- User paste teks dari halaman Detail ONU sistem internal
- Auto-parse: Interface OLT, ONU ID, Serial Number
- Field yang tetap manual: Password, Tab, Tipe Konfigurasi, Paket Layanan

**Mode Detail Koneksi Gpon** (untuk pasang baru):

- User paste teks dari modal Detail Koneksi Gpon
- Auto-parse: ID Pelanggan, Nama Pelanggan, PPPoE User, Serial Number, ONU ID
- Field yang tetap manual: Password, Interface OLT, Tab, Tipe Konfigurasi

Jika teks tidak valid → tampil pesan error di dalam modal.

### 3.6. Generator Skrip Terpisah (Dual-Output Generator)

Hasil generate dibagi menjadi dua kotak terminal terpisah untuk mencegah kesalahan copy-paste:

- **ZTE OLT Script:** Skrip registrasi ONU sesuai tipe konfigurasi yang dipilih. Mendukung format C600 dan C300/C320.
- **MikroTik Script:** Skrip `/ppp secret add` dengan comment format `ID-NAMA`.

Setiap box memiliki tombol copy dengan feedback visual "COPIED!".

### 3.7. Command Hub

Sidebar interaktif berisi perintah troubleshooting siap pakai.

**Toggle Mode OLT:** C600 (`gpon_onu-`) vs C300/C320 (`gpon-onu_`)

**Daftar Command C600:**

- Cek Redaman 1 Port
- Cek Redaman Pelanggan
- Reboot Modem
- Hapus ONU
- Aktivasi Port OLT
- Cek Status 1 Port
- Cek SN Belum Config
- Detail Info Pelanggan
- Cek Detail WAN
- Cek Config WAN

**Daftar Command C300/C320:**

- Cek Redaman 1 Port
- Cek Redaman Pelanggan
- Reboot Modem
- Restore Factory
- Ganti SN Modem
- Hapus ONU (OLT)
- Aktivasi Port OLT
- Cek Status 1 Port
- Cek Running Config
- Cek WAN Pelanggan
- Cek SN Belum Config
- Detail Info Pelanggan
- Cek Interface by SN
- Cek IP ONU
- Cek Detail WAN

Semua command menggunakan nilai Interface, ONU ID, dan SN dari form secara real-time.

---

## 4. Kebutuhan Antarmuka & UX (UI/UX Requirements)

### 4.1. Layout Desktop (≥ 1280px)

3-kolom: Config Type Tabs (full width) di atas, kemudian Form Input (kiri) | Output Script + Command Hub (kanan).

```
┌─────────────────────────────────────────────────────┐
│ Header                                              │
├─────────────────────────────────────────────────────┤
│ [UNR C600] [UNB] [UHO] [UBL] [UGR] [UCD]          │
├──────────────────┬──────────────────────────────────┤
│                  │ Script OLT (ZTE)                 │
│   Form Input     ├──────────────────────────────────┤
│   (sticky)       │ Script MikroTik (PPPoE Secret)   │
│                  ├──────────────────────────────────┤
│                  │ Command Hub                      │
└──────────────────┴──────────────────────────────────┘
```

### 4.2. Layout Mobile & Tablet (< 1280px)

1-kolom, urutan scroll:

1. Config Type Tabs (full width, scrollable horizontal)
2. Form Input + Generate Script
3. Script OLT (ZTE)
4. Script MikroTik (PPPoE Secret)
5. Command Hub (accordion, collapsed by default)

### 4.3. Corporate Branding

- **Primary/Terminal Background:** `upaz-blue` (`#003C71`)
- **Accent/Action:** `upaz-green` (`#00A651`) untuk tombol Generate, notifikasi Copied, interaksi sukses
- **Background:** `upaz-bg`

### 4.4. Visual Feedback

- Indikator "COPIED!" saat script atau command disalin
- Command Hub accordion dengan tombol BUKA/TUTUP di mobile
- Output box height dinamis: kecil saat kosong, membesar mengikuti konten setelah generate
- Scroll horizontal pada output box untuk script panjang

---

## 5. Standar Keamanan (Security Constraints)

- **Perlindungan Kredensial:** Username dan Password ACS/TR-069 dilarang hardcoded di source code.
- **Environment Variables:** Wajib menggunakan `.env.local` (development) dan Environment Variables platform (production). Variabel tanpa prefix `NEXT_PUBLIC_` agar tidak terekspos ke client-side.
- **File `.env.local`** masuk ke `.gitignore`.

---

## 6. Arsitektur & Konvensi Kode

### 6.1. Struktur Folder

```
src/
├── app/
│   ├── page.js          ← pure container
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── form/
│   │   ├── ConfigTypeTabs.js
│   │   ├── ConfigTypeSelect.js
│   │   ├── OltFormSection.js
│   │   ├── CustomerFormSection.js
│   │   ├── ServiceFormSection.js
│   │   └── QuickFillModal.js
│   ├── output/
│   │   └── ScriptOutput.js
│   └── ui/
│       └── CommandSidebar.js
├── hooks/
│   ├── useClipboard.js
│   ├── useOltInterfaceMask.js
│   ├── useScriptGenerator.js
│   └── useQuickFill.js
└── lib/
    ├── generator.js
    ├── commands.js
    └── constants.js
```

### 6.2. Konvensi Penamaan

- Komponen: PascalCase
- Hooks: camelCase dengan prefix `use`
- Semua komponen wajib `"use client"` di baris pertama
- Format interface C600: `gpon_olt-` dan `gpon_onu-`
- Format interface C300/C320: `gpon-olt_` dan `gpon-onu_`

---

## 7. Rencana Pengembangan (Future Roadmap)

**Fase 2 — Authentication & RBAC**
Penambahan sistem Login berbasis peran (Role-Based Access Control) untuk membatasi akses generator hanya kepada karyawan internal.

**Fase 3 — MikroTik API Integration**
Integrasi API langsung ke router MikroTik lokal untuk eksekusi skrip PPPoE secara otomatis tanpa copy-paste manual. Tombol "Push to MikroTik" langsung setelah generate.

**Fase 4 — History & Preset**

- Simpan 5-10 generate terakhir (recent history)
- Preset konfigurasi untuk area/cluster yang sering dipakai
- Export script ke file `.txt` / `.rsc`

---

## 8. Changelog

| Versi | Perubahan                                                                                                                                                                                                                                                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | Rilis awal: UNR C600, UNB, UHO, UBL, UGR. Layout 3-kolom desktop. Command Hub dasar.                                                                                                                                                                                                                                                                           |
| 2.0.0 | Tambah tab UCD. Sub-opsi konfigurasi per tab (DDR, Babadan, KWD, V1001, V130, dll). Optgroup dropdown UNB & UGR. Metro Profile untuk ALNET. Quick Fill Modal. Mobile responsive layout dengan accordion Command Hub. Refactor arsitektur (hooks, komponen terpisah). Penambahan command Cek Detail WAN & Cek Config WAN. Standarisasi format name/description. |
