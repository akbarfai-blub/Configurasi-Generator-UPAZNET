Instruksi ini berlaku untuk seluruh repository Upaznet Config & Command Generator, kecuali ada instruksi yang lebih spesifik pada direktori terkait. Ikuti hierarki instruksi platform dan arahan eksplisit pengguna dalam sesi.

## 1. Tujuan project

Project ini membantu Helpdesk/NOC menghasilkan skrip konfigurasi OLT ZTE dan MikroTik serta menyalin perintah troubleshooting.

Prioritas:
1. Ketepatan konfigurasi dan target perangkat.
2. Menjaga perilaku existing yang sudah disepakati.
3. Kemudahan penggunaan operator.
4. Pemeliharaan kode yang sederhana.

Jangan mengklaim skrip berhasil di perangkat hanya berdasarkan lint, build, atau pengujian string.

## 2. Peran dan batas task

**Project Manager / Reviewer**
- Menetapkan scope, Acceptance Criteria, dependensi, dan risiko.
- Mengidentifikasi informasi yang belum tersedia.
- Mereview hasil eksekutor berdasarkan bukti dan perubahan yang relevan.
- Tidak mengubah kode dalam tugas review kecuali pengguna meminta perbaikan.

**Eksekutor**
- Mengimplementasikan scope yang disepakati.
- Menjaga perubahan pengguna dan perilaku existing.
- Melakukan verifikasi yang sebanding dengan risiko.
- Menyerahkan laporan dan bukti yang dapat ditinjau.

Jangan membuat sub-agent, delegasi, atau audit tambahan secara default. Gunakan hanya jika diminta pengguna.

## 3. Sumber kebenaran dan keputusan

- Gunakan instruksi task untuk menentukan perubahan yang diminta.
- Gunakan referensi CLI yang dikonfirmasi untuk menentukan konfigurasi perangkat.
- Gunakan implementasi existing sebagai baseline perilaku yang harus dijaga.
- Gunakan PRD, dokumen produk, dan dokumen desain untuk memahami kebutuhan serta konvensi project.
- Jika sumber bertentangan, jelaskan konflik dan dampaknya. Jangan diam-diam memilih salah satu atau mengubah dokumen agar membenarkan implementasi.
- Jangan mengarang VLAN, profile, port Ethernet, sintaks vendor, kredensial, atau keputusan bisnis.
- Ajukan pertanyaan hanya untuk ambiguitas yang memengaruhi ketepatan, scope, atau tindakan eksternal. Selesaikan keputusan implementasi rutin secara mandiri.

## 4. Disiplin perubahan

- Periksa kondisi awal working tree dan identifikasi perubahan milik task.
- Jangan menimpa, menghapus, atau memasukkan perubahan pengguna ke klaim hasil pekerjaan.
- Batasi diff pada kebutuhan task; hindari format ulang massal dan refactor yang tidak diperlukan.
- Pertahankan pilihan, identifier, default, serta output existing kecuali perubahan diminta.
- Ikuti struktur komponen, hooks, generator, dan token desain yang sudah ada.
- Jangan menambah dependency tanpa kebutuhan yang jelas.
- Catat temuan di luar scope sebagai saran terpisah.
- Commit, push, deploy, dan akses perubahan pada perangkat jaringan memerlukan otorisasi pengguna dalam sesi; jangan meminta ulang jika sudah diberikan.

## 5. Aturan khusus generator jaringan

- Model OLT harus ditentukan secara eksplisit; nama tab tidak cukup.
- Jangan menganggap konversi C300/C320 ke C600 cukup dengan penggantian prefix.
- Verifikasi VLAN, interface, vport, service-port, WAN, bridge, profile, dan port Ethernet terhadap acuan yang relevan.
- Bedakan ID pelanggan, PPPoE username, nama ONU, dan description. Jangan mengubah hubungan antarfield tanpa kontrak yang jelas.
- Jaga konsistensi akun antara output OLT dan MikroTik sesuai aturan template.
- Jangan menambahkan perintah reboot, restore, penghapusan, atau perubahan layanan di luar kebutuhan yang disetujui.
- Gunakan data sintetis untuk fixture, screenshot, dan laporan. Jangan membocorkan kredensial nyata.
- Jangan menambahkan secret ke source code, log, fixture, atau variabel publik client.
- Pisahkan klaim “sesuai referensi CLI”, “lulus pengujian lokal”, dan “terverifikasi pada perangkat”.

## 6. Kebijakan review — berbasis risiko dan hemat token

Kebijakan ini berlaku ketika agent mereview hasil eksekutor. Tujuannya memastikan Acceptance Criteria terpenuhi tanpa mengulang pekerjaan eksekutor.

### Penentuan risiko

Tentukan tier berdasarkan perilaku yang berubah, bukan nama file. Terapkan kedalaman review per bagian jika satu task mencakup beberapa tier.

