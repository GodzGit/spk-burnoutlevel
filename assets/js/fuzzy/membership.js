/* membership.js */
/* ================================================================
 * FUNGSI KEANGGOTAAN (MEMBERSHIP FUNCTIONS) — FUZZY MAMDANI
 * ================================================================
 * File ini berisi fungsi-fungsi untuk menghitung derajat keanggotaan
 * (membership degree) dari setiap input crisp ke dalam himpunan fuzzy.
 *
 * Terdapat 2 jenis fungsi keanggotaan yang digunakan:
 *   1. Triangular Membership Function (trimf)  → bentuk segitiga
 *   2. Trapezoidal Membership Function (trapmf) → bentuk trapesium
 *
 * Setiap kriteria input memiliki 3 himpunan fuzzy (linguistic variable),
 * dan output burnout juga memiliki 3 himpunan fuzzy.
 *
 * Parameter diambil dari laporan penelitian terbaru.
 * ================================================================ */

/**
 * Triangular Membership Function (trimf)
 * Bentuk segitiga dengan 3 parameter: a, b, c
 *
 *        1.0  ___
 *            /   \
 *           /     \
 *          /       \
 *    0.0 _/         \_
 *        a    b    c
 *
 * @param {number} x - Nilai input crisp yang akan di-fuzzifikasi
 * @param {number} a - Titik awal (kaki kiri), membership = 0
 * @param {number} b - Titik puncak (tengah), membership = 1
 * @param {number} c - Titik akhir (kaki kanan), membership = 0
 * @returns {number} Derajat keanggotaan dalam rentang [0, 1]
 */
export function trimf(x, a, b, c) {
  // Jika x berada di luar rentang [a, c], derajat keanggotaan = 0
  if (x <= a || x >= c) return 0;

  // Jika x berada di sisi naik (antara a dan b)
  // Hitung interpolasi linear dari 0 ke 1
  if (x > a && x <= b) {
    return (b - a === 0) ? 1 : (x - a) / (b - a);
  }

  // Jika x berada di sisi turun (antara b dan c)
  // Hitung interpolasi linear dari 1 ke 0
  if (x > b && x < c) {
    return (c - b === 0) ? 1 : (c - x) / (c - b);
  }

  return 0;
}

/**
 * Trapezoidal Membership Function (trapmf)
 * Bentuk trapesium dengan 4 parameter: a, b, c, d
 *
 *        1.0  ________
 *            /        \
 *           /          \
 *          /            \
 *    0.0 _/              \_
 *        a   b      c   d
 *
 * Catatan: Jika a == b, maka sisi kiri langsung bernilai 1 (tanpa sisi naik).
 *          Jika c == d, maka sisi kanan langsung bernilai 1 (tanpa sisi turun).
 *          Ini berguna untuk membuat fungsi keanggotaan "terbuka" di tepi domain.
 *
 * @param {number} x - Nilai input crisp yang akan di-fuzzifikasi
 * @param {number} a - Titik awal kaki kiri, membership = 0
 * @param {number} b - Titik awal puncak datar kiri, membership = 1
 * @param {number} c - Titik akhir puncak datar kanan, membership = 1
 * @param {number} d - Titik akhir kaki kanan, membership = 0
 * @returns {number} Derajat keanggotaan dalam rentang [0, 1]
 */
export function trapmf(x, a, b, c, d) {
  // Jika x berada di luar rentang [a, d], derajat keanggotaan = 0
  if (x <= a || x >= d) {
    // Kasus khusus: jika a == b (tepi kiri terbuka) dan x == a, membership = 1
    if (a === b && x === a) return 1;
    // Kasus khusus: jika c == d (tepi kanan terbuka) dan x == d, membership = 1
    if (c === d && x === d) return 1;
    if (x < a || x > d) return 0;
  }

  // Sisi naik: interpolasi linear dari 0 ke 1 antara a dan b
  if (x > a && x < b) {
    return (b - a === 0) ? 1 : (x - a) / (b - a);
  }

  // Puncak datar: membership = 1 antara b dan c (inklusif)
  if (x >= b && x <= c) {
    return 1;
  }

  // Sisi turun: interpolasi linear dari 1 ke 0 antara c dan d
  if (x > c && x < d) {
    return (d - c === 0) ? 1 : (d - x) / (d - c);
  }

  return 0;
}


