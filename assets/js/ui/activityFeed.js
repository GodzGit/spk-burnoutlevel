/* activityFeed.js */
import { getRecentAssessments } from '../services/assessmentService.js';

/**
 * Sensor nama dengan mengambil huruf pertama tiap kata diikuti '***'
 * Contoh: "Ahmad Fauzi" -> "A*** F***"
 * @param {string} name - Nama lengkap partisipan
 * @returns {string} Nama yang disamarkan
 */
export function maskName(name) {
  if (!name) return 'M***';
  const words = name.trim().split(/\s+/);
  return words.map(word => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + '***';
  }).filter(w => w !== '').join(' ');
}

/**
 * Menghitung waktu relatif dalam Bahasa Indonesia (Timezone-safe untuk UTC+7)
 * @param {string|Date} dateString - Waktu pembuatan dari database
 * @returns {string} Selisih waktu relatif (contoh: "2 menit lalu")
 */
export function timeAgo(dateString) {
  if (!dateString) return 'baru saja';
  
  let formatted = dateString;
  
  if (typeof dateString === 'string') {
    // Ubah spasi menjadi T (misal format: YYYY-MM-DD HH:MM:SS)
    formatted = dateString.trim().replace(' ', 'T');
    
    // Pecah bagian waktu setelah karakter 'T'
    const parts = formatted.split('T');
    if (parts.length > 1) {
      const timePart = parts[1];
      // Jika bagian waktu tidak mengandung penunjuk zona waktu ('Z', '+', atau '-'),
      // asumsikan waktu tersebut disimpan dalam UTC, tambahkan 'Z' agar browser mengonversi ke waktu lokal dengan benar (UTC+7)
      if (!timePart.includes('Z') && !timePart.includes('+') && !timePart.includes('-')) {
        formatted = formatted + 'Z';
      }
    }
  }
  
  const date = new Date(formatted);
  const now = new Date();
  
  // Hitung selisih dalam milidetik
  const diffMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 0) return 'baru saja'; // Mengatasi selisih kecil jam lokal vs server
  if (seconds < 60) return 'baru saja';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

/**
 * Memperbarui UI Activity Feed modal secara dinamis dengan 10 assessment terbaru.
 * Menerapkan animasi staggered fade-in-up (bertahap ke atas) untuk tiap kartu.
 */
