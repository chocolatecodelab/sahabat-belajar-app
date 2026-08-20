export const APP_NAME = "BIAS RISTEK";
export const APP_DESCRIPTION =
  "Badan Inovasi Akademik & Sains - Program Pengembangan Riset dan Teknologi";

export const ITEMS_PER_PAGE = 10;

export const PAGE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ARTICLE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const NAV_TYPE_LABELS: Record<string, string> = {
  LINK: "Link",
  PAGE: "Halaman",
  CATEGORY: "Kategori",
  EXTERNAL: "External URL",
};

export const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter / X" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
] as const;

export const PERMISSION_MODULES = [
  "page",
  "article",
  "category",
  "navigation",
  "appearance",
  "user",
  "role",
  "settings",
] as const;

export const PERMISSION_ACTIONS = ["create", "read", "update", "delete"] as const;

export const DEFAULT_ROLES = [
  {
    name: "Super Admin",
    description: "Akses penuh ke semua fitur",
  },
  {
    name: "Admin",
    description: "Akses semua fitur kecuali kelola role & permission",
  },
  {
    name: "Editor",
    description: "Hanya CRUD konten (halaman, berita, kategori)",
  },
  {
    name: "Viewer",
    description: "Hanya baca semua konten",
  },
] as const;

export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const UPLOAD_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
