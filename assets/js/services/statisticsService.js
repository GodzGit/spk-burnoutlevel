/* statisticsService.js */
import { supabase, isConfigured } from '../config/supabase.js';

/**
 * Mengambil ringkasan statistik dari database (atau LocalStorage fallback).
 * Menghitung total data dan jumlah untuk masing-masing kategori burnout.
 * @returns {Promise<Object>} Data statistik { total, rendah, sedang, tinggi }
 */
export async function getStatistics() {
  if (isConfigured() && supabase) {
    try {
      const [allRes, rendahRes, sedangRes, tinggiRes] = await Promise.all([
        supabase.from('assessments').select('*', { count: 'exact', head: true }),
        supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('burnout_category', 'Rendah'),
        supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('burnout_category', 'Sedang'),
        supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('burnout_category', 'Tinggi')
      ]);

      if (allRes.error || rendahRes.error || sedangRes.error || tinggiRes.error) {
        throw new Error("Gagal mengambil statistik dari Supabase");
      }

      return {
        total: allRes.count || 0,
        rendah: rendahRes.count || 0,
        sedang: sedangRes.count || 0,
        tinggi: tinggiRes.count || 0
      };
    } catch (error) {
      console.error("Kesalahan fetch statistik:", error);
      // Jika error server, berikan fallback kosong
      return { total: 0, rendah: 0, sedang: 0, tinggi: 0 };
    }
  } else {
    // Fallback LocalStorage untuk local development
    const stored = localStorage.getItem('spk_assessments');
    const assessments = stored ? JSON.parse(stored) : [];
    
    const rendah = assessments.filter(a => a.burnout_category === 'Rendah').length;
    const sedang = assessments.filter(a => a.burnout_category === 'Sedang').length;
    const tinggi = assessments.filter(a => a.burnout_category === 'Tinggi').length;
    
    return {
      total: assessments.length,
      rendah,
      sedang,
      tinggi
    };
  }
}
