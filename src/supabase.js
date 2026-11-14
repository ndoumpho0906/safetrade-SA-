import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
try {
const { error } = await supabase.auth.getSession();

if (error) {
console.error("Supabase connection error:", error.message);
return;
}

console.log("SafeTrade is connected to Supabase!");
} catch (error) {
console.error("Connection failed:", error.message);
}
}