import { supabaseAdmin } from "@/lib/supabase";

export interface PermissionDefinition {
  id: string;
  name: string;
  module: string;
  action: string;
  label: string;
  description: string;
}

export interface ModuleDefinition {
  key: string;
  label: string;
  description: string;
  icon: string;
  permissions: PermissionDefinition[];
}

/**
 * Standard Catalog of all 16 Sahabat Belajar Modules and their associated Permissions
 */
export const SYSTEM_MODULES: ModuleDefinition[] = [
  {
    key: "dashboard",
    label: "Dashboard & Ringkasan",
    description: "Akses ke halaman utama dashboard operasional dan statistik ringkas",
    icon: "LayoutDashboard",
    permissions: [
      { id: "p_dash_r", name: "dashboard.read", module: "dashboard", action: "read", label: "Akses Dashboard", description: "Melihat statistik ringkasan, kalender 7 hari, dan panel tindakan" },
      { id: "p_dash_a", name: "analytics.read", module: "dashboard", action: "read", label: "Akses Analitik", description: "Melihat grafik performa, statistik siswa aktif, dan konversi lead" },
    ],
  },
  {
    key: "lead",
    label: "Prospek / Lead Calon Siswa",
    description: "Pengelolaan prospek pendaftaran dari website publik dan konsultasi WhatsApp",
    icon: "Users",
    permissions: [
      { id: "p_lead_r", name: "lead.read", module: "lead", action: "read", label: "Lihat Daftar Lead", description: "Melihat daftar prospek calon siswa dan riwayat status" },
      { id: "p_lead_c", name: "lead.create", module: "lead", action: "create", label: "Input Lead Baru", description: "Menambahkan prospek calon siswa secara manual" },
      { id: "p_lead_u", name: "lead.update", module: "lead", action: "update", label: "Tindak Lanjut & Ubah Status", description: "Memperbarui status lead (BARU, DIHUBUNGI, DAFTAR) dan catatan tindak lanjut" },
      { id: "p_lead_d", name: "lead.delete", module: "lead", action: "delete", label: "Hapus Lead", description: "Menghapus data prospek calon siswa" },
    ],
  },
  {
    key: "student",
    label: "Data Siswa & Kuota Belajar",
    description: "Direktori siswa aktif, pemantauan sisa kuota pertemuan, dan kontak orang tua",
    icon: "GraduationCap",
    permissions: [
      { id: "p_std_r", name: "student.read", module: "student", action: "read", label: "Lihat Data Siswa", description: "Melihat profil siswa, sekolah, paket aktif, dan sisa kuota" },
      { id: "p_std_c", name: "student.create", module: "student", action: "create", label: "Tambah Siswa Baru", description: "Mendaftarkan siswa baru ke dalam sistem" },
      { id: "p_std_u", name: "student.update", module: "student", action: "update", label: "Edit Profil & Kuota", description: "Mengubah data siswa, jenjang, dan kontak orang tua" },
      { id: "p_std_d", name: "student.delete", module: "student", action: "delete", label: "Hapus / Nonaktifkan", description: "Menghapus atau menonaktifkan data siswa" },
      { id: "p_std_m", name: "student.manage", module: "student", action: "manage", label: "Impor Massal CSV", description: "Mengimpor data siswa massal dari file CSV" },
    ],
  },
  {
    key: "tutor",
    label: "Direktori Tutor & Pengajar",
    description: "Profil pengajar, keahlian mata pelajaran, ketersediaan jadwal, dan tarif honor",
    icon: "BookOpen",
    permissions: [
      { id: "p_tut_r", name: "tutor.read", module: "tutor", action: "read", label: "Lihat Direktori Tutor", description: "Melihat profil pengajar dan bidang keahlian" },
      { id: "p_tut_c", name: "tutor.create", module: "tutor", action: "create", label: "Tambah Tutor Baru", description: "Mendaftarkan profil tutor baru ke lembaga" },
      { id: "p_tut_u", name: "tutor.update", module: "tutor", action: "update", label: "Edit Profil Tutor", description: "Mengubah nomor kontak, bio, avatar, dan keahlian" },
      { id: "p_tut_d", name: "tutor.delete", module: "tutor", action: "delete", label: "Hapus / Nonaktifkan", description: "Menonaktifkan pengajar dari sistem" },
      { id: "p_tut_m", name: "tutor.manage", module: "tutor", action: "manage", label: "Atur Tarif Honor (Sensitif)", description: "Mengatur tarif per sesi mengajar tutor (BR-7: Admin Only)" },
    ],
  },
  {
    key: "schedule",
    label: "Jadwal & Sesi Bimbingan",
    description: "Kalender sesi belajar, deteksi bentrok (BR-2), absensi, dan jurnal pertemuan",
    icon: "Calendar",
    permissions: [
      { id: "p_sch_r", name: "schedule.read", module: "schedule", action: "read", label: "Lihat Jadwal Bimbingan", description: "Melihat kalender sesi dan jadwal tutor/siswa" },
      { id: "p_sch_c", name: "schedule.create", module: "schedule", action: "create", label: "Buat Sesi Bimbingan", description: "Menjadwalkan sesi privat/semi-privat dengan validasi bentrok" },
      { id: "p_sch_u", name: "schedule.update", module: "schedule", action: "update", label: "Reschedule & Edit Sesi", description: "Mengubah waktu, link Google Meet/Zoom, atau alamat" },
      { id: "p_sch_d", name: "schedule.delete", module: "schedule", action: "delete", label: "Batalkan Sesi", description: "Membatalkan sesi dengan pencatatan alasan resmi" },
      { id: "p_sch_m", name: "schedule.manage", module: "schedule", action: "manage", label: "Isi Absensi & Jurnal", description: "Mencatat kehadiran siswa dan jurnal capaian materi (BR-1)" },
    ],
  },
  {
    key: "package",
    label: "Paket & Kuota Belajar",
    description: "Katalog paket bimbingan (kuota/waktu), durasi default 90 menit, dan penetapan paket",
    icon: "FileCheck",
    permissions: [
      { id: "p_pkg_r", name: "package.read", module: "package", action: "read", label: "Lihat Paket Bimbingan", description: "Melihat daftar paket belajar dan status kuota siswa" },
      { id: "p_pkg_c", name: "package.create", module: "package", action: "create", label: "Buat Paket Baru", description: "Menambahkan varian paket belajar kuota / waktu" },
      { id: "p_pkg_u", name: "package.update", module: "package", action: "update", label: "Edit Paket Belajar", description: "Mengubah harga, total sesi, dan masa aktif paket" },
      { id: "p_pkg_d", name: "package.delete", module: "package", action: "delete", label: "Hapus Paket", description: "Menghapus varian paket dari katalog" },
      { id: "p_pkg_m", name: "package.manage", module: "package", action: "manage", label: "Tetapkan Paket ke Siswa", description: "Mengaitkan paket bimbingan dan kuota ke profil siswa" },
    ],
  },
  {
    key: "payment",
    label: "Pembayaran & Tagihan Siswa",
    description: "Pencatatan pembayaran manual, verifikasi bukti transfer, dan riwayat tagihan",
    icon: "CreditCard",
    permissions: [
      { id: "p_pay_r", name: "payment.read", module: "payment", action: "read", label: "Lihat Pembayaran", description: "Melihat riwayat transaksi dan status lunas siswa" },
      { id: "p_pay_c", name: "payment.create", module: "payment", action: "create", label: "Catat Pembayaran", description: "Menginput bukti bayar dan nominal transfer siswa" },
      { id: "p_pay_u", name: "payment.update", module: "payment", action: "update", label: "Verifikasi Pembayaran", description: "Memverifikasi status lunas dan tanggal verifikasi" },
      { id: "p_pay_d", name: "payment.delete", module: "payment", action: "delete", label: "Hapus Transaksi", description: "Menghapus catatan transaksi yang salah input" },
    ],
  },
  {
    key: "payout",
    label: "Rekapitulasi Honor Tutor",
    description: "Perhitungan honor otomatis dari akumulasi sesi terlaksana x tarif (BR-6 & BR-7)",
    icon: "Trophy",
    permissions: [
      { id: "p_pout_r", name: "payout.read", module: "payout", action: "read", label: "Lihat Rekap Honor", description: "Melihat rekapitulasi honorarium sesi mengajar (BR-7)" },
      { id: "p_pout_c", name: "payout.create", module: "payout", action: "create", label: "Hitung Rekap Periode", description: "Menghitung akumulasi honor tutor untuk periode tertentu" },
      { id: "p_pout_u", name: "payout.update", module: "payout", action: "update", label: "Ubah Status Pembayaran", description: "Mengubah status honor menjadi DISETUJUI atau DIBAYAR" },
      { id: "p_pout_m", name: "payout.manage", module: "payout", action: "manage", label: "Ekspor Laporan Honor", description: "Mengekspor rekapitulasi honor ke format spreadsheet CSV" },
    ],
  },
  {
    key: "material",
    label: "Bank Modul & Materi Digital",
    description: "Katalog modul belajar, pocket book rumus cepat, dan berkas ajar siswa (Fase 2)",
    icon: "FolderOpen",
    permissions: [
      { id: "p_mat_r", name: "material.read", module: "material", action: "read", label: "Lihat & Unduh Modul", description: "Melihat dan mengunduh berkas materi belajar" },
      { id: "p_mat_c", name: "material.create", module: "material", action: "create", label: "Unggah Modul Baru", description: "Menambahkan modul materi atau rumus cepat baru" },
      { id: "p_mat_u", name: "material.update", module: "material", action: "update", label: "Edit Informasi Modul", description: "Mengubah judul, deskripsi materi, dan kategori" },
      { id: "p_mat_d", name: "material.delete", module: "material", action: "delete", label: "Hapus Modul", description: "Menghapus berkas modul materi digital" },
    ],
  },
  {
    key: "exam",
    label: "Ruang Ujian & Simulasi CAT",
    description: "Manajemen paket simulasi tryout online (CPNS, SNBT, TOEFL) dan butir soal (Fase 2)",
    icon: "Award",
    permissions: [
      { id: "p_exm_r", name: "exam.read", module: "exam", action: "read", label: "Lihat Paket Ujian", description: "Melihat daftar paket simulasi CAT dan hasil tryout" },
      { id: "p_exm_c", name: "exam.create", module: "exam", action: "create", label: "Buat Paket Ujian", description: "Menambahkan paket simulasi CAT baru" },
      { id: "p_exm_u", name: "exam.update", module: "exam", action: "update", label: "Kelola Soal & Passing Grade", description: "Mengatur durasi waktu, passing grade, dan butir soal" },
      { id: "p_exm_d", name: "exam.delete", module: "exam", action: "delete", label: "Hapus Paket Ujian", description: "Menghapus paket simulasi CAT" },
    ],
  },
  {
    key: "document",
    label: "Review Dokumen & Naskah Akademik",
    description: "Bimbingan telaah esai LPDP/MEXT, proposal tesis, dan personal statement (Fase 3)",
    icon: "FileEdit",
    permissions: [
      { id: "p_doc_r", name: "document.read", module: "document", action: "read", label: "Lihat Antrean Dokumen", description: "Melihat berkas esai atau proposal bimbingan peserta" },
      { id: "p_doc_u", name: "document.update", module: "document", action: "update", label: "Beri Telaah & Revisi", description: "Memberi catatan evaluasi mentor dan mengubah status draf" },
      { id: "p_doc_d", name: "document.delete", module: "document", action: "delete", label: "Hapus Dokumen", description: "Menghapus pengajuan berkas akademik" },
    ],
  },
  {
    key: "media",
    label: "Pustaka Media & Berkas",
    description: "Manajemen unggahan gambar, foto profil, bukti transfer, dan aset visual",
    icon: "Image",
    permissions: [
      { id: "p_med_r", name: "media.read", module: "media", action: "read", label: "Lihat Media Library", description: "Melihat galeri berkas dan foto" },
      { id: "p_med_c", name: "media.create", module: "media", action: "create", label: "Upload Berkas Baru", description: "Mengunggah file, gambar, atau bukti transfer" },
      { id: "p_med_d", name: "media.delete", module: "media", action: "delete", label: "Hapus Berkas", description: "Menghapus file dari pustaka media" },
    ],
  },
  {
    key: "user",
    label: "Manajemen Pengguna & Akun",
    description: "Pengelolaan akun login administrator, staf operasional, tutor, dan siswa",
    icon: "Users",
    permissions: [
      { id: "p_usr_r", name: "user.read", module: "user", action: "read", label: "Lihat Daftar Pengguna", description: "Melihat seluruh akun pengguna terdaftar" },
      { id: "p_usr_c", name: "user.create", module: "user", action: "create", label: "Tambah Pengguna Baru", description: "Membuat akun baru dengan menetapkan role tertentu" },
      { id: "p_usr_u", name: "user.update", module: "user", action: "update", label: "Edit Akun & Reset Password", description: "Mengubah nama, email, role, atau sandi pengguna" },
      { id: "p_usr_d", name: "user.delete", module: "user", action: "delete", label: "Hapus Pengguna", description: "Menghapus akun pengguna dari sistem" },
    ],
  },
  {
    key: "role",
    label: "Role & Matriks Hak Akses (RBAC)",
    description: "Konfigurasi peran pengguna, batas akses menu, dan izin modul operasional",
    icon: "Shield",
    permissions: [
      { id: "p_rol_r", name: "role.read", module: "role", action: "read", label: "Lihat Role & Akses", description: "Melihat daftar role dan permissions yang melekat" },
      { id: "p_rol_c", name: "role.create", module: "role", action: "create", label: "Buat Role Baru", description: "Menambahkan peran pengguna kustom baru" },
      { id: "p_rol_u", name: "role.update", module: "role", action: "update", label: "Atur Hak Akses Role", description: "Mengatur checklist izin menu dan modul untuk suatu role" },
      { id: "p_rol_d", name: "role.delete", module: "role", action: "delete", label: "Hapus Role", description: "Menghapus role kustom yang sudah tidak digunakan" },
    ],
  },
  {
    key: "menu",
    label: "Manajemen Menu Navigasi",
    description: "Pengaturan urutan, label, icon, dan status tampil menu di sidebar dashboard",
    icon: "Menu",
    permissions: [
      { id: "p_mnu_r", name: "menu.read", module: "menu", action: "read", label: "Lihat Menu Sidebar", description: "Melihat susunan daftar menu dashboard" },
      { id: "p_mnu_u", name: "menu.update", module: "menu", action: "update", label: "Atur & Urutkan Menu", description: "Menambah, mengedit, menonaktifkan, atau mengurutkan menu" },
    ],
  },
  {
    key: "settings",
    label: "Pengaturan Sistem & Website",
    description: "Konfigurasi identitas lembaga, logo, kontak resmi WA/Email, dan alamat bimbingan",
    icon: "Settings",
    permissions: [
      { id: "p_set_r", name: "settings.read", module: "settings", action: "read", label: "Lihat Pengaturan Sistem", description: "Melihat informasi dan konfigurasi sistem lembaga" },
      { id: "p_set_u", name: "settings.update", module: "settings", action: "update", label: "Ubah Pengaturan Sistem", description: "Menyimpan pengaturan metadata, logo, dan identitas website" },
    ],
  },
];

