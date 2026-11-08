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

  await prisma.role.upsert({
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

  // 5. Create core programs and packages
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

  for (const prog of programsData) {
    const createdProg = await prisma.program.create({
      data: {
        name: prog.name,
        category: prog.category,
        description: prog.description,
      },
    });

    for (const pkg of prog.packages) {
      await prisma.package.create({
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
  }
  console.log("  ✅ Programs and packages created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("   Admin Email: admin@sahabatbelajar.id");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
