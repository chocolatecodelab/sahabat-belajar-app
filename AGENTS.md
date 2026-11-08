<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — KONTRAK KERJA & PANDUAN PENGEMBANGAN AI (SAHABAT BELAJAR)

Dokumen ini adalah **kontrak mutlak** bagi seluruh agen AI pengembang (AI Coding Agents) yang bekerja pada repositori **Sahabat Belajar** (`sahabat-belajar-app`). Agen WAJIB mematuhi seluruh aturan dalam dokumen ini tanpa pengecualian.

---

## 1. HIERARKI SUMBER KEBENARAN (SINGLE SOURCE OF TRUTH)

Saat menerima instruksi atau memecahkan masalah, agen wajib merujuk pada hierarki dokumen berikut:

```text
1. AGENTS.md   → Kontrak perilaku, batasan teknis, aturan bisnis BR-1 s.d. BR-10, anti-halusinasi.
2. PRD.md      → Spesifikasi kebutuhan produk Sistem Digital Sahabat Belajar (Fase 1 MVP Operasional).
3. DESIGN.md   → Panduan sistem desain "Bersahabat, Rapi, Fokus", token warna resmi, tipografi, komponen.
4. Kode Aktif  → Implementasi riil pada Prisma Schema, Server Actions, dan Komponen UI.
```

