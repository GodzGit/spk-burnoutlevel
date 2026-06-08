/* modal.js */
/**
 * Membuka modal overlay dan mengunci scrolling pada body
 * @param {string} modalId - ID dari elemen modal overlay
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Menutup modal overlay dan mengembalikan scrolling pada body
 * @param {string} modalId - ID dari elemen modal overlay
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Inisialisasi event listener dasar untuk modal
 * Menutup modal saat tombol close diklik atau saat area overlay luar diklik
 */
export function initModals() {
  const overlays = document.querySelectorAll('.modal-overlay');
  
  overlays.forEach(overlay => {
    const closeButtons = overlay.querySelectorAll('.modal-close');
    const content = overlay.querySelector('.modal-content');
    
    // Klik semua tombol close
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(overlay.id);
      });
    });
    
    // Klik di luar area modal content (pada overlay background)
    overlay.addEventListener('click', (e) => {
      if (content && !content.contains(e.target)) {
        closeModal(overlay.id);
      }
    });
  });
}