/**
 * Flat list of all system permissions
 */
export const ALL_SYSTEM_PERMISSIONS: PermissionDefinition[] = SYSTEM_MODULES.flatMap((m) => m.permissions);

/**
 * Standard System Roles with Default Permission Mappings for Sahabat Belajar
 */
export const STANDARD_ROLES = [
  {
    id: "role_admin",
    name: "Admin",
    description: "Akses penuh ke seluruh data master, penjadwalan, pembayaran, honor tutor, dan pengaturan",
    permissionNames: ALL_SYSTEM_PERMISSIONS.map((p) => p.name),
  },
  {
    id: "role_staf",
    name: "Staf",
    description: "Mengelola pendaftaran/lead, siswa, jadwal, dan pembayaran (dilarang melihat honor tutor - BR-7)",
    permissionNames: ALL_SYSTEM_PERMISSIONS
      .filter((p) => !p.name.startsWith("payout.") && !p.name.startsWith("role.create") && !p.name.startsWith("role.delete") && p.name !== "tutor.manage")
      .map((p) => p.name),
  },
  {
    id: "role_tutor",
    name: "Tutor",
    description: "Melihat jadwal mengajar miliknya, mengisi absensi dan jurnal sesi, melihat rekap honor miliknya",
    permissionNames: [
      "dashboard.read",
      "tutor.read",
      "schedule.read", "schedule.manage",
      "payout.read",
      "material.read",
      "exam.read",
      "document.read", "document.update",
      "media.read", "media.create",
    ],
  },
  {
    id: "role_siswa",
    name: "Siswa",
    description: "Melihat jadwal bimbingan, sisa kuota, mengikuti tryout ujian, dan mengakses modul materi",
    permissionNames: [
      "dashboard.read",
      "schedule.read",
      "material.read",
      "exam.read",
      "document.read",
    ],
  },
  {
    id: "role_ortu",
    name: "Orang Tua",
    description: "Memantau jadwal bimbingan, sisa kuota, dan laporan perkembangan anak",
    permissionNames: [
      "dashboard.read",
      "student.read",
      "schedule.read",
    ],
  },
];

