# Design: Sistem Digital Sahabat Belajar

**Versi:** 0.1 (draft untuk diskusi)
**Tanggal:** 8 November 2026
**Pasangan dokumen:** `PRD.md` (kebutuhan dan fase)
**Sumber:** company profile Sahabat Belajar (PDF versi 2) dan satu gambar referensi dashboard (Travenly)

> Warna yang berasal dari company profile ditandai **[brand]**. Warna dan ukuran yang saya turunkan sendiri ditandai **[usulan]** dan perlu disetujui klien.

---

## 1. Tujuan dan Prinsip

Antarmuka harus terasa seperti nama brand-nya: **bersahabat, rapi, dan fokus**. Pengguna utamanya bukan orang teknis (admin bimbel, tutor, orang tua), jadi desain mengutamakan kejelasan dibanding kecanggihan.

| Prinsip | Artinya dalam desain |
|---|---|
| **Bersahabat** | Sapaan hangat, sudut membulat, warna lembut, bahasa sehari-hari |
| **Jelas dulu** | Satu tindakan utama per layar, label teks selalu menyertai ikon dan warna |
| **Cepat dipakai** | Admin menyelesaikan tugas harian (jadwal, absensi, pembayaran) dalam sedikit klik |
| **Tenang saat ujian** | Layar tryout minim gangguan; timer dan navigasi soal selalu terlihat |
| **Satu keluarga** | Website publik, panel admin, dan portal memakai token dan komponen yang sama |

## 2. Referensi Visual

Gambar referensi adalah dashboard Travenly. Yang diambil adalah **struktur dan rasa**, bukan warna hijau atau gambar gunungnya.

| Elemen di referensi | Diterapkan di Sahabat Belajar |
|---|---|
| Sidebar kiri dengan logo, menu berikon, item aktif berupa pil terisi | Sidebar admin; item aktif pil biru navy |
| Sapaan "Hello, nama!" + kolom pencarian + tombol filter | Sapaan "Halo, nama!" + pencarian global + filter di topbar |
| Tab kecil (Popular, Recommended, Near Me) | Tab ringkasan: Hari ini, Minggu ini, Bulan ini |
| Kartu berfoto dengan tombol hati | Kartu ringkasan angka (siswa aktif, sesi hari ini, kuota hampir habis, lead baru) |
| Strip tanggal "Event Dates" dengan tanggal terpilih berbentuk pil | Strip tanggal untuk memilih hari di halaman Jadwal dan dashboard |
| Daftar kartu kecil dengan tombol aksi bulat | Daftar sesi hari ini dengan tombol aksi (absensi, ubah) |
| Panel kanan: avatar bulat, nama, "Destination Trip" | Panel kanan: profil pengguna + daftar "Perlu Tindakan" (kuota hampir habis, pembayaran tertunda) |
| Sudut sangat membulat, bayangan lembut, latar kartu putih | Sama; radius 16-24 px |
| Lencana kecil di ikon notifikasi dan menu pesan | Lencana angka di lonceng dan menu |

Hal yang **tidak** diambil: warna hijau, latar ilustrasi gunung, kartu promo di sidebar (tidak relevan untuk alat operasional).

## 3. Identitas Brand (dari company profile)

- **Nama:** Sahabat Belajar. **Sub-nama logo:** Bimbingan Belajar.
- **Tagline:** "Comprehensive Academic Solution" dan "Paham Konsep Dasar hingga Siap Berprestasi". **Tagar:** #BersamaSahabat.
- **Logo:** dua anak membaca buku dengan topi toga, huruf miring biru bertulis tangan. Dalam PDF logo hanya tersedia sebagai gambar; **minta file vektor (SVG/AI) dari klien**.
- **Tipografi di profil:** Poppins Bold untuk judul, DM Sans (Regular, Bold, Italic) untuk isi. Ini terbaca dari font yang tertanam di PDF.
- **Warna dominan:** biru navy untuk judul dan elemen penting, putih/abu sangat muda untuk latar, abu lembut untuk bentuk lengkung dekoratif.
- **Motif visual yang berulang:**
  1. Kelompok tiga titik bulat navy (●●●).
  2. Foto dalam bingkai lingkaran dengan bingkai tebal navy.
  3. Bentuk lengkung abu di sudut bawah.
  4. Kotak dengan ujung membulat besar (pil).
  5. Navigasi teks: Home, About Us, Programs, Contact, dengan garis tipis di bawahnya.

