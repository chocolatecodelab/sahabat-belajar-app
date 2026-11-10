---
name: sahabat-belajar-ux-audit
description: >-
  Panduan dan protokol audit komprehensif untuk mencegah bug layout visual (tabrakan CSS/overlap),
  ketidaksesuaian persona/segmentasi siswa (K-12 vs CPNS vs S2/Beasiswa), serta inkonsistensi
  filtering dan data pada aplikasi Sahabat Belajar. Gunakan setiap kali meninjau atau mengembangkan UI/UX.
---

# Panduan & Protokol Audit UX, Persona & Best Practice (Sahabat Belajar)

Dokumen skill ini dirancang untuk mendeteksi dan mencegah masalah desain visual, tabrakan tata letak (overlap), ketidaksesuaian segmentasi peserta (*persona mismatch*), serta inkonsistensi data pada seluruh antarmuka aplikasi **Sahabat Belajar**.

---

## 1. PONDASI HIERARKI SEGMEN & PERSONA SISWA

Sahabat Belajar melayani 3 segmen audiens yang berbeda karakteristik dan tujuannya. DILARANG mencampuradukkan fitur, label, dan modul antar-segmen tanpa filter kontekstual.

| Segmen Siswa | Target Jenjang | Kebutuhan Utama | Fitur Utama yang Wajib Tampil | Fitur yang DILARANG / Harus Digard |
| :--- | :--- | :--- | :--- | :--- |
| **Bimbel K-12** | SD, SMP, SMA Kelas 10-12 | Materi kurikulum sekolah, PAS/PAT, persiapan UTBK-SNBT (TPS & Literasi). | • Tryout UTBK & Ujian Sekolah<br>• Bank Modul K-12 & Rumus Praktis | **DILARANG** menampilkan formulir Review Draf Beasiswa LPDP / Proposal Tesis S2. Hindari istilah "Simulasi CAT SKD". |
| **Persiapan CPNS & Kedinasan** | Alumni S1/D4/SMA (Job Seekers, Calon Praja) | Seleksi Kompetensi Dasar (SKD: TWK, TIU, TKP), passing grade BKN, trik 40 detik. | • Simulasi CAT SKD CPNS & BUMN<br>• Modul Rumus Cepat TIU & Intisari TWK | Hindari menyajikan materi kurikulum SD/SMP atau proposal riset tesis. |
| **Program Lanjutan & Riset** | Pemburu Beasiswa S2/S3, Mahasiswa Akhir | Esai LPDP/AAS, proposal riset tesis/disertasi, *motivation letter*, jurnal ilmiah. | • Review Draf Dokumen & Esai Beasiswa<br>• Telaah Naskah Ilmiah & Konsultasi Mentor | Hindari menyajikan materi dasar K-12. |

---

## 2. CHECKLIST AUDIT TAMPILAN & CSS (ANTI-COLLISION / NO-OVERLAP)

Saat mengaudit atau membuat komponen antarmuka, periksa 5 titik rawan tabrakan berikut:

### Rule 2.1 — Isolasi Baris Navigasi ("Kembali ke...")
* **Problem**: Tautan navigasi `← Kembali ke...` yang bertipe `inline-flex` ditaruh bersebelahan langsung dengan badge atau judul tanpa pemisah baris, menyebabkan tombol menabrak badge (seperti kasus tombol kembali menimpa badge layanan lanjutan).
* **Solusi Wajib**:
  ```tsx
  // ✅ BENAR: Bungkus tautan kembali ke dalam kontainer blok independen
  <div className="mb-3">
    <Link
      href="/portal"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6882] hover:text-[#09408C] transition-colors"
    >
      <ArrowLeft size={16} />
      <span>Kembali ke Portal Siswa</span>
    </Link>
  </div>
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
    <Sparkles size={13} />
    <span>Layanan Bimbingan Program Lanjutan</span>
  </div>
  ```

### Rule 2.2 — Anti-Konflik Display Class Tailwind
* **Problem**: Menggabungkan `inline-flex` dan `block` pada satu elemen (misal: `className="inline-flex ... block w-fit"`). Browser merender dengan prioritas tidak terduga dan memicu kalkulasi margin/float yang rusak.
* **Solusi Wajib**: Pilih salah satu: gunakan `inline-flex` atau `flex` atau `block`. Dilarang menumpuk class display yang bertolak belakang.

### Rule 2.3 — Flex Wrapping & Badge Truncation
* **Problem**: Badge status, tombol aksi, dan judul berada dalam flex container tanpa `flex-wrap` sehingga pada resolusi HP atau tablet, teks terpotong atau saling tumpang tindih.
* **Solusi Wajib**:
  - Gunakan `flex flex-col sm:flex-row sm:items-center justify-between gap-4`.
  - Tambahkan `shrink-0` pada tombol aksi atau badge penanda agar tidak terjepit oleh judul panjang.
  - Tambahkan `truncate` atau `line-clamp-1` pada judul yang dinamis.

