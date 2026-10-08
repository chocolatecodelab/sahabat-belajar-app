import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase.ts";

async function main() {
  console.log("Checking AdminMenu in Supabase...");
  const { data, error } = await supabaseAdmin.from("AdminMenu").select("*");
  if (error) {
    console.error("Error fetching menus:", error);
    return;
  }
  console.log("Current menus count:", data.length);
  const target = data.find((m) => m.id === "menu_penjadwalan");
  console.log("Current menu_penjadwalan:", target);

  if (target && target.label !== "Penjadwalan Tutor") {
    console.log("Updating menu_penjadwalan label to 'Penjadwalan Tutor'...");
    const { error: updateErr } = await supabaseAdmin
      .from("AdminMenu")
      .update({ label: "Penjadwalan Tutor" })
      .eq("id", "menu_penjadwalan");
    if (updateErr) {
      console.error("Failed to update:", updateErr);
    } else {
      console.log("Successfully updated menu_penjadwalan label to 'Penjadwalan Tutor'!");
    }
  } else {
    console.log("menu_penjadwalan is already updated or not found.");
  }
}

main().catch(console.error);