Motif ini dipakai di **website publik** (banyak) dan **panel admin** (sedikit, sebagai aksen), agar panel tetap bersih.

## 4. Design Tokens

Semua nilai dibuat sebagai variabel agar mudah dipasang di template admin yang sudah ada.

### 4.1 Warna

| Token | Nilai | Pemakaian | Asal |
|---|---|---|---|
| `--sb-navy-700` | `#09408C` | Warna utama: tombol utama, judul, item aktif | [brand] |
| `--sb-navy-800` | `#0E3571` | Hover tombol utama, latar gelap | [brand] |
| `--sb-navy-900` | `#0A2650` | Teks di atas latar terang bila perlu sangat gelap | [usulan] |
| `--sb-blue-600` | `#295897` | Judul sekunder, link | [brand] |
| `--sb-sky-300` | `#9AC1E2` | Latar ikon, garis grafik sekunder | [brand] |
| `--sb-cyan-500` | `#0CC0DF` | Aksen grafik, penanda "Fase 2" | [brand] |
| `--sb-blue-50` | `#EAF1FA` | Latar kartu tertarik, baris terpilih | [usulan] |
| `--sb-canvas` | `#F4F7FB` | Latar halaman panel | [usulan] |
| `--sb-surface` | `#FFFFFF` | Kartu, tabel, modal | [brand] |
| `--sb-grey-300` | `#D4D5D8` | Bentuk lengkung dekoratif | [brand] |
| `--sb-line` | `#D5DDEB` | Garis pembatas, border input | [usulan] |
| `--sb-ink` | `#1B2A41` | Teks utama | [usulan] |
| `--sb-muted` | `#5B6882` | Teks sekunder | [usulan] |
| `--sb-success-600` | `#1F6F4A` | Teks dan ikon sukses; latar `#E3F4EC` | [usulan] |
| `--sb-warning-500` | `#F5B82E` | Peringatan; teks tetap gelap `#1B2A41` | [usulan] |
| `--sb-danger-600` | `#B4381F` | Teks dan tombol bahaya; latar `#FBE9E5` | [usulan] |
| `--sb-info-600` | `#295897` | Informasi | [brand] |

**Aturan kontras (perkiraan, WCAG 2.1 AA):**

- Navy `#09408C` di atas putih sekitar 9,9:1.
- Teks muted `#5B6882` di atas putih sekitar 5,6:1.
- Hijau dan merah terang tidak dipakai sebagai latar teks putih (kontras kurang dari 4,5:1). Untuk status, pakai **latar pastel dengan teks tua**.
- Amber dipakai dengan teks gelap, bukan putih.

### 4.2 Tipografi

| Peran | Font | Bobot | Ukuran / tinggi baris |
|---|---|---|---|
| Display (hero website) | Poppins | 700 | 48/56 |
| H1 | Poppins | 700 | 32/40 |
| H2 | Poppins | 700 | 24/32 |
| H3 | Poppins | 600 | 20/28 |
| Body (website) | DM Sans | 400 | 16/24 |
| Body (panel, padat) | DM Sans | 400 | 14/20 |
| Label dan tombol | DM Sans | 700 | 14/20 |
| Caption | DM Sans | 400 | 12/16 |

- Angka di tabel, nominal, dan skor memakai `font-variant-numeric: tabular-nums`.
- Poppins dan DM Sans berlisensi terbuka (Google Fonts). **Pasang sendiri (self-host)** agar cepat dan tidak bergantung pihak ketiga.
- Fallback: `system-ui, -apple-system, "Segoe UI", sans-serif`.

### 4.3 Jarak, radius, bayangan