/**
 * Synchronize all system permissions into Supabase database
 */
export async function syncDatabasePermissions() {
  try {
    // 1. Upsert all permissions
    const upsertPayload = ALL_SYSTEM_PERMISSIONS.map((p) => ({
      id: p.id,
      name: p.name,
      module: p.module,
      action: p.action,
    }));

    const { error: permErr } = await supabaseAdmin
      .from("Permission")
      .upsert(upsertPayload, { onConflict: "id" });

    if (permErr) {
      console.warn("syncDatabasePermissions Permission upsert error:", permErr);
    }

    // 2. Ensure standard roles exist
    for (const r of STANDARD_ROLES) {
      await supabaseAdmin.from("Role").upsert(
        {
          id: r.id,
          name: r.name,
          description: r.description,
          updatedAt: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    // 3. Sync permissions for standard roles if not populated yet
    const { data: existingPivots } = await supabaseAdmin.from("_PermissionToRole").select("*");
    const existingSet = new Set((existingPivots || []).map((p: any) => `${p.A}:${p.B}`));

    const pivotsToInsert: { A: string; B: string }[] = [];
    const permNameToId = new Map(ALL_SYSTEM_PERMISSIONS.map((p) => [p.name, p.id]));

    for (const role of STANDARD_ROLES) {
      const currentRolePivots = (existingPivots || []).filter((p: any) => p.B === role.id);
      if (currentRolePivots.length < role.permissionNames.length) {
        for (const pName of role.permissionNames) {
          const pId = permNameToId.get(pName);
          if (pId && !existingSet.has(`${pId}:${role.id}`)) {
            pivotsToInsert.push({ A: pId, B: role.id });
          }
        }
      }
    }

    if (pivotsToInsert.length > 0) {
      const { error: pivotErr } = await supabaseAdmin
        .from("_PermissionToRole")
        .upsert(pivotsToInsert, { onConflict: "A,B" as any });
      if (pivotErr) {
        console.warn("syncDatabasePermissions Pivot upsert error:", pivotErr);
      }
    }

    return { success: true, message: "Sinkronisasi hak akses sistem berhasil" };
  } catch (err: any) {
    console.error("syncDatabasePermissions fatal error:", err);
    return { success: false, message: err?.message || "Gagal sinkronisasi hak akses" };
  }
}
