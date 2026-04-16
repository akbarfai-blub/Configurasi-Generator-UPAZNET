# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Nama Produk:** Upaznet Config & Command Generator  
**Versi:** 1.0.0  
**Platform:** Web Application (Desktop Optimized)  
**Tech Stack:** React (Next.js), Tailwind CSS, Node.js  

---

## 1. Ringkasan Eksekutif (Executive Summary)
Upaznet Config & Command Generator adalah internal web tool yang dirancang khusus untuk mengoptimalkan dan mempercepat alur kerja tim Helpdesk. Aplikasi ini mengotomatiskan pembuatan skrip konfigurasi untuk perangkat OLT ZTE (C600, C300, C320) dan MikroTik (PPPoE Secret). Dengan antarmuka 3-kolom yang intuitif, aplikasi ini meminimalisir kesalahan input manual (human error) dan menyediakan akses cepat ke perintah troubleshooting jaringan secara real-time.

## 2. Target Pengguna (User Personas)
* **Tier 1 Helpdesk / NOC:** Membutuhkan tools yang cepat untuk registrasi pelanggan baru, aktivasi layanan, dan pencarian status modem (troubleshooting dasar).
* **Network Engineer:** Membutuhkan generator skrip presisi tinggi yang sesuai dengan standar keamanan dan topologi VLAN/Bridge perusahaan.

## 3. Fitur Utama (Key Features)

### 3.1. Form Input Cerdas (Smart Input Form)
* **Auto-Masking / Smart Separator:** Input Interface OLT mengonversi karakter Spasi, Titik (`.`), atau Koma (`,`) menjadi Garis Miring (`/`) secara real-time (Contoh: `1.4.2` menjadi `1/4/2`). Memblokir input alfabet untuk menjaga akurasi data.
* **Sinkronisasi ID:** Input ID Pelanggan secara otomatis menyalin nilainya ke kolom Username PPPoE untuk mempercepat pengisian.
* **Dynamic Dropdown:** Pemilihan Tipe Konfigurasi (Standard/Bridge) dan Paket Layanan (Kategori Kusuma & Puspa) yang terstruktur.

### 3.2. Generator Skrip Terpisah (Dual-Output Generator)
Untuk mencegah kesalahan penyalinan (copy-paste), hasil generate dibagi menjadi dua kotak terminal terpisah:
* **ZTE OLT Script:** Menghasilkan skrip registrasi ONU, gemport, vlan, wan-ip, dan pengaturan TR-069. Mendukung variasi format antara OLT C600 dan C300/C320.
* **MikroTik Script:** Menghasilkan skrip `/ppp secret add` lengkap dengan parameter profil layanan dan komentar otomatis (Format: ID-NAMA).

### 3.3. Command Hub (Dynamic Sidebar)
Sidebar interaktif yang berisi daftar perintah troubleshooting (copy-to-clipboard dalam 1 klik).
* **Switcher Mode OLT:** Tombol toggle untuk menyesuaikan sintaks perintah antara versi C600 (`gpon_onu-`) dan C300/C320 (`gpon-onu_`).
* **Context-Aware Commands:** Perintah di dalam sidebar otomatis menggunakan nilai Interface, ONU ID, dan Serial Number (SN) yang diketik oleh pengguna di form sebelah kiri.
* **Cakupan Perintah:** Pengecekan redaman, status port (offline filter), reboot, hapus konfigurasi, hingga pelacakan antarmuka berdasarkan SN.

## 4. Kebutuhan Antarmuka & UX (UI/UX Requirements)
* **Layout:** 3-Kolom (Form Input -> Terminal Output -> Command Hub) agar pengguna tidak perlu melakukan scrolling vertikal.
* **Corporate Branding:** Menggunakan identitas warna perusahaan:
  * **Primary/Background Terminal:** `upaz-blue` (`#003C71`) untuk kesan teknis dan profesional.
  * **Accent/Action:** `upaz-green` (`#00A651`) untuk tombol Generate, notifikasi Copied, dan interaksi sukses.
* **Visual Feedback:** Indikator "COPIED!" yang muncul sekilas saat skrip atau perintah disalin.

## 5. Standar Keamanan (Security Constraints)
* **Perlindungan Kredensial:** Data sensitif seperti Username dan Password server pemantauan (ACS/TR-069) dilarang (*hardcoded*) di dalam source code.
* **Environment Variables:** Aplikasi wajib menggunakan file `.env.local` di lingkungan pengembangan dan fitur Environment Variables (Vercel) pada lingkungan produksi untuk menyuntikkan kredensial ACS secara dinamis ke dalam skrip OLT.

## 6. Rencana Pengembangan (Future Roadmap)
* **Fase 2:** Penambahan sistem Login/Authentication berbasis peran (Role-Based Access Control) untuk membatasi akses generator hanya kepada karyawan internal.
* **Fase 3:** Integrasi API langsung ke router MikroTik lokal untuk eksekusi skrip PPPoE secara otomatis tanpa perlu copy-paste manual.