```css
:root {
  /* warna: lihat tabel 4.1 */
  --sb-navy-700: #09408C;
  --sb-navy-800: #0E3571;
  --sb-navy-900: #0A2650;
  --sb-blue-600: #295897;
  --sb-sky-300:  #9AC1E2;
  --sb-cyan-500: #0CC0DF;
  --sb-blue-50:  #EAF1FA;
  --sb-canvas:   #F4F7FB;
  --sb-surface:  #FFFFFF;
  --sb-grey-300: #D4D5D8;
  --sb-line:     #D5DDEB;
  --sb-ink:      #1B2A41;
  --sb-muted:    #5B6882;
  --sb-success-600: #1F6F4A;
  --sb-warning-500: #F5B82E;
  --sb-danger-600:  #B4381F;

  /* jarak (skala 4 px) */
  --sb-space-1: 4px;  --sb-space-2: 8px;   --sb-space-3: 12px;
  --sb-space-4: 16px; --sb-space-5: 24px;  --sb-space-6: 32px;
  --sb-space-7: 48px; --sb-space-8: 64px;

  /* radius */
  --sb-radius-sm: 8px;   /* input kecil, chip */
  --sb-radius-md: 12px;  /* tombol, input */
  --sb-radius-lg: 16px;  /* kartu */
  --sb-radius-xl: 24px;  /* panel besar, hero */
  --sb-radius-pill: 999px;

  /* bayangan lembut */
  --sb-shadow-sm: 0 2px 8px rgba(9, 64, 140, 0.06);
  --sb-shadow-md: 0 8px 24px rgba(9, 64, 140, 0.10);

  /* fokus */
  --sb-focus: 0 0 0 3px rgba(41, 88, 151, 0.35);

  /* font */
  --sb-font-heading: "Poppins", system-ui, sans-serif;
  --sb-font-body: "DM Sans", system-ui, sans-serif;
}
```

### 4.4 Titik henti responsif

| Nama | Lebar | Perilaku |
|---|---|---|
| `sm` | 0-639 px | Satu kolom; sidebar jadi menu geser; tutor memakai navigasi bawah |
| `md` | 640-1023 px | Dua kolom untuk kartu; sidebar ikon saja |
| `lg` | 1024-1279 px | Sidebar penuh 248 px |
| `xl` | 1280 px ke atas | Panel kanan 320 px muncul |

## 5. Komponen

### 5.1 Tombol

| Varian | Tampilan | Pemakaian |
|---|---|---|
| Utama | Latar navy, teks putih, radius 12 | Satu per layar: Simpan, Daftar, Jadwalkan |
| Sekunder | Garis navy, teks navy, latar putih | Batal, Kembali |
| Ghost | Tanpa garis, teks navy | Aksi ringan di tabel |
| Bahaya | Latar `--sb-danger-600`, teks putih | Hapus, batalkan sesi |

- Tinggi: 44 px (default), 36 px (padat, tabel).
- Status: hover `--sb-navy-800`; fokus `--sb-focus`; nonaktif 40% opasitas + kursor tidak boleh.
- Tombol berisi **teks kerja** ("Simpan jadwal", bukan "OK").

### 5.2 Input dan formulir

- Label **di atas** input, selalu terlihat (bukan hanya placeholder).
- Tinggi 44 px, border `--sb-line`, radius 12, fokus `--sb-focus`.
- Wajib diisi ditandai teks "wajib", bukan hanya bintang.
- Validasi saat kehilangan fokus dan saat kirim; pesan galat di bawah input dengan ikon dan teks yang menjelaskan cara memperbaiki ("Nomor WhatsApp harus diawali 08 atau +62").
- Nomor telepon, nominal rupiah (pemisah titik), dan tanggal memakai format Indonesia.

### 5.3 Kartu

- Latar putih, radius 16, bayangan `--sb-shadow-sm`, padding 16 (padat) atau 24 (longgar).
- Kartu ringkasan angka: ikon di lingkaran `--sb-blue-50`, angka besar (H1), label kecil, selisih opsional.

### 5.4 Chip status

Selalu **teks + ikon kecil + latar pastel**, tidak pernah hanya warna.

| Konteks | Nilai dan warna |
|---|---|
| Lead | Baru (biru), Dihubungi (amber), Ikut placement (cyan), Daftar (hijau), Batal (abu) |
| Sesi | Terjadwal (biru), Terlaksana (hijau), Dibatalkan (abu coret), Dijadwal ulang (amber) |
| Absensi | Hadir (hijau), Izin (amber), Alpa (merah) |
| Pembayaran | Lunas (hijau), Sebagian (amber), Belum (merah) |
| Paket | Aktif (hijau), Hampir habis (amber), Habis/kedaluwarsa (merah) |

### 5.5 Indikator kuota

Batang progres dengan teks "6 dari 10 pertemuan". Aturan warna:

- sisa lebih dari 2 sesi: navy,
- sisa 1-2 sesi atau 7 hari terakhir: amber,
- sisa 0 atau kedaluwarsa: merah.

Ambang mengikuti pengaturan (PRD BR-4).

### 5.5.1 Tabel

- Header lengket, tinggi baris 48 px, baris hover `--sb-blue-50`.
- Kolom aksi di kanan; maksimal dua aksi terlihat, sisanya di menu titik tiga.
- Pencarian dan filter di atas tabel; hasil kosong menampilkan keadaan kosong (5.9).
- Di layar `sm`, tabel berubah menjadi daftar kartu (nama + status + aksi utama).

