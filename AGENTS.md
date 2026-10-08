<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — KONTRAK KERJA & PANDUAN PENGEMBANGAN AI

Dokumen ini adalah **kontrak mutlak** bagi seluruh agen AI pengembang (AI Coding Agents) yang bekerja pada repositori **BIAS RISTEK**. Agen WAJIB mematuhi seluruh aturan dalam dokumen ini tanpa pengecualian.

---

## 1. HIERARKI SUMBER KEBENARAN (SINGLE SOURCE OF TRUTH)

Saat menerima instruksi atau memecahkan masalah, agen wajib merujuk pada hierarki dokumen berikut:

```text
1. AGENTS.md   → Kontrak perilaku, batasan teknis, anti-halusinasi, anti-AI-slop.
2. PRD.md      → Spesifikasi kebutuhan produk, arsitektur fungsional, urutan ketergantungan (#0–#9).
3. DESIGN.md   → Sistem desain visual, palet warna "Academic Innovation", tipografi, elevasi & token.
4. Kode Aktif  → Implementasi riil pada Prisma Schema, Server Actions, dan Komponen UI.
```

* **Jika ada keraguan mengenai alur fitur atau database**: Buka dan rujuk [PRD.md](file:///c:/laragon/www/bias-ristek-app/PRD.md).
* **Jika ada keraguan mengenai warna, font, layout, atau kartu**: Buka dan rujuk [DESIGN.md](file:///c:/laragon/www/bias-ristek-app/DESIGN.md).
* **Jika ada konflik antara asumsi agen dan dokumen**: Dokumen repositori SELALU MENANG atas pengetahuan bawaan (training data) agen.

---

## 2. PRINSIP UTAMA (CORE PRINCIPLES)

Urutan prioritas pengambilan keputusan:
1. **Kebenaran Fungsional (Correctness)**
2. **Kepatuhan terhadap PRD.md (Product Alignment)**
3. **Kepatuhan terhadap DESIGN.md (Design System Compliance)**
4. **Konvensi Kode Eksisting (Existing Project Patterns)**
5. **Dapat Dirawat & Skalabilitas (Maintainability)**
6. **Kesederhanaan (Simplicity & Minimal Change)**
7. **Polesan Visual (Visual Polish — Tanpa AI Slop)**

Jangan pernah mengorbankan fungsionalitas dan kebenaran data hanya demi membuat tampilan tampak "wah" atau terlalu dekoratif.

---

## 3. INTEGRASI KHUSUS DENGAN PRD.md (ROADMAP 10 TAHAP)

Setiap kode yang dibuat atau diubah WAJIB selaras dengan 10 tahap prioritas ketergantungan pada [PRD.md](file:///c:/laragon/www/bias-ristek-app/PRD.md):

* **Tahap #0 (Audit Stack & Alur Kerja)**:
  - JANGAN membuat ulang modul yang sudah ada. Periksa selalu folder `actions/`, `lib/`, dan `prisma/schema.prisma` sebelum menulis kode baru.
  - Modul yang **SUDAH ADA**: Sistem auth NextAuth v5, form pendaftaran (`actions/pendaftaran.ts`), LMS ruang belajar (`actions/belajar.ts`), verifikasi sertifikat 32 JP (`actions/sertifikat.ts`), dan omnichannel notifikasi (`lib/notifications.ts`).
* **Tahap #1 (Fondasi Data & n8n Engine)**:
  - Wajib memastikan nomor WhatsApp tersimpan dalam format standar internasional E.164 (`628xxx`).
  - Menjaga integritas metadata riset siswa (jenjang S1/S2/S3, software, topik) di tabel `CourseRegistration`.
  - Pemicu event pendaftaran wajib disalurkan via webhook n8n secara terstruktur.
* **Tahap #2 (Pembayaran QRIS / Payment Gateway + Webhook)**:
  - Endpoint webhook pembayaran (`/api/webhooks/payment`) wajib memverifikasi cryptographic signature (HMAC-SHA512) dan menerapkan *idempotency protection* (menolak eksekusi ganda).
  - Status transaksi yang sah adalah state machine: `PENDING_PAYMENT` → `VERIFIED` / `EXPIRED` / `CANCELLED`.
* **Tahap #3 (Otomasi Pasca-Pendaftaran & Notifikasi)**:
  - Seluruh pengiriman WhatsApp & Email WAJIB menggunakan modul terpusat di `lib/notifications.ts`.
  - Dilarang membuat fungsi kirim email/WA ad-hoc di komponen halaman.
* **Tahap #4 (Penjadwalan Tutor — Human in the Loop)**:
  - Format bimbingan privat BIAS RISTEK melibatkan tutor pakar.
  - **Prinsip Human in the Loop**: Sistem mencocokkan ketersediaan jadwal dan topik, namun jadwal HANYA sah jika tutor menyetujui via tautan konfirmasi WhatsApp (*Magic Confirmation Token*). Jangan pernah mengunci jadwal secara sepihak tanpa konfirmasi.
* **Tahap #5 (Akses LMS & Login Terpadu)**:
  - Aktivasi akun siswa (`role: Student`) dan hak akses kelas `/belajar/[slug]` terjadi otomatis begitu transaksi berstatus `VERIFIED`.
  - Gunakan Server Actions dan autentikasi NextAuth yang ada untuk memproteksi materi.
* **Tahap #6 (Rapor Bulanan & Sertifikat 32 JP)**:
  - Rapor bulanan mengagregasi evaluasi mentor per sesi menjadi dokumen PDF resmi.
  - E-Sertifikat wajib menyertakan alokasi **32 JP** dan kode QR unik yang tervalidasi di `/sertifikat/[code]`.
* **Tahap #7 (Bot AI CS & WhatsApp dengan Human Handoff)**:
  - Bot AI (Gemini) hanya menangani FAQ umum (harga, silabus, jadwal).
  - Jika pengguna meminta berbicara dengan staf atau menanyakan topik riset spesifik, bot WAJIB menghentikan auto-reply dan mengeskalasikan percakapan ke admin manusia (*Human Handoff*).
* **Tahap #8 (CMS Dinamis)**:
  - Konten kursus, profil tutor, testimoni, dan statistik counter harus bersumber dari basis data, bukan teks mati di JSX/HTML.
  - Gunakan `revalidatePath` agar pembaruan data langsung tampil di frontend.
* **Tahap #9 (Dashboard Analitik & Forecasting)**:
  - Visualisasi grafik harus berbasis data agregasi riil dari transaksi dan enrollment, dilarang menampilkan angka palsu/hardcoded di lingkungan produksi.

---

## 4. INTEGRASI KHUSUS DENGAN DESIGN.md (ACADEMIC INNOVATION)

Platform BIAS RISTEK mengusung identitas visual **"Academic Innovation"**: berwibawa, ilmiah, terpercaya, modern, dan bernuansa EdTech institusi riset bergengsi. Agen WAJIB mematuhi token yang didefinisikan di [DESIGN.md](file:///c:/laragon/www/bias-ristek-app/DESIGN.md):

### 4.1 Palet Warna Resmi
Gunakan semantic class atau token warna resmi proyek. JANGAN membuat warna hex acak:
* **Primary (Deep Research Blue)**: `#001847` (Simbol stabilitas, integritas ilmiah, otoritas riset).
  - Container / Dark Accent: `#0b2c6b`.
  - On-Primary: `#ffffff`.
* **Secondary (Scholastic Gold)**: `#fdbc13` / `#7a5900` (Simbol prestasi akademik, kelulusan, dan highlight konversi).
  - Digunakan untuk status chip *"Pendaftaran Dibuka"*, rating bintang, badge capaian jurnal Scopus, dan aksen metrik.
* **Tertiary / Error (Innovation Red)**: `#ba1a1a` (Untuk aksi destruktif, batas waktu kedaluwarsa, dan pesan error).
* **Background & Surface**:
  - Background Utama: Cool Off-White `#f8f9ff` (Mencegah kelelahan mata saat membaca naskah/modul panjang).
  - Surface Card: Pure White `#ffffff`.
  - Border Halus: `#e2e8f0` atau `#d5e3fc`.

### 4.2 Tipografi
* **Headlines & Display**: Wajib menggunakan **Plus Jakarta Sans** (bobot 600 atau 700, letter-spacing rapat `-0.02em`). Menghadirkan kesan modern, profesional, dan teknologi riset maju.
* **Body Text, Labels, Tables, Inputs**: Wajib menggunakan **Inter** (bobot 400 atau 500, line-height lega `1.6` untuk teks panjang, tracking `0.05em` untuk label uppercase).
* **DILARANG**: Memasukkan sembarang font baru (seperti Comic Sans, Roboto ad-hoc, dsb.) di luar font resmi sistem.

### 4.3 Bentuk, Spacing & Elevasi
* **Grid**: Desktop 12 kolom (max-width 1280px, gutter 24px, margin 64px). Mobile 4 kolom (margin 20px).
* **Border Radius**:
  - Tombol & Input: `8px` (`rounded` / `rounded-md`).
  - Kartu Program / Modul Belajar: `16px` (`rounded-lg` / `rounded-xl`).
  - Status Tag / Pill: `100px` (`rounded-full`).
* **Elevasi Bayangan (Tonal Shadows)**:
  - Level 1 (Kartu Default): `0px 4px 20px rgba(11, 44, 107, 0.05)` (Bayangan lembut bergradasi biru riset).
  - Level 2 (Hover / Interaksi): `0px 10px 30px rgba(11, 44, 107, 0.10)`.
* **Komponen Khusus**:
  - **Program Card**: Rasio header gambar 16:9, sudut atas membulat 16px, badge Scholastic Gold, tombol aksi Deep Research Blue.
  - **Stat Counter**: Angka `display-md` Deep Research Blue dengan bar vertikal aksen Scholastic Gold di sisi kiri.

---

## 5. ATURAN ANTI-HALUSINASI (STRICT ANTI-HALLUCINATION)

Agen DILARANG KERAS mengarang/menciptakan:
1. Endpoint API fiktif yang tidak ada di rute Next.js.
2. Kolom atau relasi database yang tidak terdaftar di `prisma/schema.prisma` atau `PRD.md`.
3. Variabel lingkungan (`process.env`) baru tanpa mencatatkannya di `.env.example` dan mendiskusikannya.
4. Paket npm baru jika pustaka yang terpasang sudah mampu menyelesaikannya.
5. Jalur file atau komponen palsu.
6. Peran pengguna di luar matriks RBAC: `Super Admin`, `Admin`, `Editor`, `Tutor`, `Student`.

> **Aturan Wajib**: Jika Anda tidak yakin tentang tipe data atau nama kolom, buka dan periksa filenya langsung menggunakan `view_file` atau `grep_search`. JANGAN PERNAH MENEBAK.

---

## 6. ATURAN ANTI-AI-SLOP (STRICT ANTI-AI-SLOP UI)

UI BIAS RISTEK adalah platform akademik bergengsi, **BUKAN** template landing page SaaS generik buatan AI.

### DILARANG KERAS MENGGUNAKAN:
- Gradien ungu-biru mengkilap yang klise (*generic purple/indigo AI gradients*).
- Efek *glassmorphism* tembus pandang berlebihan yang mengorbankan keterbacaan teks ilmiah.
- Sudut membulat ekstrem yang membuat form terlihat seperti mainan (*overly bubbly UI*).
- Blob dekoratif melayang tanpa fungsi komunikasi data.
- Kartu kosong yang diulang-ulang tanpa tujuan hierarki informasi.
- Animasi hover liar yang memusingkan pengguna.
- Placeholder pura-pura yang disajikan seolah-olah data nyata (*fake testimonials / fake statistics*).

### ATURAN PENGGUNAAN IKON & EMOJI:
- **DILARANG MENGGUNAKAN EMOJI SEBAGAI IKON UI** (Kecuali teks chat informal).
  - ❌ DILARANG: `<button>✨ Buat Naskah AI</button>`, `<h2>🚀 Mulai Riset</h2>`, `<span>🔥 Terpopuler</span>`.
  - ✅ BENAR: Gunakan pustaka ikon resmi proyek: **Lucide Icons** (contoh: `<Sparkles className="w-4 h-4 text-secondary" />`, `<GraduationCap />`, `<FileText />`).
- Setiap ikon harus memiliki makna semantik fungsional, bukan hiasan acak.

---

## 7. ATURAN KODE NEXT.JS 16 & REACT 19

Repositori ini menggunakan arsitektur mutakhir: **Next.js 16 (App Router)** dan **React 19**:

1. **Server Components vs Client Components**:
   - Jadikan komponen sebagai **Server Component** secara default untuk performa maksimal dan efisiensi SEO.
   - Tambahkan directive `"use client"` HANYA jika komponen membutuhkan interaktivitas browser (state `useState`, `useEffect`, event handler klik, atau integrasi form library).
2. **Server Actions**:
   - Seluruh mutasi data wajib ditempatkan di direktori `actions/` dengan deklarasi `"use server"`.
   - Gunakan `revalidatePath` untuk memperbarui cache halaman setelah mutasi berhasil.
   - Konfigurasi ukuran payload body Server Actions telah diatur hingga 10MB di `next.config.ts` (untuk file dokumen riset & media).
3. **Penanganan Form & Async**:
   - Tangani error dengan elegan menggunakan blok `try...catch` dan kembalikan struktur standar `ActionResponse<{ ... }>`:
     ```typescript
     export type ActionResponse<T = any> = {
       success: boolean;
       message: string;
       data?: T;
       errors?: Record<string, string[]>;
     };
     ```
   - Dilarang membiarkan error 500 mentah bocor ke antarmuka pengguna.
4. **Hydration Error Prevention**:
   - Jangan merender nilai yang berbeda antara Server dan Client (misal `Date.now()`, `Math.random()`, atau data browser `window.localStorage` saat SSR).
   - Pastikan hierarki tag HTML valid (contoh: jangan memasukkan `<div>` di dalam `<p>`).

---

## 8. ATURAN DATABASE & PRISMA ORM

1. **Kepatuhan Skema**:
   - Sebelum memodifikasi model Prisma, periksa dampaknya terhadap tabel relasional di `prisma/schema.prisma` dan Supabase SQL.
   - Skema baru wajib mencakup indeks pada foreign keys dan kolom pencarian status.
2. **Penamaan Konsisten**:
   - Model Prisma menggunakan format PascalCase (contoh: `TutorProfile`, `MentorshipBooking`).
   - Field database menggunakan camelCase (contoh: `invoiceNumber`, `researchTopic`, `totalAmount`).
   - Enum menggunakan UPPER_SNAKE_CASE (contoh: `PENDING_PAYMENT`, `VERIFIED`, `CONFIRMED`).
3. **Integritas Transaksi**:
   - Operasi yang melibatkan multi-tabel (misal: verifikasi pembayaran yang memicu pembuatan akun user dan pembuatan enrollment) wajib dibungkus dalam transaksi database atau pemeriksaan dependensi yang atomic.

---

## 9. PRINSIP PERUBAHAN MINIMAL (MINIMAL CHANGE PRINCIPLE)

* Selesaikan tugas dengan perubahan kode terkecil yang benar dan tepat sasaran.
* DILARANG melakukan refactoring pada file yang tidak berkaitan dengan instruksi pengguna.
* DILARANG mengganti dependensi atau konfigurasi inti sistem tanpa izin eksplisit.
* Prioritaskan penggunaan ulang komponen yang sudah ada:
  ```text
  Komponen Eksisting di components/
          ↓
  Varian Komponen Baru pada file yang sama
          ↓
  Utilitas Tambahan di lib/
          ↓
  Komponen Baru (Hanya jika benar-benar belum ada padanannya)
  ```

---

## 10. PROTOKOL SELESAI TUGAS & VERIFIKASI (VERIFICATION & SUMMARY)

Sebelum menyatakan bahwa pekerjaan Anda selesai, lakukan verifikasi mandiri:
1. Jalankan pemeriksaan linter / typecheck jika relevan.
2. Pastikan file tersimpan dengan benar dan bebas dari syntax error.
3. Berikan laporan penutup yang jujur dan transparan:
   - **File yang Diubah**: Daftar file yang benar-benar dimodifikasi.
   - **Status Verifikasi**: Apa yang sudah diverifikasi dan apa yang belum dapat diuji (misal: butuh API key live).
   - **Kesesuaian dengan Dokumen**: Tautan ke klausul [PRD.md](file:///c:/laragon/www/bias-ristek-app/PRD.md) dan [DESIGN.md](file:///c:/laragon/www/bias-ristek-app/DESIGN.md) yang terpenuhi.

> **Pesan Pamungkas**: Repositori BIAS RISTEK adalah aset institusi akademik riset yang bernilai tinggi. Bekerjalah dengan presisi ilmuwan, disiplin arsitektur perangkat lunak, dan estetika desain kelas dunia.
