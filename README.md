# UPAZNET GPON Config Generator

**UPAZNET GPON Config Generator** adalah sebuah aplikasi web (Helpdesk Tool) yang dirancang untuk mempermudah dan mempercepat tugas tim teknisi dalam membuat script (CLI) konfigurasi aktivasi OLT (Optical Line Terminal) ZTE/GPON untuk pelanggan. 

Aplikasi ini men-generate script yang siap di-copy-paste langsung ke terminal OLT berdasarkan parameter-parameter pelanggan.

---

## Fitur Utama
- **Multi-Tipe Konfigurasi**: Mendukung berbagai jenis/area konfigurasi GPON khusus jaringan UPAZNET:
  - **UNR C600** (Pelanggan Biasa)
  - **UHO**
  - **UBL**
  - **UGR**
  - **UNB** (Mendukung mode Standard PPPoE dan Bridge Mode dengan mapping khusus untuk V100, V1600, V1501, dll)
- **Auto-Fill Data**: Memudahkan pengisian form (misal: otomatis menyalin ID Pelanggan sebagai `PPPoE User` dan memiliki default password standar).
- **One-Click Copy**: Tombol praktis untuk langsung menyalin hasil script lengkap ke *clipboard*.
- **UI Responsif & Cepat**: Antarmuka modern, minim delay, dan responsif.

## Teknologi yang Digunakan
- **[Next.js](https://nextjs.org/)** (v16+) - React Framework
- **[React](https://react.dev/)**
- **[Tailwind CSS](https://tailwindcss.com/)** (+ Autoprefixer & PostCSS) - Utility-first styling
- **[Lucide React](https://lucide.dev/)** - Icon pack

## Cara Menjalankan Project (Local Development)

Ikuti langkah-langkah berikut untuk menjalankan aplikasi ini di komputer lokal Anda:

1. **Clone repositori ini:**
   ```bash
   git clone <url-repo-anda>
   cd config-generator-upaznet
   ```

2. **Install semua dependensi:**
   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. **Jalankan local development server:**
   ```bash
   npm run dev
   # atau
   yarn dev
   # atau
   pnpm dev
   ```

4. **Buka di Browser:**
   Buka [http://localhost:3000](http://localhost:3000) untuk melihat dan menggunakan aplikasi Generator Config. File utama aplikasi berada di dalam folder `src/app/page.js` dan logic generator berada di `src/lib/generator.js`.

## Struktur Folder Utama
- `/src/app/page.js`: Halaman antarmuka pengguna utama (Form & Output).
- `/src/lib/generator.js`: Core logic untuk berbagai script command OLT.
- `/public`: Aset publik.

---
*Dibuat untuk Tim Helpdesk & NOC UPAZNET*