### 5.6 Kalender dan jadwal

- **Strip tanggal** (seperti "Event Dates" di referensi): 7 hari, hari terpilih berupa pil navy.
- **Tampilan minggu:** kolom per hari, blok sesi diwarnai menurut kategori program (K-12 navy, CPNS/BUMN biru `#295897`, S2/S3 cyan, TOEFL teal, penulisan sky).
- **Blok sesi** menampilkan jam, nama siswa/kelompok, tutor, dan ikon model (kamera untuk online, rumah untuk home visit).
- **Bentrok jadwal:** banner kuning di atas formulir dengan ikon peringatan, menyebut siapa yang bentrok dan jam berapa. Tombol "Jadwalkan" nonaktif sampai diperbaiki.

### 5.7 Modal, toast, banner

- Modal untuk keputusan singkat; konfirmasi tindakan merusak menyebut objeknya ("Batalkan sesi Rani, Selasa 14.00?").
- Toast 4 detik di kanan atas, dengan tombol "Urungkan" untuk perubahan status.
- Banner persisten untuk galat sistem atau data tertunda.

### 5.8 Grafik

- Garis perkembangan skor: garis navy, area sky pucat, titik per percobaan.
- Grafik batang per kategori (TWK/TIU/TKP dan sebagainya): navy, kategori terlemah ditandai amber dengan label.
- Setiap grafik menyediakan **tabel pengganti** untuk pembaca layar dan cetak.

### 5.9 Keadaan kosong, memuat, galat

- **Kosong:** ikon sederhana, satu kalimat penjelasan, satu tombol aksi ("Belum ada jadwal minggu ini. Buat jadwal").
- **Memuat:** kerangka abu (skeleton) sesuai bentuk konten, bukan spinner penuh layar.
- **Galat:** pesan jelas + tombol "Coba lagi"; data yang sudah diketik tidak hilang.

## 6. Tata Letak dan Navigasi

### 6.1 Website publik

**Navigasi atas:** logo, Home, About Us, Programs, Contact (mengikuti company profile), plus tombol utama "Konsultasi via WhatsApp".

**Urutan bagian beranda:**

1. Hero: "Sahabat Belajar", tagline, dua tombol (Daftar, Konsultasi WhatsApp), foto dalam bingkai lingkaran navy.
2. Mengapa kami hadir: tiga tantangan pembelajar.
3. Solusi kami: tiga solusi.
4. Program: empat sub-program dan K-12, dalam kartu.
5. Model kelas: privat, semi-privat, online, home visit.
6. Alur belajar: lima langkah (stepper horizontal, vertikal di ponsel).
7. Fasilitas dan layanan unggulan: empat kartu bernomor.
8. Paket belajar: tiga kolom (custom, berbasis waktu, berbasis kuota) dan catatan "90 menit per pertemuan".
9. Goal "Bisa" lalu "Cepat".
10. Form pendaftaran/konsultasi.
11. Footer: kontak, tagar, tautan cepat.

Halaman terpisah mengikuti profil: About Us (tentang, visi misi), Programs (detail tiap sub-program), Contact (form + kontak).

**Gaya:** latar putih, kelompok titik ●●● sebagai pemisah bagian, bentuk lengkung abu di sudut, foto dalam bingkai lingkaran, judul Poppins navy. Harga tidak ditampilkan kecuali klien memutuskan.

### 6.2 Panel admin

```
+----------+-------------------------------------+------------------+
| LOGO     | Halo, Bu Rina!   [ cari...  ][filter][🔔2]               |
|          +-------------------------------------+------------------+
| Dashboard| [Hari ini][Minggu ini][Bulan ini]   |  Profil          |
| Lead     |                                     |  (avatar bulat)  |
| Siswa    | +--------+ +--------+ +--------+    |  Admin           |
| Tutor    | |Siswa   | |Sesi    | |Kuota   |    |                  |
| Jadwal   | |aktif   | |hari ini| |hampir  |    |  Perlu Tindakan  |
| Paket &  | | 48     | |  9     | |habis 5 |    |  - Rani: kuota 1 |
| Bayar    | +--------+ +--------+ +--------+    |  - Dika: tagihan |
| Honor    |                                     |  - 3 lead baru   |
| Tryout   | Jadwal hari ini                     |                  |
| Laporan  | [Sen][Sel][Rab][Kam][Jum][Sab][Min] |                  |
| Pengatur | +-------------------+---------------+|                  |
|          | |14.00 Rani - TOEFL | 15.30 Dika ...||                  |
| Keluar   | +-------------------+---------------+|                  |
+----------+-------------------------------------+------------------+
```

