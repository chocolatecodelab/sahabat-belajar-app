import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSION_MODULES = [
  "dashboard",
  "lead",
  "student",
  "tutor",
  "schedule",
  "package",
  "payment",
  "payout",
  "media",
  "page",
  "user",
  "role",
  "menu",
  "settings",
];
const PERMISSION_ACTIONS = ["create", "read", "update", "delete", "manage"];

const INITIAL_MENUS = [
  { id: "menu_dashboard", label: "Dashboard", icon: "LayoutDashboard", url: "/dashboard", parentId: null, sortOrder: 1, isActive: true, permission: "dashboard.read" },
  { id: "menu_lead", label: "Prospek / Lead", icon: "Users", url: "/dashboard/lead", parentId: null, sortOrder: 2, isActive: true, permission: "lead.read" },
  { id: "menu_siswa", label: "Data Siswa", icon: "GraduationCap", url: "/dashboard/siswa", parentId: null, sortOrder: 3, isActive: true, permission: "student.read" },
  { id: "menu_tutor", label: "Direktori Tutor", icon: "BookOpen", url: "/dashboard/tutor", parentId: null, sortOrder: 4, isActive: true, permission: "tutor.read" },
  { id: "menu_jadwal", label: "Jadwal & Sesi", icon: "Calendar", url: "/dashboard/jadwal", parentId: null, sortOrder: 5, isActive: true, permission: "schedule.read" },
  { id: "menu_paket", label: "Paket & Kuota", icon: "FileCheck", url: "/dashboard/paket", parentId: null, sortOrder: 6, isActive: true, permission: "package.read" },
  { id: "menu_pembayaran", label: "Pembayaran", icon: "CreditCard", url: "/dashboard/pembayaran", parentId: null, sortOrder: 7, isActive: true, permission: "payment.read" },
  { id: "menu_honor", label: "Rekap Honor Tutor", icon: "Trophy", url: "/dashboard/honor", parentId: null, sortOrder: 8, isActive: true, permission: "payout.read" },
  { id: "menu_media", label: "Pustaka Media", icon: "Image", url: "/dashboard/media", parentId: null, sortOrder: 9, isActive: true, permission: "media.read" },
  { id: "menu_pengaturan", label: "Pengaturan", icon: "Settings", url: "/dashboard/pengaturan", parentId: null, sortOrder: 10, isActive: true, permission: "settings.read" },
];