export async function updateActivityFeedUI() {
  const container = document.getElementById('activity-feed-container');
  if (!container) return;
  
  // Tampilkan loading spinner
  container.innerHTML = `
    <div class="flex-center" style="padding: var(--spacing-xl); flex-direction: column; gap: var(--spacing-md);">
      <div class="checklist-spinner" style="width: 40px; height: 40px; border-width: 4px;"></div>
      <p style="font-weight: 700;">Memuat aktivitas terbaru...</p>
    </div>
  `;
  
  try {
    const assessments = await getRecentAssessments(10);
    
    if (assessments.length === 0) {
      container.innerHTML = `
        <div class="flex-center" style="padding: var(--spacing-xl); text-align: center;">
          <p style="color: var(--color-gray); font-style: italic;">Belum ada aktivitas assessment saat ini.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    
    assessments.forEach((item, index) => {
      const participant = item.participants || { nama: 'Mahasiswa', prodi: 'Umum', semester: 1 };
      const masked = maskName(participant.nama);
      const relativeTime = timeAgo(item.created_at);
      
      let badgeClass = 'rendah';
      if (item.burnout_category.toLowerCase() === 'sedang') badgeClass = 'sedang';
      if (item.burnout_category.toLowerCase() === 'tinggi') badgeClass = 'tinggi';
      
      const card = document.createElement('div');
      // Terapkan kelas animasi fade-in-up
      card.className = 'card fade-in-up';
      card.style.marginBottom = 'var(--spacing-md)';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.padding = 'var(--spacing-md)';
      // Staggered delay agar muncul berurutan (misal selisih 80ms)
      card.style.animationDelay = `${index * 80}ms`;
      
      card.innerHTML = `
        <div>
          <h4 style="margin: 0; font-size: 1.1rem;">${masked}</h4>
          <p style="margin: 0; font-size: 0.85rem; color: var(--color-gray);">
            Prodi: ${participant.prodi} | Semester: ${participant.semester}
          </p>
          <span style="font-size: 0.75rem; color: var(--color-gray); display: block; margin-top: var(--spacing-xs);">
            ${relativeTime}
          </span>
        </div>
        <div class="flex-column" style="align-items: flex-end; gap: var(--spacing-xs);">
          <span style="font-weight: 800; font-size: 1.1rem; color: var(--color-black);">
            ${Math.round(item.burnout_score)}%
          </span>
          <span class="badge ${badgeClass}" style="
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            border: var(--border-width) solid var(--color-black);
            border-radius: var(--border-radius);
            background-color: ${
              badgeClass === 'rendah' ? 'var(--color-success-bg)' : 
              badgeClass === 'sedang' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)'
            };
            color: ${
              badgeClass === 'rendah' ? 'var(--color-success)' : 
              badgeClass === 'sedang' ? 'var(--color-warning)' : 'var(--color-danger)'
            };
          ">
            Burnout ${item.burnout_category}
          </span>
        </div>
      `;
      
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Gagal memuat feed aktivitas:", error);
    container.innerHTML = `
      <div class="flex-center" style="padding: var(--spacing-xl); text-align: center; flex-direction: column;">
        <p style="color: var(--color-danger); font-weight: 700;">Gagal memuat aktivitas.</p>
        <p style="font-size: 0.85rem; color: var(--color-gray);">Silakan periksa koneksi internet atau konfigurasi Supabase Anda.</p>
      </div>
    `;
  }
}

/**
 * Menambahkan satu item aktivitas baru di posisi teratas secara dinamis
 * dengan animasi slide-in, lalu membuang data terlama (ke-11) dengan animasi exit.
 * @param {Object} item - Data assessment baru hasil fuzzy
 */
export function prependNewActivity(item) {
  const container = document.getElementById('activity-feed-container');
  if (!container) return;

  // Bersihkan teks kosong / loading jika ada
  if (container.querySelector('.flex-center') || container.querySelector('p[style*="italic"]')) {
    container.innerHTML = '';
  }

  const participant = item.participants || { nama: 'Mahasiswa', prodi: 'Umum', semester: 1 };
  const masked = maskName(participant.nama);
  const relativeTime = timeAgo(item.created_at);
  
  let badgeClass = 'rendah';
  if (item.burnout_category.toLowerCase() === 'sedang') badgeClass = 'sedang';
  if (item.burnout_category.toLowerCase() === 'tinggi') badgeClass = 'tinggi';

  const card = document.createElement('div');
  card.className = 'card fade-in-up';
  card.style.marginBottom = 'var(--spacing-md)';
  card.style.display = 'flex';
  card.style.justifyContent = 'space-between';
  card.style.alignItems = 'center';
  card.style.padding = 'var(--spacing-md)';

  card.innerHTML = `
    <div>
      <h4 style="margin: 0; font-size: 1.1rem;">${masked}</h4>
      <p style="margin: 0; font-size: 0.85rem; color: var(--color-gray);">
        Prodi: ${participant.prodi} | Semester: ${participant.semester}
      </p>
      <span style="font-size: 0.75rem; color: var(--color-gray); display: block; margin-top: var(--spacing-xs);">
        ${relativeTime}
      </span>
    </div>
    <div class="flex-column" style="align-items: flex-end; gap: var(--spacing-xs);">
      <span style="font-weight: 800; font-size: 1.1rem; color: var(--color-black);">
        ${Math.round(item.burnout_score)}%
      </span>
      <span class="badge ${badgeClass}" style="
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        border: var(--border-width) solid var(--color-black);
        border-radius: var(--border-radius);
        background-color: ${
          badgeClass === 'rendah' ? 'var(--color-success-bg)' : 
          badgeClass === 'sedang' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)'
        };
        color: ${
          badgeClass === 'rendah' ? 'var(--color-success)' : 
          badgeClass === 'sedang' ? 'var(--color-warning)' : 'var(--color-danger)'
        };
      ">
        Burnout ${item.burnout_category}
      </span>
    </div>
  `;

  // Sisipkan di posisi pertama
  container.insertBefore(card, container.firstChild);

  // Jika jumlah data melebihi 10, buang data terlama di bagian bawah
  const cards = container.querySelectorAll('.card');
  if (cards.length > 10) {
    const oldestCard = cards[cards.length - 1];
    // Ganti animasi masuk dengan animasi keluar
    oldestCard.classList.remove('fade-in-up');
    oldestCard.classList.add('fade-out-down');
    
    // Hapus total dari DOM setelah durasi animasi selesai (400ms)
    setTimeout(() => {
      oldestCard.remove();
    }, 400);
  }
}