- Sidebar 248 px; item aktif pil navy. Di bawah: Pengaturan dan Keluar.
- Daftar menu mengikuti peran (PRD bagian 11): staf tidak melihat Honor dan tarif.
- Panel kanan hanya muncul di `xl`; di bawahnya, isinya pindah ke bagian bawah dashboard.
- Dashboard admin dibatasi satu layar tanpa gulir yang penting.

### 6.3 Panel tutor (mobile-first)

- Navigasi bawah: Jadwal, Absensi, Siswa, Honor, Akun.
- Kartu sesi hari ini dengan **tombol utama besar** "Isi absensi" (tinggi minimal 48 px).
- Formulir jurnal singkat: materi, catatan, tugas; simpan sebagai draf bila koneksi putus.

### 6.4 Layar ujian online (Fase 2)

```
+------------------------------------------------------------------+
| Tryout SKD #3            Soal 12 dari 110        ⏱ 01:12:45       |
+------------------------------------------------+-----------------+
| 12.  Pertanyaan ...                            |  Navigasi soal  |
|                                                | [1][2][3][4][5] |
|  ( ) A. ...                                    | [6][7]..[12]... |
|  ( ) B. ...                                    |                 |
|  ( ) C. ...                                    | ■ dijawab       |
|  ( ) D. ...                                    | ▢ belum         |
|  ( ) E. ...                                    | ⚑ ragu-ragu     |
|                                                |                 |
| [Sebelumnya]  [⚑ Ragu-ragu]  [Selanjutnya]    | [Selesai ujian] |
+------------------------------------------------+-----------------+
| Jawaban tersimpan otomatis 14:03                                  |
+------------------------------------------------------------------+
```

- Tanpa sidebar atau menu lain; hanya judul, nomor soal, timer.
- Timer: navy normal; amber saat sisa 5 menit; merah saat 1 menit. Pengumuman ke pembaca layar hanya pada 10, 5, dan 1 menit (bukan tiap detik).
- Navigasi soal: nomor dijawab = terisi navy; ragu-ragu = ikon bendera + garis amber; belum = garis saja; soal aktif = cincin.
- "Selesai ujian" membuka modal ringkasan: jumlah dijawab, ragu-ragu, kosong.
- Indikator "Tersimpan otomatis" dengan jam terakhir; bila koneksi putus tampil banner "Sedang menyambung kembali, jawaban Anda aman di perangkat".
- Halaman hasil: kartu skor, batang per kategori, grafik perkembangan, tombol "Lihat pembahasan".

### 6.5 Portal siswa dan orang tua (Fase 3)

- Navigasi atas sederhana: Beranda, Jadwal, Nilai, Tagihan.
- Beranda: sapaan, sesi berikutnya, sisa kuota, perkembangan terakhir.
- Orang tua dengan beberapa anak memakai pemilih anak di atas halaman.

## 7. Pola Interaksi

- **Konfirmasi** hanya untuk tindakan merusak atau tak terbalik; perubahan ringan memakai toast + "Urungkan".
- **Pencarian global** mencari siswa, tutor, dan lead berdasarkan nama atau nomor.
- **Penyimpanan:** formulir panjang menyimpan draf otomatis; tombol simpan menampilkan status ("Menyimpan...", "Tersimpan").
- **Pintasan:** di panel admin, tombol "+ Jadwalkan" tersedia di mana-mana (topbar).
- **Notifikasi:** lonceng dengan angka; isinya sama dengan daftar "Perlu Tindakan".
- **Gerak:** transisi singkat (150-200 ms); hormati `prefers-reduced-motion`.

## 8. Aksesibilitas

Target **WCAG 2.1 AA**.

- Kontras teks minimal 4,5:1 (3:1 untuk teks besar dan ikon penting).
- Semua fungsi bisa dipakai lewat keyboard; fokus selalu terlihat (`--sb-focus`).
- Area ketuk minimal 44 x 44 px, terutama di panel tutor.
- Informasi tidak hanya lewat warna: chip, grafik, dan navigasi soal selalu punya teks atau ikon.
- Formulir memakai label terhubung, galat diumumkan ke pembaca layar.
- Timer dan navigasi soal memakai atribut ARIA yang tepat; pembaruan tidak mengganggu.
- Bahasa dokumen `lang="id"`; gambar bermakna punya teks alternatif.