async function main() {
  console.log("🌱 Seeding Sahabat Belajar database...");

  // 1. Create permissions
  console.log("  Creating permissions...");
  const permissions: { id: string; name: string }[] = [];
  for (const mod of PERMISSION_MODULES) {
    for (const action of PERMISSION_ACTIONS) {
      const perm = await prisma.permission.upsert({
        where: { name: `${mod}.${action}` },
        update: {},
        create: {
          name: `${mod}.${action}`,
          module: mod,
          action: action,
        },
      });
      permissions.push(perm);
    }
  }
  console.log(`  ✅ ${permissions.length} permissions created`);

  // 2. Create roles
  console.log("  Creating roles...");
  const allPerms = permissions.map((p) => ({ id: p.id }));
  const staffPerms = permissions
    .filter((p) => !p.name.startsWith("payout.") && !p.name.startsWith("role."))
    .map((p) => ({ id: p.id }));

  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: { permissions: { set: allPerms } },
    create: {
      name: "Admin",
      description: "Akses penuh operasional, penjadwalan, kuota, dan laporan keuangan",
      permissions: { connect: allPerms },
    },
  });

  await prisma.role.upsert({
    where: { name: "Staf" },
    update: { permissions: { set: staffPerms } },
    create: {
      name: "Staf",
      description: "Mengelola pendaftaran, siswa, jadwal, dan pembayaran (tanpa tarif honor)",
      permissions: { connect: staffPerms },
    },
  });

  await prisma.role.upsert({
    where: { name: "Tutor" },
    update: {},
    create: {
      name: "Tutor",
      description: "Melihat jadwal bimbingan, mengisi absensi dan jurnal, melihat honor pribadi",
    },
  });

  const siswaRole = await prisma.role.upsert({
    where: { name: "Siswa" },
    update: {},
    create: {
      name: "Siswa",
      description: "Melihat jadwal belajar, sisa kuota, dan hasil evaluasi",
    },
  });

  await prisma.role.upsert({
    where: { name: "Orang Tua" },
    update: {},
    create: {
      name: "Orang Tua",
      description: "Memantau perkembangan belajar, kehadiran, dan sisa kuota anak",
    },
  });
  console.log("  ✅ Roles created");

  // 3. Create default admin user
  console.log("  Creating admin user...");
  const hashedPassword = await hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "admin@sahabatbelajar.id" },
    update: {},
    create: {
      name: "Admin Sahabat Belajar",
      email: "admin@sahabatbelajar.id",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });
  console.log("  ✅ Admin user created (admin@sahabatbelajar.id / password123)");

  // 4. Create site settings
  console.log("  Creating site settings...");
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        siteName: "Sahabat Belajar",
        siteDescription:
          "Lembaga Bimbingan Belajar Privat & Semi-Privat - Comprehensive Academic Solution",
        contactEmail: "halo@sahabatbelajar.id",
        contactPhone: "+62 812-3456-789",
        address: "Layanan Home Visit & Online Seluruh Indonesia",
      },
    });
  }
  console.log("  ✅ Site settings created");

  // 5. Seed Admin Menus
  console.log("  Creating admin menus...");
  for (const m of INITIAL_MENUS) {
    await prisma.adminMenu.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  }
  console.log("  ✅ Admin menus created");

  // 6. Create core programs and packages
  console.log("  Creating core programs & packages...");
  const programsData = [
    {
      name: "Bimbel K-12 (SD, SMP, SMA)",
      category: "K12",
      description: "Pendampingan mapel sekolah, PR, dan persiapan ujian akhir.",
      packages: [
        { name: "Paket 5 Sesi Privat K-12", quotaSessions: 5, price: 750000 },
        { name: "Paket 10 Sesi Privat K-12", quotaSessions: 10, price: 1400000 },
        { name: "Paket 10 Sesi Semi-Privat K-12", quotaSessions: 10, price: 850000 },
      ],
    },
    {
      name: "Persiapan CPNS, BUMN & PPPK",
      category: "CPNS_BUMN",
      description: "Intensif materi SKD (TWK, TIU, TKP) dan tes bidang.",
      packages: [
        { name: "Paket 10 Sesi SKD Intensif", quotaSessions: 10, price: 1800000 },
        { name: "Paket 20 Sesi SKD Master", quotaSessions: 20, price: 3200000 },
      ],
    },
    {
      name: "Persiapan S2/S3 & Beasiswa",
      category: "S2_S3_BEASISWA",
      description: "Bimbingan TPA, wawancara beasiswa LPDP, dan kesiapan akademik.",
      packages: [
        { name: "Paket 8 Sesi Mentoring Beasiswa", quotaSessions: 8, price: 2000000 },
      ],
    },
    {
      name: "TOEFL & IELTS Preparation",
      category: "TOEFL_IELTS",
      description: "Strategi praktis menaikkan skor Listening, Structure, and Reading.",
      packages: [
        { name: "Paket 10 Sesi TOEFL Prep", quotaSessions: 10, price: 1600000 },
      ],
    },
    {
      name: "Kepenulisan Ilmiah & Skripsi",
      category: "PENULISAN_ILMIAH",
      description: "Bimbingan metodologi riset, olah data statistik, dan review naskah.",
      packages: [
        { name: "Paket 8 Sesi Skripsi / Tesis", quotaSessions: 8, price: 1800000 },
      ],
    },
  ];

  let firstPackageId = "";
  let firstProgramId = "";

  for (const prog of programsData) {
    let createdProg = await prisma.program.findFirst({
      where: { name: prog.name },
    });

    if (!createdProg) {
      createdProg = await prisma.program.create({
        data: {
          name: prog.name,
          category: prog.category,
          description: prog.description,
        },
      });
    }

    if (!firstProgramId) firstProgramId = createdProg.id;

    for (const pkg of prog.packages) {
      let createdPkg = await prisma.package.findFirst({
        where: { name: pkg.name },
      });

      if (!createdPkg) {
        createdPkg = await prisma.package.create({
          data: {
            programId: createdProg.id,
            name: pkg.name,
            type: "QUOTA",
            quotaSessions: pkg.quotaSessions,
            sessionMinutes: 90, // BR-5 default 90 menit
            price: pkg.price,
          },
        });
      }

      if (!firstPackageId) firstPackageId = createdPkg.id;
    }
  }
  console.log("  ✅ Programs and packages created");

  // 7. Seed Sample Tutor
  console.log("  Creating sample tutors...");
  const tutorData = [
    {
      name: "Dr. Hendra Wijaya, M.Pd",
      phone: "+62 813-1122-3344",
      expertise: ["Matematika", "Fisika", "TPA"],
      ratePerSession: 150000,
    },
    {
      name: "Sarah Amelia, S.Si",
      phone: "+62 813-5566-7788",
      expertise: ["Biologi", "Kimia", "Sains K-12"],
      ratePerSession: 125000,
    },
  ];

  for (const td of tutorData) {
    const existing = await prisma.tutor.findFirst({ where: { name: td.name } });
    if (!existing) {
      await prisma.tutor.create({
        data: {
          name: td.name,
          phone: td.phone,
          expertise: td.expertise,
          ratePerSession: td.ratePerSession,
          status: "AKTIF",
        },
      });
    }
  }
  console.log("  ✅ Sample tutors created");

  // 8. Seed Sample Student & Active Package
  console.log("  Creating sample student...");
  let sampleStudent = await prisma.student.findFirst({
    where: { name: "Ahmad Fauzi" },
  });

  if (!sampleStudent) {
    // Create student user account
    const studentUser = await prisma.user.create({
      data: {
        name: "Ahmad Fauzi",
        email: "siswa@sahabatbelajar.id",
        password: hashedPassword,
        roleId: siswaRole.id,
      },
    });

    sampleStudent = await prisma.student.create({
      data: {
        userId: studentUser.id,
        name: "Ahmad Fauzi",
        level: "SMA Kelas 12",
        school: "SMAN 1 Jakarta",
        parentName: "Bapak Hendro",
        parentPhone: "+62 812-9988-7766",
        parentConsentAt: new Date(),
        status: "AKTIF",
      },
    });

    // Assign package to student
    if (firstPackageId) {
      await prisma.studentPackage.create({
        data: {
          studentId: sampleStudent.id,
          packageId: firstPackageId,
          quotaTotal: 10,
          quotaUsed: 2, // 2 sessions completed
          status: "AKTIF",
          startDate: new Date(),
        },
      });
    }
  }
  console.log("  ✅ Sample student created (siswa@sahabatbelajar.id / password123)");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("   Admin Email: admin@sahabatbelajar.id | Password: password123");
  console.log("   Siswa Email: siswa@sahabatbelajar.id | Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
