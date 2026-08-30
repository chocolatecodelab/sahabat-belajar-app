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
 * Standard Catalog of all 16 Modules and their associated Permissions
 */
export const SYSTEM_MODULES: ModuleDefinition[] = [
  {
    key: "dashboard",
    label: "Dashboard & Ringkasan",
    description: "Akses ke halaman utama dashboard dan statistik ringkas",
    icon: "LayoutDashboard",
    permissions: [
      { id: "p_dash_r", name: "dashboard.read", module: "dashboard", action: "read", label: "Akses Dashboard", description: "Melihat statistik ringkasan dan dashboard utama" },
      { id: "p_dash_a", name: "analytics.read", module: "dashboard", action: "read", label: "Akses Visual Analytics", description: "Melihat grafik pertumbuhan transaksi dan visual analytics" },
    ],
  },
  {
    key: "course",
    label: "Program Kursus & Kurikulum",
    description: "Pengelolaan program kursus, silabus, bab materi, dan unduhan modul",
    icon: "BookOpen",
    permissions: [
      { id: "p_crs_r", name: "course.read", module: "course", action: "read", label: "Lihat Kursus", description: "Melihat daftar kursus dan rincian silabus" },
      { id: "p_crs_c", name: "course.create", module: "course", action: "create", label: "Buat Kursus", description: "Menambahkan program kursus baru" },
      { id: "p_crs_u", name: "course.update", module: "course", action: "update", label: "Edit Kursus & Silabus", description: "Mengubah data kursus, modul, sesi materi, dan file lampiran" },
      { id: "p_crs_d", name: "course.delete", module: "course", action: "delete", label: "Hapus Kursus", description: "Menghapus program kursus atau modul" },
    ],
  },
  {
    key: "registration",
    label: "Pendaftaran & Transaksi Siswa",
    description: "Pengelolaan registrasi kursus, verifikasi bukti bayar, dan faktur",
    icon: "GraduationCap",
    permissions: [
      { id: "p_reg_r", name: "registration.read", module: "registration", action: "read", label: "Lihat Pendaftaran", description: "Melihat riwayat transaksi dan pendaftaran siswa" },
      { id: "p_reg_u", name: "registration.update", module: "registration", action: "update", label: "Verifikasi Pembayaran", description: "Memverifikasi status lunas dan aktivasi akun ruang belajar" },
      { id: "p_reg_d", name: "registration.delete", module: "registration", action: "delete", label: "Hapus Transaksi", description: "Menghapus riwayat pendaftaran/transaksi yang tidak valid" },
    ],
  },
  {
    key: "submission",
    label: "Review Draf Naskah Riset",
    description: "Workflow bimbingan karya tulis ilmiah, telaah manuskrip, dan penilaian",
    icon: "FileCheck",
    permissions: [
      { id: "p_sub_r", name: "submission.read", module: "submission", action: "read", label: "Lihat Antrean Draf", description: "Melihat daftar pengumpulan draf naskah dari peserta" },
      { id: "p_sub_u", name: "submission.review", module: "submission", action: "update", label: "Beri Nilai & Feedback", description: "Memeriksa naskah, memberi skor, dan catatan revisi ilmiah" },
    ],
  },
  {
    key: "certificate",
    label: "E-Sertifikat Pelatihan 32 JP",
    description: "Penerbitan, penomoran resmi, dan validasi sertifikat kelulusan peserta",
    icon: "Award",
    permissions: [
      { id: "p_crt_r", name: "certificate.read", module: "certificate", action: "read", label: "Lihat E-Sertifikat", description: "Melihat daftar sertifikat yang telah diterbitkan" },
      { id: "p_crt_c", name: "certificate.create", module: "certificate", action: "create", label: "Terbitkan Sertifikat", description: "Menerbitkan sertifikat kelulusan 32 JP untuk peserta" },
      { id: "p_crt_d", name: "certificate.delete", module: "certificate", action: "delete", label: "Hapus Sertifikat", description: "Membatalkan/menghapus sertifikat yang telah terbit" },
    ],
  },
  {
    key: "article",
    label: "Berita & Artikel Publikasi",
    description: "Manajemen artikel, berita ilmiah, pengumuman, dan insight riset",
    icon: "Newspaper",
    permissions: [
      { id: "p_art_r", name: "article.read", module: "article", action: "read", label: "Lihat Berita", description: "Melihat daftar berita dan draf artikel" },
      { id: "p_art_c", name: "article.create", module: "article", action: "create", label: "Tulis Berita", description: "Membuat artikel atau rilis berita baru" },
      { id: "p_art_u", name: "article.update", module: "article", action: "update", label: "Edit Berita", description: "Mengubah konten berita dan status publikasi" },
      { id: "p_art_d", name: "article.delete", module: "article", action: "delete", label: "Hapus Berita", description: "Menghapus artikel atau berita" },
    ],
  },
  {
    key: "category",
    label: "Kategori Konten & Kursus",
    description: "Pengelolaan taksonomi kategori program kursus dan berita",
    icon: "FolderOpen",
    permissions: [
      { id: "p_cat_r", name: "category.read", module: "category", action: "read", label: "Lihat Kategori", description: "Melihat daftar kategori" },
      { id: "p_cat_c", name: "category.create", module: "category", action: "create", label: "Tambah Kategori", description: "Menambahkan kategori baru" },
      { id: "p_cat_u", name: "category.update", module: "category", action: "update", label: "Edit Kategori", description: "Mengubah nama atau slug kategori" },
      { id: "p_cat_d", name: "category.delete", module: "category", action: "delete", label: "Hapus Kategori", description: "Menghapus kategori" },
    ],
  },
  {
    key: "media",
    label: "Pustaka Media & Berkas",
    description: "Manajemen unggahan gambar, foto bukti bayar, dan dokumen lampiran",
    icon: "Image",
    permissions: [
      { id: "p_med_r", name: "media.read", module: "media", action: "read", label: "Lihat Media Library", description: "Melihat galeri berkas media" },
      { id: "p_med_c", name: "media.create", module: "media", action: "create", label: "Upload Berkas", description: "Mengunggah file, gambar, dan dokumen baru" },
      { id: "p_med_d", name: "media.delete", module: "media", action: "delete", label: "Hapus Berkas", description: "Menghapus file dari media library" },
    ],
  },
  {
    key: "page",
    label: "Halaman Statis & Informasi",
    description: "Pengelolaan halaman khusus seperti Tentang Kami, Kontak, Kebijakan",
    icon: "FileText",
    permissions: [
      { id: "p_page_r", name: "page.read", module: "page", action: "read", label: "Lihat Halaman", description: "Melihat daftar halaman statis" },
      { id: "p_page_c", name: "page.create", module: "page", action: "create", label: "Buat Halaman", description: "Menambahkan halaman statis baru" },
      { id: "p_page_u", name: "page.update", module: "page", action: "update", label: "Edit Halaman", description: "Mengubah konten halaman statis" },
      { id: "p_page_d", name: "page.delete", module: "page", action: "delete", label: "Hapus Halaman", description: "Menghapus halaman statis" },
    ],
  },
  {
    key: "navigation",
    label: "Navigasi & Menu Publik",
    description: "Pengaturan menu navigasi header dan footer website publik",
    icon: "Navigation",
    permissions: [
      { id: "p_nav_r", name: "navigation.read", module: "navigation", action: "read", label: "Lihat Navigasi", description: "Melihat struktur menu navigasi situs" },
      { id: "p_nav_c", name: "navigation.create", module: "navigation", action: "create", label: "Tambah Menu", description: "Menambahkan tautan navigasi baru" },
      { id: "p_nav_u", name: "navigation.update", module: "navigation", action: "update", label: "Edit Navigasi", description: "Mengubah urutan dan link navigasi" },
      { id: "p_nav_d", name: "navigation.delete", module: "navigation", action: "delete", label: "Hapus Menu", description: "Menghapus tautan menu navigasi" },
    ],
  },
  {
    key: "appearance",
    label: "Tampilan Landing Page",
    description: "Pengaturan komponen visual hero, alur belajar, keunggulan, statistik, FAQ, dll",
    icon: "Palette",
    permissions: [
      { id: "p_app_r", name: "appearance.read", module: "appearance", action: "read", label: "Lihat Pengaturan Tampilan", description: "Melihat konfigurasi tampilan landing page" },
      { id: "p_app_u", name: "appearance.update", module: "appearance", action: "update", label: "Edit Tampilan Website", description: "Mengubah hero banner, statistik, alur belajar, testimoni, FAQ, dan sosmed" },
    ],
  },
  {
    key: "user",
    label: "Manajemen Pengguna & Akun",
    description: "Pengelolaan akun admin, mentor riset, penulis, dan peserta",
    icon: "Users",
    permissions: [
      { id: "p_usr_r", name: "user.read", module: "user", action: "read", label: "Lihat Pengguna", description: "Melihat daftar semua pengguna terdaftar" },
      { id: "p_usr_c", name: "user.create", module: "user", action: "create", label: "Tambah Pengguna", description: "Membuat akun pengguna baru secara manual" },
      { id: "p_usr_u", name: "user.update", module: "user", action: "update", label: "Edit Akun & Role", description: "Mengubah profil, role, atau reset password pengguna" },
      { id: "p_usr_d", name: "user.delete", module: "user", action: "delete", label: "Hapus Pengguna", description: "Menghapus akun pengguna dari sistem" },
    ],
  },
  {
    key: "role",
    label: "Manajemen Role & Hak Akses",
    description: "Konfigurasi matrix perizinan, role kustom, dan hak akses modul (RBAC)",
    icon: "Shield",
    permissions: [
      { id: "p_rol_r", name: "role.read", module: "role", action: "read", label: "Lihat Role & Izin", description: "Melihat daftar role dan permissions yang melekat" },
      { id: "p_rol_c", name: "role.create", module: "role", action: "create", label: "Buat Role Baru", description: "Menambahkan role kustom baru" },
      { id: "p_rol_u", name: "role.update", module: "role", action: "update", label: "Edit Hak Akses Role", description: "Mengubah permissions yang dimiliki sebuah role" },
      { id: "p_rol_d", name: "role.delete", module: "role", action: "delete", label: "Hapus Role", description: "Menghapus role kustom yang tidak digunakan" },
    ],
  },
  {
    key: "menu",
    label: "Manajemen Menu Admin",
    description: "Pengaturan susunan, ikon, dan visibilitas menu sidebar dashboard admin",
    icon: "Menu",
    permissions: [
      { id: "p_mnu_r", name: "menu.read", module: "menu", action: "read", label: "Lihat Menu Admin", description: "Melihat struktur registry menu admin" },
      { id: "p_mnu_u", name: "menu.update", module: "menu", action: "update", label: "Atur Menu Admin", description: "Mengubah urutan, label, ikon, dan status aktif menu admin" },
    ],
  },
  {
    key: "payment_account",
    label: "Rekening Pembayaran & QRIS",
    description: "Konfigurasi rekening tujuan transfer bank dan gambar QRIS resmi",
    icon: "CreditCard",
    permissions: [
      { id: "p_pay_r", name: "payment_account.read", module: "payment_account", action: "read", label: "Lihat Rekening", description: "Melihat daftar rekening dan QRIS pembayaran" },
      { id: "p_pay_u", name: "payment_account.update", module: "payment_account", action: "update", label: "Atur Rekening Pembayaran", description: "Menambah, mengedit, atau mengubah status rekening & QRIS" },
    ],
  },
  {
    key: "settings",
    label: "Pengaturan Sistem & Website",
    description: "Konfigurasi umum website, kontak resmi, SEO, dan identitas lembaga",
    icon: "Settings",
    permissions: [
      { id: "p_set_r", name: "settings.read", module: "settings", action: "read", label: "Lihat Pengaturan Umum", description: "Melihat informasi dan konfigurasi sistem" },
      { id: "p_set_u", name: "settings.update", module: "settings", action: "update", label: "Ubah Pengaturan Umum", description: "Menyimpan pengaturan metadata, logo, dan identitas website" },
    ],
  },
];

