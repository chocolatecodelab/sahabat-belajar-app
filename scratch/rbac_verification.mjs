import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase.ts";
import {
  syncDatabasePermissions,
  ALL_SYSTEM_PERMISSIONS,
  SYSTEM_MODULES,
  STANDARD_ROLES,
} from "../lib/rbac_registry.ts";
import {
  getRoles,
  getAllPermissions,
  createRole,
  updateRole,
  deleteRole,
  getUsers,
} from "../actions/pengguna.ts";
import { getAdminMenus } from "../actions/menu.ts";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName} ${details ? `-> ${details}` : ""}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} ${details ? `-> ${details}` : ""}`);
  }
}

async function runRBACVerificationSuite() {
  console.log("\n================================================================================");
  console.log("🛡️ BIAS RISTEK DYNAMIC RBAC & ROLE MATRIX VERIFICATION SUITE");
  console.log("================================================================================\n");

  // ============================================================================
  // 1. PERMISSION CATALOG & DATABASE SYNC
  // ============================================================================
  console.log("🧪 [FASE 1] Sinkronisasi Database & Katalog 16 Modul Permissions");

  const syncRes = await syncDatabasePermissions();
  assert(syncRes.success, "1.1 Database permissions catalog synchronization runs cleanly");

  const allPerms = await getAllPermissions();
  assert(
    allPerms.length >= ALL_SYSTEM_PERMISSIONS.length,
    "1.2 All 48+ granular permissions registered in Permission table",
    `Total: ${allPerms.length} permissions`
  );

  const modulesCovered = new Set(allPerms.map((p) => p.module));
  assert(
    modulesCovered.size >= 16,
    "1.3 All 16 functional modules covered in permission catalog",
    `Modules: ${Array.from(modulesCovered).join(", ")}`
  );

  // Check specific essential module permissions
  const hasCoursePerm = allPerms.some((p) => p.name === "course.update");
  const hasRegPerm = allPerms.some((p) => p.name === "registration.update");
  const hasSubPerm = allPerms.some((p) => p.name === "submission.review");
  const hasCertPerm = allPerms.some((p) => p.name === "certificate.create");
  const hasPayPerm = allPerms.some((p) => p.name === "payment_account.update");

  assert(
    hasCoursePerm && hasRegPerm && hasSubPerm && hasCertPerm && hasPayPerm,
    "1.4 Specific new module permissions (course, registration, submission, certificate, payment_account) exist"
  );

  // ============================================================================
  // 2. RETRIEVAL OF SYSTEM ROLES & INTEGRATED PIVOTS
  // ============================================================================
  console.log("\n🧪 [FASE 2] Query Data Role & Resolusi Hak Akses Dinamis");

  const roles = await getRoles();
  assert(roles.length >= 6, "2.1 Retrieve all standard system roles from database", `Total: ${roles.length} roles`);

  const superAdminRole = roles.find((r) => r.id === "role_superadmin" || r.name === "Super Admin");
  assert(
    !!superAdminRole && superAdminRole.permissions.length >= 30,
    "2.2 Super Admin role has comprehensive permissions assigned",
    `Permissions count: ${superAdminRole?.permissions?.length}`
  );

  const mentorRole = roles.find((r) => r.id === "role_mentor" || r.name === "Mentor Riset");
  assert(
    !!mentorRole && mentorRole.permissions.length >= 10,
    "2.3 Mentor Riset role resolved with course, submission, certificate permissions",
    `Permissions count: ${mentorRole?.permissions?.length}`
  );

  const editorRole = roles.find((r) => r.id === "role_editor" || r.name === "Editor");
  assert(
    !!editorRole && editorRole.permissions.length >= 10,
    "2.4 Editor role resolved with content publishing permissions",
    `Permissions count: ${editorRole?.permissions?.length}`
  );

  // ============================================================================
  // 3. DYNAMIC ROLE CREATION WITH ATOMIC PIVOT SYNC
  // ============================================================================
  console.log("\n🧪 [FASE 3] Pembuatan Role Kustom Dinamis & Sinkronisasi Pivot");

  const customRoleName = `Staf Verifikator Riset QA ${Date.now()}`;
  const targetPermNames = ["dashboard.read", "registration.read", "registration.update", "media.read"];
  const targetPermIds = allPerms
    .filter((p) => targetPermNames.includes(p.name))
    .map((p) => p.id);

  const createForm = new FormData();
  createForm.set("name", customRoleName);
  createForm.set("description", "Role kustom untuk memverifikasi berkas pembayaran transaksi pendaftaran");
  targetPermIds.forEach((pId) => createForm.append("permissions", pId));

  const createRes = await createRole(createForm);
  assert(createRes.success && !!createRes.data?.id, "3.1 Custom role created with selective permissions", `Role ID: ${createRes.data?.id}`);
  const customRoleId = createRes.data?.id;

  // Verify created role in getRoles()
  const refreshedRoles = await getRoles();
  const foundCreated = refreshedRoles.find((r) => r.id === customRoleId);
  assert(
    !!foundCreated && foundCreated.permissions.length === targetPermIds.length,
    "3.2 Custom role accurately reflects assigned permissions via _PermissionToRole",
    `Permissions assigned: ${foundCreated?.permissions?.map((p) => p.name).join(", ")}`
  );

  // ============================================================================
  // 4. ATOMIC UPDATE OF ROLE PERMISSIONS
  // ============================================================================
  console.log("\n🧪 [FASE 4] Update Hak Akses Role Dinamis");

  const updatedTargetPermNames = ["dashboard.read", "registration.read", "registration.update", "course.read", "submission.read"];
  const updatedTargetPermIds = allPerms
    .filter((p) => updatedTargetPermNames.includes(p.name))
    .map((p) => p.id);

  const updateForm = new FormData();
  updateForm.set("name", customRoleName);
  updateForm.set("description", "Deskripsi telah diperbarui dengan hak akses tambahan (course.read & submission.read)");
  updatedTargetPermIds.forEach((pId) => updateForm.append("permissions", pId));

  const updateRes = await updateRole(customRoleId, updateForm);
  assert(updateRes.success, "4.1 Update custom role permissions executed cleanly");

  const rolesAfterUpdate = await getRoles();
  const foundUpdated = rolesAfterUpdate.find((r) => r.id === customRoleId);
  assert(
    !!foundUpdated && foundUpdated.permissions.length === updatedTargetPermIds.length,
    "4.2 Pivot records in _PermissionToRole updated atomically to new permissions set",
    `Updated permissions count: ${foundUpdated?.permissions?.length}`
  );

  // ============================================================================
  // 5. SECURITY GUARDRAILS & CLEAN DELETION
  // ============================================================================
  console.log("\n🧪 [FASE 5] Proteksi Keamanan Role Sistem & Hapus Role Kustom");

  // Try deleting Super Admin (must be forbidden)
  const delSuperRes = await deleteRole("role_superadmin");
  assert(!delSuperRes.success, "5.1 System Super Admin role is protected from deletion");

  // Try deleting Mentor Riset (must be protected)
  const delMentorRes = await deleteRole("role_mentor");
  assert(!delMentorRes.success, "5.2 System Mentor Riset role is protected from deletion");

  // Delete our temporary custom role
  const delCustomRes = await deleteRole(customRoleId);
  assert(delCustomRes.success, "5.3 Custom role deleted permanently with cascade cleanup");

  // Verify pivot table records cleaned
  const { data: orphanPivots } = await supabaseAdmin
    .from("_PermissionToRole")
    .select("*")
    .eq("B", customRoleId);
  assert((orphanPivots || []).length === 0, "5.4 Pivot table _PermissionToRole records purged cleanly for deleted role");

  // ============================================================================
  // 6. ADMIN MENUS & PERMISSION BINDING
  // ============================================================================
  console.log("\n🧪 [FASE 6] Integrasi Menu Admin Dinamis dengan RBAC");

  const adminMenus = await getAdminMenus();
  assert(adminMenus.length >= 10, "6.1 Retrieve all top-level dynamic admin menus");

  const courseMenu = adminMenus.find((m) => m.id === "menu_kursus");
  assert(courseMenu?.permission === "course.read", "6.2 Program Kursus menu bound to 'course.read' permission");

  const regMenu = adminMenus.find((m) => m.id === "menu_pendaftaran");
  assert(regMenu?.permission === "registration.read", "6.3 Pendaftaran menu bound to 'registration.read' permission");

  const taskMenu = adminMenus.find((m) => m.id === "menu_tugas");
  assert(taskMenu?.permission === "submission.read", "6.4 Review Draf Naskah menu bound to 'submission.read' permission");

  const mediaMenu = adminMenus.find((m) => m.id === "menu_media");
  assert(mediaMenu?.permission === "media.read", "6.5 Media Library menu bound to 'media.read' permission");

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`📊 RBAC VERIFICATION RESULT: ${passedTests}/${totalTests} TESTS PASSED (${passedTests === totalTests ? "100% SUKSES" : "ADA KEGAGALAN"})`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRBACVerificationSuite().catch((err) => {
  console.error("RBAC Verification Fatal Error:", err);
  process.exit(1);
});