/* ================================================================
 * FUZZIFIKASI KRITERIA INPUT
 * ================================================================
 * Setiap fungsi di bawah menerima nilai crisp dan mengembalikan
 * objek berisi derajat keanggotaan untuk setiap himpunan fuzzy.
 * ================================================================ */

/**
 * Fuzzifikasi Beban Akademik
 * Domain: 0 - 60 (jam/minggu)
 * Total waktu belajar, tugas, praktikum, dan aktivitas akademik per minggu.
 *
 * Himpunan Fuzzy:
 *   - Ringan : trapmf [0, 0, 20, 30]  → beban akademik rendah
 *   - Sedang : trimf  [20, 30, 40]    → beban akademik menengah
 *   - Berat  : trapmf [30, 40, 60, 60] → beban akademik tinggi
 *
 * @param {number} x - Nilai beban akademik (0-60 jam/minggu)
 * @returns {Object} { ringan, sedang, berat } — derajat keanggotaan tiap himpunan
 */
export function getBebanAkademikMembership(x) {
  return {
    ringan: trapmf(x, 0, 0, 20, 30),
    sedang: trimf(x, 20, 30, 40),
    berat:  trapmf(x, 30, 40, 60, 60)
  };
}

/**
 * Fuzzifikasi Durasi Tidur
 * Domain: 0 - 10 (jam/hari)
 * Rata-rata jam tidur per hari.
 *
 * Himpunan Fuzzy:
 *   - Kurang : trapmf [0, 0, 5, 6]    → tidur kurang / tidak cukup
 *   - Cukup  : trimf  [5, 6, 7]       → tidur cukup / normal
 *   - Baik   : trapmf [6, 7, 10, 10]  → tidur baik / berkualitas
 *
 * @param {number} x - Nilai durasi tidur (0-10 jam/hari)
 * @returns {Object} { kurang, cukup, baik } — derajat keanggotaan tiap himpunan
 */
export function getDurasiTidurMembership(x) {
  return {
    kurang: trapmf(x, 0, 0, 5, 6),
    cukup:  trimf(x, 5, 6, 7),
    baik:   trapmf(x, 6, 7, 10, 10)
  };
}

/**
 * Fuzzifikasi Aktivitas Non Akademik
 * Domain: 0 - 40 (jam/minggu)
 * Total waktu organisasi, kepanitiaan, komunitas, atau kerja paruh waktu per minggu.
 *
 * Himpunan Fuzzy:
 *   - Rendah : trapmf [0, 0, 10, 15]    → aktivitas sedikit
 *   - Sedang : trimf  [10, 17.5, 25]    → aktivitas menengah
 *   - Tinggi : trapmf [20, 25, 40, 40]  → aktivitas banyak
 *
 * @param {number} x - Nilai aktivitas non akademik (0-40 jam/minggu)
 * @returns {Object} { rendah, sedang, tinggi } — derajat keanggotaan tiap himpunan
 */
export function getAktivitasNonAkademikMembership(x) {
  return {
    rendah: trapmf(x, 0, 0, 10, 15),
    sedang: trimf(x, 10, 17.5, 25),
    tinggi: trapmf(x, 20, 25, 40, 40)
  };
}


/* ================================================================
 * FUZZIFIKASI OUTPUT BURNOUT
 * ================================================================
 * Fungsi ini digunakan pada tahap DEFUZZIFIKASI (metode Centroid).
 * Saat menghitung centroid, kita perlu mengetahui derajat keanggotaan
 * output burnout di setiap titik diskret dalam domain [0, 100].
 * ================================================================ */

/**
 * Fuzzifikasi Output Burnout
 * Domain: 0 - 100 (skor persentase)
 *
 * Himpunan Fuzzy:
 *   - Rendah : trapmf [0, 0, 40, 50]      → burnout rendah
 *   - Sedang : trimf  [40, 55, 70]        → burnout sedang
 *   - Tinggi : trapmf [60, 75, 100, 100]  → burnout tinggi
 *
 * @param {number} y - Nilai output burnout (0-100)
 * @returns {Object} { rendah, sedang, tinggi } — derajat keanggotaan tiap himpunan
 */
export function getBurnoutMembership(y) {
  return {
    rendah: trapmf(y, 0, 0, 40, 50),
    sedang: trimf(y, 40, 55, 70),
    tinggi: trapmf(y, 60, 75, 100, 100)
  };
}