### Rule 2.4 — Branding & Penamaan Dinamis (Bukan Hardcoded)
* **Problem**: Menggunakan label kaku seperti "Simulasi CAT Digital" pada lembar ujian atau hasil tryout, padahal ujian tersebut adalah Ujian PAS SMA atau Tryout UTBK.
* **Solusi Wajib**:
  ```tsx
  // ✅ BENAR: Berikan judul kontekstual sesuai kategori ujian
  const examTitleBadge =
    exam.category === "CPNS_BUMN" || exam.category === "KEDINASAN"
      ? "Simulasi CAT Digital BKN"
      : exam.category === "UTBK_SNBT"
      ? "Simulasi Tryout UTBK-SNBT"
      : exam.category === "K12"
      ? "Tryout & Evaluasi Kurikulum K-12"
      : "Ruang Ujian Digital Sahabat Belajar";
  ```

---

## 3. CHECKLIST AUDIT LOGIKA FITUR & SEGMENTASI (*CONTEXTUAL UX*)

### Rule 3.1 — Smart Highlight Cards Beranda Siswa
* Di Beranda Siswa (`StudentPortalClient`), kartu promosi/shortcut di bawah banner sambutan WAJIB beradaptasi dengan profil siswa:
  - **Siswa K-12**: Kartu 1 menampilkan **Tryout UTBK-SNBT & Ujian Sekolah**; Kartu 2 menampilkan **Bank Modul & Rumus K-12**.
  - **Peserta CPNS**: Kartu 1 menampilkan **Simulasi CAT SKD CPNS & BUMN**; Kartu 2 menampilkan **Modul Rumus Cepat TIU & TWK**.
  - **Peserta S2/Beasiswa**: Kartu 1 menampilkan **Review Draf Esai & Naskah Akademik**.

### Rule 3.2 — Filtering Otomatis pada Ruang Ujian & Bank Modul
* Siswa K-12 yang membuka Tab Ruang Ujian atau Bank Modul harus **langsung disuguhkan materi K-12/UTBK secara otomatis** (`RECOMMENDED_K12` atau filter `K12`), bukan dibiarkan mencari sendiri di tengah tumpukan soal CPNS atau modul kedinasan.
* Tab atau chip kategori milik jenjang siswa wajib ditempatkan di urutan pertama dengan penanda bintang (`★ Bimbel K-12 (Jenjang Anda)`).
* Opsi `"Semua Program"` atau `"Semua Paket Tryout"` tetap tersedia jika siswa ingin menjelajah secara mandiri.

### Rule 3.3 — Guard Akses Ramah (*Friendly Access Guard*)
* Bila halaman eksklusif (misal: `/portal/dokumen`) dibuka oleh siswa di luar program lanjutan (seperti siswa SMA):
  1. Tampilkan banner informasi edukatif yang ramah dan bersahabat.
  2. Ganti tombol formulir "Kirim Draf Baru" menjadi tombol konsultasi via WhatsApp ("Konsultasi Esai Lomba/PTN via WA") agar tidak ada salah kirim berkas ke antrean telaah tesis.

### Rule 3.4 — Sinkronisasi Multi-Profil / Sibling
* Saat orang tua/wali memiliki akun multi-anak:
  1. Label jenjang pada tombol pilih profil (misal: `Ahmad Fauzi (Kelas 12 SMA)`) harus 100% sinkron dengan data paket yang dimiliki anak tersebut.
  2. Berpindah profil anak harus secara instan memutakhirkan seluruh state beranda, filter tryout, modul, dan jadwal tanpa perlu refresh browser.

---

## 4. PROSEDUR VERIFIKASI (AUDIT RUNBOOK)

Setiap perubahan fitur atau antarmuka WAJIB melalui pengujian 4 tahap:
1. **Verifikasi Visual Desktop & Mobile**: Periksa halaman pada lebar layar 375px (HP), 768px (Tablet), dan 1280px (Desktop). Pastikan tidak ada teks yang saling menabrak atau terpotong.
2. **Pengujian Persona Berpindah**: Coba login atau alihkan profil antara Siswa K-12 dan Peserta CPNS. Pastikan kartu beranda, filter tryout, dan modul berganti sesuai jenjang masing-masing.
3. **Typecheck & Linter**: Jalankan `npx tsc --noEmit` dan pastikan hasil pemeriksaan 0 error.
4. **Git Commit Bersih**: Komit dengan pesan deskriptif berbasis konvensi conventional commits (misal: `fix(portal): contextual program filtering, K-12 guards, and header layout fix`).
