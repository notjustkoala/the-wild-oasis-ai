import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://jvuiesosyxjepelfbgcq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dWllc29zeXhqZXBlbGZiZ2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzM2NzUsImV4cCI6MjA3MjkwOTY3NX0.0widu17Pvg1T-Rty2XJLtcICj4-uC366PUh71GmaeMI";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
