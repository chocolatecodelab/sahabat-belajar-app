-- ==============================================================================
-- BIAS RISTEK CMS — SUPABASE / POSTGRESQL INITIAL DATABASE SCHEMA & SEED DATA
-- ==============================================================================
-- Anda dapat menyalin seluruh query ini dan menjalankannya langsung di
-- Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- ==============================================================================

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NavType" AS ENUM ('LINK', 'PAGE', 'CATEGORY', 'EXTERNAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NavLocation" AS ENUM ('HEADER', 'FOOTER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CREATE TABLES

-- Roles
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS "Permission_module_idx" ON "Permission"("module");

-- Role_Permissions Pivot
CREATE TABLE IF NOT EXISTS "_PermissionToRole" (
    "A" TEXT NOT NULL REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "B" TEXT NOT NULL REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_AB_unique" UNIQUE ("A", "B")
);
CREATE INDEX IF NOT EXISTS "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- Users
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "roleId" TEXT NOT NULL REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");

-- Categories
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tags
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE
);

-- Pages
CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Page_authorId_idx" ON "Page"("authorId");
CREATE INDEX IF NOT EXISTS "Page_status_idx" ON "Page"("status");

-- Articles / Berita
CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Article_authorId_idx" ON "Article"("authorId");
CREATE INDEX IF NOT EXISTS "Article_categoryId_idx" ON "Article"("categoryId");
CREATE INDEX IF NOT EXISTS "Article_status_idx" ON "Article"("status");
CREATE INDEX IF NOT EXISTS "Article_publishedAt_idx" ON "Article"("publishedAt");

-- Article Tags Pivot
CREATE TABLE IF NOT EXISTS "_ArticleToTag" (
    "A" TEXT NOT NULL REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "B" TEXT NOT NULL REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ArticleToTag_AB_unique" UNIQUE ("A", "B")
);
CREATE INDEX IF NOT EXISTS "_ArticleToTag_B_index" ON "_ArticleToTag"("B");

-- Navigations
CREATE TABLE IF NOT EXISTS "Navigation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "type" "NavType" NOT NULL,
    "url" TEXT,
    "pageId" TEXT REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "parentId" TEXT REFERENCES "Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "location" "NavLocation" NOT NULL DEFAULT 'HEADER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Navigation_parentId_idx" ON "Navigation"("parentId");
CREATE INDEX IF NOT EXISTS "Navigation_location_idx" ON "Navigation"("location");

-- Hero Slides
CREATE TABLE IF NOT EXISTS "HeroSlide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "backgroundImage" TEXT NOT NULL,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "link" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Social Media
CREATE TABLE IF NOT EXISTS "SocialMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "embedCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Site Settings
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'BIAS RISTEK',
    "siteDescription" TEXT,
    "logo" TEXT,
    "favicon" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "newsPerPage" INTEGER NOT NULL DEFAULT 6,
    "heroEnabled" BOOLEAN NOT NULL DEFAULT true,
    "serviceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "socialEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Admin Menu
CREATE TABLE IF NOT EXISTS "AdminMenu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "url" TEXT NOT NULL,
    "parentId" TEXT REFERENCES "AdminMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permission" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AdminMenu_parentId_idx" ON "AdminMenu"("parentId");


-- ==============================================================================
-- 3. SEED INITIAL DATA (Permissions, Roles, Default Super Admin User)
-- ==============================================================================

-- Default Roles
INSERT INTO "Role" ("id", "name", "description", "updatedAt")
VALUES 
  ('role_superadmin', 'Super Admin', 'Akses penuh ke semua fitur dan modul', NOW()),
  ('role_admin', 'Admin', 'Akses semua fitur kecuali manajemen role', NOW()),
  ('role_editor', 'Editor', 'Hanya CRUD konten berita, halaman, kategori', NOW()),
  ('role_viewer', 'Viewer', 'Hanya baca data', NOW())
ON CONFLICT ("name") DO NOTHING;