* **Jika ada keraguan mengenai alur fitur atau database**: Buka dan rujuk [PRD.md](file:///d:/KERJAAN/CODING/COMBO/sahabat-belajar-app/PRD.md).
* **Jika ada keraguan mengenai warna, font, layout, atau kartu**: Buka dan rujuk [DESIGN.md](file:///d:/KERJAAN/CODING/COMBO/sahabat-belajar-app/DESIGN.md).
* **Jika ada konflik antara asumsi agen dan dokumen**: Dokumen repositori SELALU MENANG atas pengetahuan bawaan (training data) agen.

---

## 2. PRINSIP UTAMA & IDENTITAS BRAND

Platform Sahabat Belajar mengusung nilai: **Bersahabat, Rapi, dan Fokus**.
- **Nama Brand:** Sahabat Belajar (Sub-nama: Bimbingan Belajar)
- **Tagline:** *"Comprehensive Academic Solution"* dan *"Paham Konsep Dasar hingga Siap Berprestasi"*
- **Tagar:** `#BersamaSahabat`
- **Layanan Inti:** Bimbingan belajar privat (1-on-1) dan semi-privat (2-5 siswa), online (Zoom/Meet) & home visit.
- **Segmen:** K-12 (SD/SMP/SMA) dan Program Lanjutan (CPNS/BUMN/PPPK, S2/S3 & Beasiswa, TOEFL/IELTS, Kepenulisan Ilmiah).

Urutan prioritas pengambilan keputusan:
1. **Kebenaran Fungsional (Correctness)**
2. **Kepatuhan terhadap PRD.md (Fokus Jalur A: MVP Operasional)**
3. **Kepatuhan terhadap DESIGN.md (Design Tokens & Komponen Sahabat Belajar)**
4. **Penggunaan Ulang Template yang Ada (Reuse Existing Architecture)**
5. **Dapat Dirawat & Skalabilitas (Maintainability)**
6. **Kesederhanaan (Simplicity & Minimal Change)**

---

## 3. ATURAN BISNIS MUTLAK (BUSINESS RULES)

Setiap kode yang dibuat atau diubah WAJIB mematuhi aturan bisnis dari PRD Bagian 8:
* **BR-1 (Pengurangan Kuota)**: Kuota berkurang tepat 1 saat sesi ditandai **TERLAKSANA**, bukan saat dijadwalkan.
* **BR-2 (Deteksi Bentrok Jadwal)**: Sesi ditolak bila tutor atau siswa memiliki sesi yang beririsan waktu pada hari dan jam yang sama.
* **BR-3 (Batas Semi-Privat)**: Kelas semi-privat maksimal 5 peserta; peserta ke-6 wajib ditolak. Kuota tiap peserta dihitung sendiri.
* **BR-4 (Masa Berlaku & Batas Kuota)**: Paket berbasis waktu berakhir pada tanggal akhir; paket berbasis kuota habis saat `quota_used >= quota_total`. Peringatan kuota hampir habis muncul jika sisa $\le 2$ sesi atau 7 hari tersisa.
* **BR-5 (Durasi Sesi)**: Durasi default per sesi adalah **90 menit**.
* **BR-6 (Honor Tutor)**: Honor tutor dihitung dari akumulasi sesi terlaksana dikalikan tarif per sesi tutor pada periode bersangkutan.
* **BR-7 (Privasi Tarif Honor)**: Tarif honor tutor hanya boleh dilihat oleh peran `Admin` dan `Tutor` yang bersangkutan. Staf tidak melihat tarif honor.

---

## 4. SISTEM DESAIN RESMI (DESIGN TOKENS)

Agen WAJIB mematuhi token yang didefinisikan di [DESIGN.md](file:///d:/KERJAAN/CODING/COMBO/sahabat-belajar-app/DESIGN.md):

### 4.1 Palet Warna Resmi
DILARANG membuat warna hex acak:
* **Primary (Navy)**:
  - `--sb-navy-700`: `#09408C` (Warna utama: tombol utama, judul, item aktif)
  - `--sb-navy-800`: `#0E3571` (Hover tombol utama, latar gelap)
  - `--sb-navy-900`: `#0A2650` (Teks sangat gelap di atas latar terang)
* **Secondary & Aksen**:
  - `--sb-blue-600`: `#295897` (Judul sekunder, link)
  - `--sb-sky-300`: `#9AC1E2` (Latar ikon, aksen kartu)
  - `--sb-cyan-500`: `#0CC0DF` (Aksen penanda Fase 2 / grafik)
* **Background & Surface**:
  - `--sb-canvas`: `#F4F7FB` (Latar belakang halaman panel & body)
  - `--sb-surface`: `#FFFFFF` (Kartu, tabel, modal)
  - `--sb-blue-50`: `#EAF1FA` (Latar kartu tertarik, baris hover)
  - `--sb-line`: `#D5DDEB` (Garis pembatas, border input)
* **Tipografi & Teks**:
  - `--sb-ink`: `#1B2A41` (Teks utama)
  - `--sb-muted`: `#5B6882` (Teks sekunder / muted)
* **Feedback & Status**:
  - Sukses: `--sb-success-600` `#1F6F4A` (Latar `#E3F4EC`)
  - Peringatan: `--sb-warning-500` `#F5B82E` (Teks tetap `#1B2A41`)
  - Bahaya/Error: `--sb-danger-600` `#B4381F` (Latar `#FBE9E5`)

### 4.2 Tipografi
* **Display & Headings**: Wajib menggunakan **Poppins** (bobot 600 atau 700).
* **Body, Labels, Tables, Inputs**: Wajib menggunakan **DM Sans** (bobot 400, 500, atau 700). Angka di tabel memakai `tabular-nums`.

### 4.3 Bentuk & Radius
* Input kecil & chip: `8px` (`rounded-lg`)
* Tombol & input umum: `12px` (`rounded-xl`)
* Kartu: `16px` (`rounded-2xl`)
* Panel besar / hero: `24px` (`rounded-3xl`)
* Status tag & pil aktif: `999px` (`rounded-full`)

### 4.4 Motif Visual yang Berulang
1. Kelompok tiga titik bulat navy (●●●).
2. Foto dalam bingkai lingkaran dengan bingkai tebal navy.
3. Bentuk lengkung abu lembut di sudut.
4. Chip status selalu: **Teks + Ikon Kecil + Latar Pastel**.

---

## 5. MATRIKS PERAN PENGGUNA (RBAC)

Peran pengguna yang sah di Sahabat Belajar:
- `Admin`: Akses penuh ke seluruh data master, penjadwalan, pembayaran, honor tutor, dan pengaturan.
- `Staf`: Mengelola pendaftaran/lead, siswa, jadwal, dan pembayaran (tanpa akses ke tarif honor tutor).
- `Tutor`: Melihat jadwal mengajar miliknya, mengisi absensi dan jurnal sesi, melihat rekap honor miliknya.
- `Siswa`: Melihat jadwal bimbingan, sisa kuota, dan nilai/perkembangan.
- `Orang tua`: Memantau jadwal, sisa kuota, dan perkembangan anak.

---

## 6. ATURAN KODE NEXT.JS 16 & REACT 19

1. **Komponen Server vs Client**:
   - Komponen default adalah **Server Component**.
   - Tambahkan `"use client"` HANYA jika membutuhkan interaktivitas (state `useState`, event handler, dsb.).
2. **Server Actions**:
   - Tempatkan mutasi data di direktori `actions/` dengan deklarasi `"use server"`.
   - Gunakan `revalidatePath` untuk memperbarui cache halaman setelah mutasi berhasil.
   - Kembalikan response terstruktur `ActionResponse<T>`.

---

## 7. PROTOKOL MINIMAL CHANGE & REUSE TEMPLATE

* Pertahankan infrastruktur Next.js 16, Prisma ORM, NextAuth v5, Lucide Icons, Media Library, dan shell admin yang sudah ada.
* Gantikan logika dan halaman domain BIAS RISTEK dengan domain Sahabat Belajar secara bertahap dan rapi.
* Pastikan typecheck `tsc` dan linter lulus sebelum pekerjaan dinyatakan selesai.