**Risiko rendah**
UI/styling, layout, copy, token desain, dan sinkronisasi dokumentasi tanpa perubahan perilaku.

Baca ringkasan eksekutor, diff stat, dan diff relevan. Untuk perubahan visual, periksa screenshot terkait AC. Jangan membaca file penuh atau menjelajahi codebase tanpa indikasi masalah.

**Risiko menengah**
Business logic nonkritis, transformasi data, dan validasi form nonkeamanan.

Review diff dan cocokkan dengan AC. Baca konteks tambahan hanya untuk memahami pemanggil, kontrak, atau dampaknya. Fokus pada ketepatan perilaku, bukan preferensi gaya kode.

**Risiko tinggi**
- Perubahan semantik skrip jaringan yang memengaruhi target perangkat, VLAN, layanan, kredensial, atau perintah operasional.
- Auth, otorisasi, secret, akses database/RLS, transaksi/klaim, idempotensi pengiriman, dan migrasi schema jika fitur tersebut ada.
- Perubahan terkait keputusan berisiko tinggi yang terdokumentasi; rujukan seperti D66/D70 hanya berlaku jika memang ada dan relevan di project ini.

Baca penuh file terkait yang diperlukan untuk menilai perubahan serta batas kepercayaannya. Wajib ada bukti pengujian eksplisit sebelum menyetujui Done. Tidak perlu membaca seluruh codebase.

### Batas scope review

- Identifikasi perubahan milik task. Jangan menganggap seluruh working tree atau staging sebagai hasil task.
- Gunakan konteks review sebelumnya; jangan membaca ulang file tanpa alasan baru.
- Perluas pemeriksaan hanya jika ada ketidaksesuaian, perubahan di luar scope, bukti bertentangan, atau risiko tambahan. Jelaskan alasan perluasan secara singkat.
- Jangan menjalankan sub-agent atau audit tambahan tanpa permintaan pengguna.
- Jangan mengubah kode jika tugasnya hanya review.

### Kebijakan pengujian saat review

- Jangan menjalankan ulang test, lint, build, integrasi database, atau pengujian browser kecuali pengguna secara eksplisit meminta verifikasi independen.
- Utamakan bukti eksekutor: perintah, hasil/exit code, jumlah passed/failed/skipped bila relevan, assertion kunci, dan versi kode yang diuji.
- Pastikan bukti menutup AC dan sesuai dengan perubahan terakhir.
- Screenshot tidak membuktikan seluruh perilaku; build lulus tidak membuktikan aturan bisnis atau sintaks perangkat benar.
- Untuk dokumentasi saja, diff, rujukan, dan konsistensi klaim dapat menjadi bukti yang cukup.
- Jika bukti kurang, minta tambahan yang spesifik. Jangan meminta pengulangan seluruh suite tanpa alasan.

### Status dan pelaporan review

- Setujui Done hanya jika AC relevan memiliki bukti konkret.
- Jika implementasi atau bukti penting belum lengkap, rekomendasikan In Progress dan sebutkan kekurangannya secara spesifik.
- Catatan kosmetik yang tidak melanggar AC tidak otomatis menghalangi Done.
- Bedakan temuan implementasi, kekurangan bukti, dan saran opsional.
- Nyatakan metode review dengan jujur: pemeriksaan diff/dokumen/bukti eksekutor atau verifikasi independen jika benar-benar dilakukan.
- Jangan membuka ulang bagian yang sudah diterima tanpa perubahan atau bukti baru.

## 7. Verifikasi oleh eksekutor

Kebijakan untuk tidak mengulang pengujian saat review tidak menghapus kewajiban eksekutor melakukan verifikasi.

- Pilih pengujian berdasarkan perubahan dan risiko.
- Untuk perubahan template jaringan, gunakan acuan CLI yang disepakati, assertion terhadap perilaku penting, serta regresi pada jalur existing yang terdampak.
- Jangan membuat expected output dari implementasi yang sedang diuji.
- Perubahan kosmetik atau dokumentasi tidak memerlukan test baru yang hanya mencerminkan implementasi.
- Jika kode berubah setelah diuji, perbarui bukti untuk bagian yang terdampak.
- Setelah bukti mencukupi, hentikan pengujian tambahan yang tidak menyelesaikan risiko konkret.

## 8. Format laporan eksekutor

Laporkan secara ringkas:
1. Perubahan dan file milik task.
2. Status Acceptance Criteria beserta bukti.
3. Pengujian: perintah, hasil, dan versi kode yang diuji.
4. Batas verifikasi atau blocker.
5. Temuan di luar scope, jika ada.

Jangan mengklaim pekerjaan selesai jika masih ada AC penting yang belum diimplementasikan atau belum memiliki bukti.