-- Default Permissions
INSERT INTO "Permission" ("id", "name", "module", "action")
VALUES
  ('p_page_c', 'page.create', 'page', 'create'),
  ('p_page_r', 'page.read', 'page', 'read'),
  ('p_page_u', 'page.update', 'page', 'update'),
  ('p_page_d', 'page.delete', 'page', 'delete'),
  ('p_art_c', 'article.create', 'article', 'create'),
  ('p_art_r', 'article.read', 'article', 'read'),
  ('p_art_u', 'article.update', 'article', 'update'),
  ('p_art_d', 'article.delete', 'article', 'delete'),
  ('p_cat_c', 'category.create', 'category', 'create'),
  ('p_cat_r', 'category.read', 'category', 'read'),
  ('p_cat_u', 'category.update', 'category', 'update'),
  ('p_cat_d', 'category.delete', 'category', 'delete'),
  ('p_nav_c', 'navigation.create', 'navigation', 'create'),
  ('p_nav_r', 'navigation.read', 'navigation', 'read'),
  ('p_nav_u', 'navigation.update', 'navigation', 'update'),
  ('p_nav_d', 'navigation.delete', 'navigation', 'delete'),
  ('p_app_c', 'appearance.create', 'appearance', 'create'),
  ('p_app_r', 'appearance.read', 'appearance', 'read'),
  ('p_app_u', 'appearance.update', 'appearance', 'update'),
  ('p_app_d', 'appearance.delete', 'appearance', 'delete'),
  ('p_usr_c', 'user.create', 'user', 'create'),
  ('p_usr_r', 'user.read', 'user', 'read'),
  ('p_usr_u', 'user.update', 'user', 'update'),
  ('p_usr_d', 'user.delete', 'user', 'delete'),
  ('p_rol_c', 'role.create', 'role', 'create'),
  ('p_rol_r', 'role.read', 'role', 'read'),
  ('p_rol_u', 'role.update', 'role', 'update'),
  ('p_rol_d', 'role.delete', 'role', 'delete'),
  ('p_set_r', 'settings.read', 'settings', 'read'),
  ('p_set_u', 'settings.update', 'settings', 'update')
ON CONFLICT ("name") DO NOTHING;

-- Connect Super Admin to all permissions
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT "id", 'role_superadmin' FROM "Permission"
ON CONFLICT DO NOTHING;

