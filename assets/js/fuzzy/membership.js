/* membership.js */
/**
 * Triangle Membership Function (trimf)
 * @param {number} x - The input value to fuzzify
 * @param {number} a - Lower limit boundary
 * @param {number} b - Peak point (membership = 1.0)
 * @param {number} c - Upper limit boundary
 * @returns {number} Membership degree [0, 1]
 */
export function trimf(x, a, b, c) {
  if (x < a) return 0;
  if (x >= a && x < b) {
    return (b - a === 0) ? 1 : (x - a) / (b - a);
  }
  if (x >= b && x <= c) {
    if (c - b === 0) return 1;
    return (c - x) / (c - b);
  }
  return 0;
}

/**
 * Fuzzifikasi Beban Akademik
 * Range: 0 - 100
 * - Rendah: [0, 0, 50]
 * - Sedang: [25, 50, 75]
 * - Tinggi: [50, 100, 100]
 */
export function getBebanAkademikMembership(x) {
  return {
    rendah: trimf(x, 0, 0, 50),
    sedang: trimf(x, 25, 50, 75),
    tinggi: trimf(x, 50, 100, 100)
  };
}

/**
 * Fuzzifikasi Durasi Tidur
 * Range: 0 - 12 jam
 * - Rendah: [0, 0, 5]
 * - Sedang: [3, 6, 9]
 * - Tinggi: [7, 12, 12]
 */
export function getDurasiTidurMembership(x) {
  return {
    rendah: trimf(x, 0, 0, 5),
    sedang: trimf(x, 3, 6, 9),
    tinggi: trimf(x, 7, 12, 12)
  };
}

/**
 * Fuzzifikasi Aktivitas Non Akademik
 * Range: 0 - 100
 * - Rendah: [0, 0, 50]
 * - Sedang: [25, 50, 75]
 * - Tinggi: [50, 100, 100]
 */
export function getAktivitasNonAkademikMembership(x) {
  return {
    rendah: trimf(x, 0, 0, 50),
    sedang: trimf(x, 25, 50, 75),
    tinggi: trimf(x, 50, 100, 100)
  };
}

/**
 * Fuzzifikasi Output Burnout (untuk referensi defuzzifikasi)
 * Range: 0 - 100
 * - Rendah: [0, 0, 50]
 * - Sedang: [25, 50, 75]
 * - Tinggi: [50, 100, 100]
 */
export function getBurnoutMembership(y) {
  return {
    rendah: trimf(y, 0, 0, 50),
    sedang: trimf(y, 25, 50, 75),
    tinggi: trimf(y, 50, 100, 100)
  };
}
