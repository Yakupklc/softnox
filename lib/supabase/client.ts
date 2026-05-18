import { createBrowserClient } from "@supabase/ssr";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const url = rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export function createClient() {
  return createBrowserClient(url, key);
}