-- Default Super Admin User (admin@biasristek.id / password123)
INSERT INTO "User" ("id", "name", "email", "password", "roleId", "updatedAt")
VALUES (
  'user_superadmin',
  'Super Admin',
  'admin@biasristek.id',
  '$2b$10$cAklivJNXewb7dbX5EivFO9aZfEa/iv8kwGErfu1p2ahQyISwTMjK',
  'role_superadmin',
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

-- Default Site Settings
INSERT INTO "SiteSettings" ("id", "siteName", "siteDescription", "contactEmail", "contactPhone", "address", "updatedAt")
VALUES (
  'default_settings',
  'BIAS RISTEK',
  'Badan Inovasi Akademik & Sains - Program Pengembangan Riset dan Teknologi',
  'labterpadu@ulm.ac.id',
  '+62-877-7765-9482',
  'Jl. Jend. A. Yani Km. 36, Banjarbaru, Kalimantan Selatan 70714',
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- Default Categories
INSERT INTO "Category" ("id", "name", "slug", "color", "description", "updatedAt")
VALUES 
  ('cat_1', 'Pengumuman', 'pengumuman', '#3B82F6', 'Pengumuman dan edaran resmi', NOW()),
  ('cat_2', 'Kegiatan & Event', 'kegiatan', '#10B981', 'Dokumentasi workshop dan seminar riset', NOW()),
  ('cat_3', 'Publikasi & Riset', 'publikasi-riset', '#8B5CF6', 'Laporan hasil penelitian dan inovasi', NOW())
ON CONFLICT ("slug") DO NOTHING;

-- StatCounter (Statistik Capaian Alumni)
CREATE TABLE IF NOT EXISTS "StatCounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- LearningStep (Alur Belajar & Bimbingan 4 Langkah)
CREATE TABLE IF NOT EXISTS "LearningStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Advantage (Keunggulan Kursus Riset)
CREATE TABLE IF NOT EXISTS "Advantage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Testimonial (Testimoni & Kisah Sukses Alumni)
CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "institution" TEXT,
    "content" TEXT NOT NULL,
    "avatar" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "achievement" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Faq (Pertanyaan yang Sering Diajukan)
CREATE TABLE IF NOT EXISTS "Faq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AdminMenu (Menu Dinamis Sidebar Admin)
CREATE TABLE IF NOT EXISTS "AdminMenu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "url" TEXT NOT NULL,
    "parentId" TEXT REFERENCES "AdminMenu"("id") ON DELETE SET NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permission" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AdminMenu_parentId_idx" ON "AdminMenu"("parentId");

-- Default Admin Menu Items
INSERT INTO "AdminMenu" ("id", "label", "icon", "url", "parentId", "sortOrder", "isActive", "permission", "updatedAt")
VALUES
  ('menu_dashboard', 'Dashboard', 'LayoutDashboard', '/dashboard', NULL, 1, true, NULL, NOW()),
  ('menu_halaman', 'Halaman', 'FileText', '/dashboard/halaman', NULL, 2, true, 'page.read', NOW()),
  ('menu_berita', 'Berita', 'Newspaper', '/dashboard/berita', NULL, 3, true, 'article.read', NOW()),
  ('menu_kategori', 'Kategori', 'FolderOpen', '/dashboard/kategori', NULL, 4, true, 'category.read', NOW()),
  ('menu_navigasi', 'Navigasi', 'Navigation', '/dashboard/navigasi', NULL, 5, true, 'navigation.read', NOW()),
  ('menu_tampilan', 'Tampilan', 'Palette', '#', NULL, 6, true, 'appearance.read', NOW()),
  ('menu_hero', 'Hero Section', 'Image', '/dashboard/tampilan/hero', 'menu_tampilan', 1, true, 'appearance.read', NOW()),
  ('menu_layanan', 'Program Kursus', 'Heart', '/dashboard/tampilan/layanan', 'menu_tampilan', 2, true, 'appearance.read', NOW()),
  ('menu_stat', 'Statistik Alumni', 'Users', '/dashboard/tampilan/statistik', 'menu_tampilan', 3, true, 'appearance.read', NOW()),
  ('menu_alur', 'Alur Belajar', 'Link', '/dashboard/tampilan/alur-belajar', 'menu_tampilan', 4, true, 'appearance.read', NOW()),
  ('menu_keunggulan', 'Keunggulan', 'Shield', '/dashboard/tampilan/keunggulan', 'menu_tampilan', 5, true, 'appearance.read', NOW()),
  ('menu_testimoni', 'Testimoni Alumni', 'Users', '/dashboard/tampilan/testimoni', 'menu_tampilan', 6, true, 'appearance.read', NOW()),
  ('menu_faq', 'FAQ', 'FileText', '/dashboard/tampilan/faq', 'menu_tampilan', 7, true, 'appearance.read', NOW()),
  ('menu_tampilan_berita', 'Pengaturan Berita', 'Rss', '/dashboard/tampilan/berita', 'menu_tampilan', 8, true, 'appearance.read', NOW()),
  ('menu_sosmed', 'Sosial Media', 'Share2', '/dashboard/tampilan/sosial-media', 'menu_tampilan', 9, true, 'appearance.read', NOW()),
  ('menu_pengguna', 'Pengguna', 'Users', '/dashboard/pengguna', NULL, 7, true, 'user.read', NOW()),
  ('menu_role', 'Role & Akses', 'Shield', '/dashboard/pengguna/role', NULL, 8, true, 'role.read', NOW()),
  ('menu_admin_menu', 'Menu Admin', 'Menu', '/dashboard/pengguna/menu', NULL, 9, true, 'settings.read', NOW()),
  ('menu_pengaturan', 'Pengaturan', 'Settings', '/dashboard/pengaturan', NULL, 10, true, 'settings.read', NOW())
ON CONFLICT ("id") DO UPDATE SET
  "label" = EXCLUDED."label",
  "icon" = EXCLUDED."icon",
  "url" = EXCLUDED."url",
  "parentId" = EXCLUDED."parentId",
  "sortOrder" = EXCLUDED."sortOrder",
  "isActive" = EXCLUDED."isActive",
  "permission" = EXCLUDED."permission",
  "updatedAt" = NOW();


