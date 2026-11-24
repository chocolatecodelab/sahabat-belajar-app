---
name: user-style-guide
description: >-
  Panduan komprehensif mengenai Tone of Voice, Persona Kerja, Filosofi Produk, dan Alur Kerja (Workflow)
  khas Pengguna/Product Owner pada project Sahabat Belajar. Wajib dijadikan panduan standar oleh agen AI
  agar gaya komunikasi, pengambilan keputusan arsitektur, dan eksekusi tugas selaras 100% dengan preferensi pengguna.
---

# User Style Guide: Tone of Voice, Working Persona & Alur Kerja (Sahabat Belajar)

Dokumen ini merangkum DNA kerja, gaya komunikasi (*tone of voice*), filosofi pengambilan keputusan, dan alur kerja (*workflow*) dari Pengguna (**Product Owner / Lead Builder**) dalam memimpin dan mengembangkan proyek **Sahabat Belajar**.

Setiap agen AI yang bekerja pada proyek ini wajib memahami dan menyesuaikan ritme kerjanya dengan panduan di bawah ini.

---

## 1. PROFIL & KARAKTER KERJA PENGGUNA (THE ARCHETYPE)

Pengguna adalah tipe **Pragmatic Lean Product Builder & High-Standard Operator**. Karakteristik utamanya:

1. **Berorientasi Hasil Nyata (*Outcome-Driven*)**:
   - Tidak tertarik pada kecanggihan teknologi semu bila tidak menyelesaikan masalah operasional nyata di lapangan.
   - Mengutamakan alur kerja bisnis yang dapat langsung dipakai oleh pengguna akhir (siswa, orang tua, tutor, admin).
2. **Pragmatis & Anti-Overengineering (*Lean MVP Mindset*)**:
   - Memilih solusi paling ringkas, murah, dan mandiri sebelum beralih ke pihak ketiga berbayar yang rumit (contoh: memilih integrasi QRIS mandiri + upload struk bukti + verifikasi admin, daripada langsung menerapkan gateway berbayar seperti Midtrans/Xendit di fase awal).
3. **Mementingkan Bukti Visual (*Seeing is Believing*)**:
   - Tidak puas hanya dengan klaim teks *"fitur sudah selesai"*.
   - Selalu meminta pengujian interaktif langsung di browser (`/browser`) dan membutuhkan bukti tangkapan layar (*screenshot evidence*) sebelum menyetujui hasil kerja.
4. **Detail & Sadar Risiko (*Risk & Edge-Case Aware*)**:
   - Kritis menanyakan potensi kegagalan infrastruktur: persistensi upload file di lingkungan serverless, batas ukuran berkas, validasi format berkas, serta keamanan data.
5. **Obsesif terhadap Konsistensi Konteks & UI/UX**:
   - Sangat peka terhadap segmentasi pengguna (*persona isolation*): Siswa SD/SMP/SMA tidak boleh terpapar materi atau ujian CPNS / esai riset beasiswa.
   - Tidak mentolerir layout bertabrakan, tombol terpotong (*wrapping* yang salah), atau teks yang tumpang tindih pada grafik.

---

## 2. KARAKTER TONE OF VOICE PENGGUNA

### 2.1 Ciri Khas Bahasa Pengguna
* **Lugas, Singkat, dan Padat (*Terse & High-Density*)**:
  - Pengguna sering memberikan instruksi pendek namun berkekuatan eksekusi tinggi:
    > *"ya"*  
    > *"ya benar buatkan dan uji kembali"*  
    > *"uji fitur tersebut /browser"*  
    > *"push ke repo"*  
* **Tidak Suka Basa-Basi Teknis yang Berbelit-belit**:
  - Menolak penjelasan teoretis yang rumit. Lebih memilih ringkasan bahasa awam/manajerial yang mudah dipahami klien atau pengguna bisnis.
* **Format Favorit: Checklist Status dengan Indikator Visual**:
  - Menginginkan status pekerjaan disajikan dalam bentuk daftar periksa sederhana dengan kode emoji:
    - ✅ **Selesai / Terverifikasi**
    - 🟡 **Sedang Berjalan (On Progress)**
    - ⏳ **Belum Dikerjakan (Upcoming / Backlog)**
* **Pertanyaan Validasi yang Kritis & Tajam**:
  - Saat meninjau pekerjaan, pengguna selalu menguji keabsahan klaim agen:
    > *"berarti alurnya sudah sukses semua?"*  
    > *"Apakah fitur itu sudah diperbaiki atau diimprove?"*  
    > *"untuk upload file yang sudah aman, tidak bermasalah, seperti storage nya atau ukuran filenya atau formatnya?"*

---

## 3. GAYA KOMUNIKASI AGEN YANG DIHARAPKAN (RESPONSE PROTOCOL)

Saat merespons pengguna, agen AI WAJIB menerapkan standar komunikasi berikut:

