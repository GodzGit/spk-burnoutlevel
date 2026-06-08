/* statistics.js */
import { getStatistics } from '../services/statisticsService.js';

/**
 * Memperbarui UI Landing Page bagian Statistik secara realtime.
 * Menghitung persentase sebaran kategori dan memperbarui grafik horizontal CSS murni.
 */
export async function updateStatisticsUI() {
  try {
    const stats = await getStatistics();
    
    // Update nilai card
    const elTotal = document.getElementById('stat-total');
    const elRendah = document.getElementById('stat-rendah');
    const elSedang = document.getElementById('stat-sedang');
    const elTinggi = document.getElementById('stat-tinggi');
    
    if (elTotal) elTotal.textContent = stats.total;
    if (elRendah) elRendah.textContent = stats.rendah;
    if (elSedang) elSedang.textContent = stats.sedang;
    if (elTinggi) elTinggi.textContent = stats.tinggi;
    
    // Hitung persentase untuk chart
    const total = stats.total || 0;
    const pctRendah = total > 0 ? Math.round((stats.rendah / total) * 100) : 0;
    const pctSedang = total > 0 ? Math.round((stats.sedang / total) * 100) : 0;
    const pctTinggi = total > 0 ? Math.round((stats.tinggi / total) * 100) : 0;
    
    // Update label persentase chart
    const valRendah = document.getElementById('chart-val-rendah');
    const valSedang = document.getElementById('chart-val-sedang');
    const valTinggi = document.getElementById('chart-val-tinggi');
    
    if (valRendah) valRendah.textContent = `${stats.rendah} Mahasiswa (${pctRendah}%)`;
    if (valSedang) valSedang.textContent = `${stats.sedang} Mahasiswa (${pctSedang}%)`;
    if (valTinggi) valTinggi.textContent = `${stats.tinggi} Mahasiswa (${pctTinggi}%)`;
    
    // Update lebar progress bar CSS
    const barRendah = document.getElementById('chart-bar-rendah');
    const barSedang = document.getElementById('chart-bar-sedang');
    const barTinggi = document.getElementById('chart-bar-tinggi');
    
    if (barRendah) barRendah.style.width = `${pctRendah}%`;
    if (barSedang) barSedang.style.width = `${pctSedang}%`;
    if (barTinggi) barTinggi.style.width = `${pctTinggi}%`;
    
  } catch (error) {
    console.error("Gagal memperbarui UI statistik:", error);
  }
}
