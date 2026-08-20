import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSION_MODULES = [
  "page",
  "article",
  "category",
  "navigation",
  "appearance",
  "user",
  "role",
  "settings",
];
const PERMISSION_ACTIONS = ["create", "read", "update", "delete"];

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create all permissions
  console.log("  Creating permissions...");
  const permissions: { id: string; name: string }[] = [];
  for (const mod of PERMISSION_MODULES) {
    const actions =
      mod === "settings" ? ["read", "update"] : PERMISSION_ACTIONS;
    for (const action of actions) {
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
  const adminPerms = permissions
    .filter((p) => !p.name.startsWith("role."))
    .map((p) => ({ id: p.id }));
  const editorPerms = permissions
    .filter((p) =>
      ["page", "article", "category"].some((m) => p.name.startsWith(`${m}.`))
    )
    .map((p) => ({ id: p.id }));
  const viewerPerms = permissions
    .filter((p) => p.name.endsWith(".read"))
    .map((p) => ({ id: p.id }));

  const superAdmin = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: { permissions: { set: allPerms } },
    create: {
      name: "Super Admin",
      description: "Akses penuh ke semua fitur",
      permissions: { connect: allPerms },
    },
  });

  await prisma.role.upsert({
    where: { name: "Admin" },
    update: { permissions: { set: adminPerms } },
    create: {
      name: "Admin",
      description: "Akses semua fitur kecuali kelola role & permission",
      permissions: { connect: adminPerms },
    },
  });

  await prisma.role.upsert({
    where: { name: "Editor" },
    update: { permissions: { set: editorPerms } },
    create: {
      name: "Editor",
      description: "Hanya CRUD konten (halaman, berita, kategori)",
      permissions: { connect: editorPerms },
    },
  });

  await prisma.role.upsert({
    where: { name: "Viewer" },
    update: { permissions: { set: viewerPerms } },
    create: {
      name: "Viewer",
      description: "Hanya baca semua konten",
      permissions: { connect: viewerPerms },
    },
  });
  console.log("  ✅ 4 roles created");

  // 3. Create default admin user
  console.log("  Creating admin user...");
  const hashedPassword = await hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "admin@biasristek.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@biasristek.id",
      password: hashedPassword,
      roleId: superAdmin.id,
    },
  });
  console.log("  ✅ Admin user created (admin@biasristek.id / password123)");

  // 4. Create default site settings
  console.log("  Creating site settings...");
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        siteName: "BIAS RISTEK",
        siteDescription:
          "Badan Inovasi Akademik & Sains - Program Pengembangan Riset dan Teknologi",
      },
    });
  }
  console.log("  ✅ Site settings created");

  // 5. Create sample categories
  console.log("  Creating sample categories...");
  const categories = [
    { name: "Pengumuman", slug: "pengumuman", color: "#3B82F6", description: "Pengumuman resmi" },
    { name: "Kegiatan", slug: "kegiatan", color: "#10B981", description: "Informasi kegiatan" },
    { name: "Penelitian", slug: "penelitian", color: "#8B5CF6", description: "Riset dan penelitian" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("  ✅ Sample categories created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Email: admin@biasristek.id");
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
