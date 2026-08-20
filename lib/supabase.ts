import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yhxtwpcxfimeljpcuwvd.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: (typeof window === "undefined" ? WebSocket : undefined) as any,
  },
};

// Public Supabase Client (Anon)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

// Admin Supabase Client (Service Role for Server Actions / NextAuth)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, clientOptions);
