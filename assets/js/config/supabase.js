/* supabase.js */
// Konfigurasi Supabase
export const SUPABASE_URL = "faaucfblipbwqmtjcdpp.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYXVjZmJsaXBid3FtdGpjZHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTQyMDQsImV4cCI6MjA5NjQ5MDIwNH0.-2apY8GElii2oKlYojNhGLy9j7R9XTMbd-55hcrozvw";

// Check apakah credential sudah dikonfigurasi
export const isConfigured = () => {
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== "" &&
    SUPABASE_ANON_KEY !== "" &&
    SUPABASE_URL.trim() !== "" &&
    SUPABASE_ANON_KEY.trim() !== ""
  );
};

// Buat client jika credentials valid
let supabaseClient = null;
if (isConfigured() && window.supabase) {
  try {
    // Pastikan URL memiliki skema http/https
    let formattedUrl = SUPABASE_URL.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }
    supabaseClient = window.supabase.createClient(formattedUrl, SUPABASE_ANON_KEY.trim());
  } catch (error) {
    console.error("Gagal inisialisasi Supabase:", error);
  }
}

export const supabase = supabaseClient;
export const getClient = () => supabaseClient;
export { supabaseClient };