## 9. Konten dan Nada Bahasa

- Bahasa Indonesia sehari-hari yang sopan dan hangat, selaras dengan nama dan hashtag brand.
- Sapaan: **"Anda"** untuk orang tua dan umum; **"kamu"** boleh dipakai di materi yang ditujukan langsung ke siswa. Pilih satu per halaman dan konsisten.
- Istilah: **siswa** di antarmuka (singkat); **peserta didik** hanya di teks marketing/profil.
- Hindari janji berlebihan ("pasti lulus"); gunakan "membantu", "mendampingi".

**Contoh microcopy**

| Situasi | Teks |
|---|---|
| Sapaan dashboard | "Halo, Bu Rina! Ini ringkasan hari ini." |
| Kosong (jadwal) | "Belum ada jadwal minggu ini. Yuk buat jadwal." |
| Bentrok | "Rani sudah punya sesi pukul 14.00-15.30 dengan Pak Dika. Pilih jam lain." |
| Kuota hampir habis | "Sisa 1 pertemuan. Tawarkan paket lanjutan?" |
| Simpan berhasil | "Absensi tersimpan." |
| Galat jaringan | "Koneksi terputus. Data Anda aman, kami coba lagi otomatis." |
| Konfirmasi hapus | "Hapus data siswa Rani? Riwayat sesi dan pembayaran ikut hilang." |

## 10. Aset dan Ikon

- **Logo:** minta SVG. Sediakan versi berwarna (latar terang), versi putih (latar navy), dan ikon kecil untuk favicon.
- **Ikon:** satu pustaka ikon outline (mis. Lucide), tebal garis 1,75 px, ukuran 20 px di menu dan 24 px di kartu.
- **Foto:** profil memakai foto stok; **pastikan lisensinya** sebelum dipakai di website. Gunakan bingkai lingkaran atau pil agar konsisten dengan motif.
- **Ilustrasi:** pakai bentuk sederhana (titik, lengkung) dari motif brand; hindari gaya ilustrasi yang berbeda-beda.
- Tanpa mode gelap pada Fase 1-2.

## 11. Penerapan di Template Admin

1. Jangan mengubah komponen satu per satu. **Mulai dari tema**: timpa variabel warna, font, radius, dan bayangan dengan token di bagian 4.
2. Atur ulang sidebar, topbar, dan kartu agar sesuai bagian 6.2.
3. Tambah komponen khusus yang tidak ada di template: chip status (5.4), indikator kuota (5.5), strip tanggal dan blok sesi (5.6), layar ujian (6.4).
4. Website publik dibangun terpisah dari template admin dengan token yang sama.

| Fase | Desain yang dikerjakan |
|---|---|
| 1 | Token, komponen dasar, website publik, panel admin (dashboard, tabel, form, jadwal, absensi, pembayaran, honor), tampilan tutor di ponsel |
| 2 | Layar ujian, halaman hasil, grafik perkembangan, laporan cetak, akun siswa |
| 3 | Portal siswa dan orang tua, alur review dokumen, tagihan online |

## 12. Daftar Cek Mutu

- [ ] Semua warna berasal dari token, tidak ada nilai heksa acak.
- [ ] Kontras teks lulus 4,5:1 di semua status (periksa chip dan tombol).
- [ ] Setiap status punya teks dan ikon, bukan hanya warna.
- [ ] Setiap layar punya satu tombol utama.
- [ ] Keadaan kosong, memuat, dan galat ada di tiap daftar dan formulir.
- [ ] Tabel berubah menjadi kartu di layar kecil.
- [ ] Panel tutor nyaman dipakai satu tangan di ponsel.
- [ ] Layar ujian: timer, navigasi, simpan otomatis, dan sambung ulang diuji.
- [ ] Format tanggal, jam, dan rupiah mengikuti kebiasaan Indonesia.
- [ ] Logo dan foto memiliki lisensi yang jelas.

## 13. Keputusan yang Masih Terbuka

| Keputusan | Pemilik |
|---|---|
| File logo vektor dan panduan penggunaan logo | Klien |
| Persetujuan palet turunan (bagian bertanda [usulan]) | Klien |
| Sapaan "Anda" atau "kamu" untuk siswa | Klien |
| Apakah harga paket ditampilkan di website | Klien |
| Sumber foto dan ilustrasi yang berlisensi | Klien |
| Pustaka grafik dan komponen UI yang dipakai | Pengembang |
