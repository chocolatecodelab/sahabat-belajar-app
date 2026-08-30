import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase.ts";

async function main() {
  const { data: perms } = await supabaseAdmin.from("Permission").select("*");
  console.log("=== PERMISSIONS COUNT:", perms?.length || 0);
  console.log(JSON.stringify(perms, null, 2));

  const { data: roles } = await supabaseAdmin.from("Role").select(`
    id,
    name,
    description,
    permissions:Permission(id, name)
  `);
  console.log("=== ROLES COUNT:", roles?.length || 0);
  console.log(JSON.stringify(roles, null, 2));

  const { data: pivot } = await supabaseAdmin.from("_PermissionToRole").select("*");
  console.log("=== PIVOT _PermissionToRole COUNT:", pivot?.length || 0);
  console.log(JSON.stringify(pivot, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