1. **Buka dengan Konfirmasi Langsung**:
   - Jawab inti pertanyaan di paragraf pertama tanpa intro berputar-putar.
   - Contoh: *"Kedua fitur telah selesai dikembangkan, diuji secara interaktif di browser, dan lulus typecheck 0 error."*
2. **Gunakan Tabel & Poin Terstruktur**:
   - Sajikan perbandingan sebelum vs sesudah, daftar aspek penilaian, atau status fitur dalam tabel rapi.
3. **Sertakan Tautan Berkas & Bukti Screenshot**:
   - Selalu berikan tautan klik berkas dengan format `file:///...`.
   - Cantumkan referensi path screenshot hasil pengujian browser sebagai bukti konkret.
4. **Tutup dengan Keputusan Aksi Berikutnya**:
   - Berikan opsi langkah lanjutan yang jelas (misal: *"Apakah ingin langsung di-push ke remote repository atau lanjut ke modul berikutnya?"*).

---

## 4. ALUR KERJA STANDAR PENGGUNA (THE 6-STEP CYCLE)

Pengguna selalu mengarahkan pengembangan dalam siklus kerja berulang yang teratur:

```text
[1. Scoping Realistis] ──► [2. Pemilihan 1-2 Prioritas] ──► [3. Clean Code & Typecheck]
          ▲                                                           │
          │                                                           ▼
[6. Git Commit & Push] ◄── [5. Audit Edge-Case & Detil] ◄── [4. Live Browser Test (/browser)]
```

### Tahap 1: Scoping Kebutuhan Nyata (Real-world Scoping)
- Menghindari fitur yang *bloated*. Memfokuskan fungsionalitas pada apa yang benar-benar dibutuhkan oleh operasional bimbel Sahabat Belajar saat ini.

### Tahap 2: Pemilihan Prioritas Fokus (Focused Execution)
- Pengguna memilih 1 atau maksimal 2 item pekerjaan dari checklist roadmap untuk diselesaikan hingga tuntas dalam satu putaran kerja, bukan mengerjakannya setengah-setengah.

### Tahap 3: Implementasi Bersih & Patuh Standar (Adherence to Rules)
- Kode harus mematuhi token desain resmi di `DESIGN.md` (Navy `#09408C`, Sky `#9AC1E2`, Canvas `#F4F7FB`).
- Kode harus patuh pada aturan bisnis di `AGENTS.md` (BR-1 s.d. BR-7).
- Wajib lulus typecheck TypeScript (`npx tsc --noEmit`) tanpa error sebelum melangkah ke pengujian.

### Tahap 4: Pengujian Interaktif Browser (`/browser`)
- Agen wajib menjalankan dev server dan memvalidasi tampilan di browser menggunakan subagent browser.
- Menguji interaktivitas (klik tab, switcher profil, submit form, modal preview, validasi upload).
- Mengambil tangkapan layar (*screenshot*) di resolusi desktop dan mobile untuk membuktikan fungsi berjalan normal.

### Tahap 5: Audit Edge-Case & Penyempurnaan Visual
- Memeriksa ketahanan data: penyimpanan permanen (Supabase Storage Cloud), batasan ukuran file (5 MB), dan penanganan error.
- Menyempurnakan tipografi, padding grafik SVG, posisi passing grade, dan badge status agar layout tidak bertabrakan (*no overlap*).

### Tahap 6: Eksekusi Version Control & Pelaporan Singkat
- Membuat commit Git yang bersih dan modular (`feat`, `fix`).
- Memberikan laporan akhir ringkas berbasis checklist dan tabel.
- Melakukan `git push` ke remote repository saat pengguna menginstruksikan.

---

## 5. CHECKLIST VERIFIKASI SEBELUM MENYATAKAN SELESAI

Sebelum agen melaporkan bahwa suatu pekerjaan telah selesai kepada pengguna, pastikan 6 pertanyaan ini terjawab dengan "YA":

- [ ] Apakah fitur mematuhi batasan segmentasi siswa (K-12 vs CPNS vs S2/Beasiswa)?
- [ ] Apakah ada elemen UI yang bertumpuk (*overlapping*), terpotong, atau menabrak tombol navigasi?
- [ ] Apakah alur upload/penyimpanan berkas sudah persisten di Cloud Storage (bukan sekadar di disk lokal serverless yang sementara)?
- [ ] Apakah `npx tsc --noEmit` menghasilkan 0 error?
- [ ] Apakah fitur sudah diverifikasi secara langsung lewat browser (`/browser`) beserta bukti tangkapan layar?
- [ ] Apakah laporan yang disajikan ringkas, jelas, menggunakan checklist emoji, dan mudah dipahami user?

---

*Dengan mematuhi panduan ini, setiap interaksi dan hasil kerja akan selalu selaras dengan visi, gaya kerja, dan standar mutu tinggi dari Pengguna.*
