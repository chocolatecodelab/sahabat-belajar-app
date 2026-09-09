import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase.ts";

async function checkTables() {
  console.log("Checking Supabase tables...");
  const { data: sData, error: sErr } = await supabaseAdmin.from("NotificationSettings").select("*").limit(1);
  console.log("NotificationSettings query result:", { data: sData, error: sErr });

  const { data: lData, error: lErr } = await supabaseAdmin.from("NotificationLog").select("*").limit(1);
  console.log("NotificationLog query result:", { data: lData, error: lErr });
}

checkTables().catch(console.error);
