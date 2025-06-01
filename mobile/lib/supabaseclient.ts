import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

console.log(
  "SUPABASE_URL:",
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL
);
console.log(
  "SUPABASE_ANON_KEY:",
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
