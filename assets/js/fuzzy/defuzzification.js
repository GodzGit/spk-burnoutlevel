/* defuzzification.js */
/* ================================================================
 * DEFUZZIFIKASI — METODE CENTROID (CENTER OF AREA / COA)
 * ================================================================
 * File ini menghitung nilai output crisp (tegas) dari hasil
 * inferensi fuzzy menggunakan metode Centroid.
 *
 * Metode Centroid bekerja dengan cara:
 *   1. Diskretisasi domain output (0-100) menjadi titik-titik kecil
 *   2. Di setiap titik, hitung hasil implikasi (clipping) setiap rule
 *   3. Agregasi hasil implikasi menggunakan MAX
 *   4. Hitung pusat gravitasi (centroid) dari area yang dihasilkan
 *
 * Rumus Centroid:
 *   z* = Σ(y × μ_agg(y)) / Σ(μ_agg(y))
 *
 * Dimana:
 *   z*       = nilai output crisp (skor burnout)
 *   y        = titik diskret pada domain output
 *   μ_agg(y) = derajat keanggotaan gabungan di titik y
 * ================================================================ */

import { getBurnoutMembership } from './membership.js';

/**
 * Menghitung skor burnout crisp dari firing strengths menggunakan metode Centroid.
 *
 * Langkah-langkah:
 *   1. Loop dari y=0 sampai y=100 dengan langkah (step) tertentu
 *   2. Di setiap y, hitung membership burnout (rendah, sedang, tinggi)
 *   3. Clipping: MIN(alpha_kategori, mu_output_kategori)
 *   4. Agregasi: MAX dari semua hasil clipping
 *   5. Centroid: Σ(y × μ_agg) / Σ(μ_agg)
 *
 * @param {Object} aggregatedOutputs - Firing strengths: { rendah, sedang, tinggi }
 * @param {number} step - Ukuran langkah diskretisasi (default: 1.0, semakin kecil semakin presisi)
 * @returns {number} Skor burnout crisp dalam rentang [0, 100]
 */
export function calculateCentroid(aggregatedOutputs, step = 1.0) {
  const alphaRendah = aggregatedOutputs.rendah;
  const alphaSedang = aggregatedOutputs.sedang;
  const alphaTinggi = aggregatedOutputs.tinggi;

  let sumNumerator = 0;   // Pembilang: Σ(y × μ_agg(y))
  let sumDenominator = 0;  // Penyebut:  Σ(μ_agg(y))

  // Diskretisasi domain output burnout dari 0 sampai 100
  for (let y = 0; y <= 100; y += step) {
    // Hitung derajat keanggotaan output di titik y
    const muOut = getBurnoutMembership(y);

    // Implikasi Mamdani: clipping (operasi MIN)
    // Memotong fungsi keanggotaan output pada level alpha masing-masing rule
    const ruleRendah = Math.min(alphaRendah, muOut.rendah);
    const ruleSedang = Math.min(alphaSedang, muOut.sedang);
    const ruleTinggi = Math.min(alphaTinggi, muOut.tinggi);

    // Agregasi: gabungkan semua hasil implikasi dengan operasi MAX
    const muAgg = Math.max(ruleRendah, ruleSedang, ruleTinggi);

    // Akumulasi untuk perhitungan centroid
    sumNumerator += y * muAgg;
    sumDenominator += muAgg;
  }

  // Jika tidak ada rule yang terpicu (denominator = 0),
  // kembalikan nilai tengah domain sebagai fallback
  if (sumDenominator === 0) {
    return 50.0;
  }

  // Hitung dan kembalikan nilai centroid
  return sumNumerator / sumDenominator;
}

/**
 * Memetakan skor defuzzifikasi ke kategori burnout berdasarkan
 * crossover point fungsi keanggotaan output.
 *
 * Threshold ditentukan dari titik potong (crossover) antar membership:
 *   - Rendah : trapmf [0, 0, 40, 50]   → dominan di skor < 50
 *   - Sedang : trimf  [40, 55, 70]     → dominan di skor 50-70
 *   - Tinggi : trapmf [60, 75, 100, 100] → dominan di skor > 70
 *
 * @param {number} score - Skor burnout hasil defuzzifikasi (0-100)
 * @returns {string} Kategori burnout: 'Rendah', 'Sedang', atau 'Tinggi'
 */
export function getBurnoutCategory(score) {
  if (score < 50) {
    return 'Rendah';
  } else if (score <= 70) {
    return 'Sedang';
  } else {
    return 'Tinggi';
  }
}
