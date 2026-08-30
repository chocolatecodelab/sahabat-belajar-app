import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase.ts";

async function main() {
  const { data: roles, error: rErr } = await supabaseAdmin.from("Role").select("*");
  console.log("ROLES:", roles, rErr);

  const { data: pivot, error: pErr } = await supabaseAdmin.from("_PermissionToRole").select("*");
  console.log("PIVOT SAMPLE:", pivot?.slice(0, 5), "Total pivot:", pivot?.length);

  process.exit(0);
}

main();