/**
 * Flat list of all system permissions
 */
export const ALL_SYSTEM_PERMISSIONS: PermissionDefinition[] = SYSTEM_MODULES.flatMap((m) => m.permissions);

/**
 * Standard System Roles with Default Permission Mappings
 */
export const STANDARD_ROLES = [
  {
    id: "role_superadmin",
    name: "Super Admin",
    description: "Akses penuh tanpa batas ke semua fitur, modul, dan konfigurasi sistem",
    permissionNames: ALL_SYSTEM_PERMISSIONS.map((p) => p.name),
  },
  {
    id: "role_admin",
    name: "Admin",
    description: "Akses ke seluruh fitur operasional sistem kecuali konfigurasi role tingkat tinggi",
    permissionNames: ALL_SYSTEM_PERMISSIONS.filter((p) => !p.name.startsWith("role.create") && !p.name.startsWith("role.delete")).map((p) => p.name),
  },
  {
    id: "role_mentor",
    name: "Mentor Riset",
    description: "Akses ke pengelolaan materi kursus, review draf karya tulis ilmiah, dan sertifikat",
    permissionNames: [
      "dashboard.read",
      "course.read", "course.create", "course.update",
      "submission.read", "submission.review",
      "certificate.read", "certificate.create",
      "media.read", "media.create",
      "article.read", "article.create", "article.update",
    ],
  },
  {
    id: "role_editor",
    name: "Editor",
    description: "Akses manajemen konten publikasi berita, artikel ilmiah, media, dan halaman statis",
    permissionNames: [
      "dashboard.read",
      "article.read", "article.create", "article.update", "article.delete",
      "category.read", "category.create", "category.update",
      "media.read", "media.create", "media.delete",
      "page.read", "page.create", "page.update",
      "navigation.read", "navigation.update",
      "appearance.read", "appearance.update",
    ],
  },
  {
    id: "role_student",
    name: "Peserta (Student)",
    description: "Akses khusus ke Ruang Belajar Digital, materi kursus terdaftar, dan pengumpulan draf riset",
    permissionNames: [
      "course.read",
    ],
  },
  {
    id: "role_viewer",
    name: "Viewer",
    description: "Hanya memiliki izin membaca data (Read-Only) tanpa kemampuan mengubah atau menghapus",
    permissionNames: ALL_SYSTEM_PERMISSIONS.filter((p) => p.action === "read").map((p) => p.name),
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

    // Map permission name to ID
    const permNameToId = new Map(ALL_SYSTEM_PERMISSIONS.map((p) => [p.name, p.id]));

    for (const role of STANDARD_ROLES) {
      // If role has very few permissions in pivot, populate it
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
