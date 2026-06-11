/* rules.js */
/* ================================================================
 * RULE BASE — FUZZY MAMDANI (27 ATURAN)
 * ================================================================
 * File ini berisi 27 aturan fuzzy (rule base) yang merupakan
 * kombinasi dari 3 input × 3 himpunan fuzzy = 3^3 = 27 aturan.
 *
 * Format setiap aturan:
 *   IF (Beban = ...) AND (Tidur = ...) AND (Aktivitas = ...)
 *   THEN (Burnout = ...)
 *
 * Keterangan label:
 *   - Beban Akademik  : ringan, sedang, berat
 *   - Durasi Tidur     : kurang, cukup, baik
 *   - Aktivitas Non Akademik : rendah, sedang, tinggi
 *   - Output Burnout   : rendah, sedang, tinggi
 *
 * Operator AND menggunakan operasi MIN (Mamdani).
 * Agregasi menggunakan operasi MAX per kategori output.
 *
 * Sumber: Laporan penelitian terbaru (27 rules lengkap).
 * ================================================================ */

export const fuzzyRules = [
  // === Beban RINGAN (9 kombinasi) ===
  // Rule 1: Beban ringan, tidur kurang, aktivitas rendah
  { beban: 'ringan', tidur: 'kurang', aktivitas: 'rendah', output: 'sedang' },   // 1
  // Rule 2: Beban ringan, tidur kurang, aktivitas sedang
  { beban: 'ringan', tidur: 'kurang', aktivitas: 'sedang', output: 'sedang' },   // 2
  // Rule 3: Beban ringan, tidur kurang, aktivitas tinggi
  { beban: 'ringan', tidur: 'kurang', aktivitas: 'tinggi', output: 'tinggi' },   // 3
  // Rule 4: Beban ringan, tidur cukup, aktivitas rendah
  { beban: 'ringan', tidur: 'cukup', aktivitas: 'rendah', output: 'rendah' },    // 4
  // Rule 5: Beban ringan, tidur cukup, aktivitas sedang
  { beban: 'ringan', tidur: 'cukup', aktivitas: 'sedang', output: 'rendah' },    // 5
  // Rule 6: Beban ringan, tidur cukup, aktivitas tinggi
  { beban: 'ringan', tidur: 'cukup', aktivitas: 'tinggi', output: 'sedang' },    // 6
  // Rule 7: Beban ringan, tidur baik, aktivitas rendah
  { beban: 'ringan', tidur: 'baik', aktivitas: 'rendah', output: 'rendah' },     // 7
  // Rule 8: Beban ringan, tidur baik, aktivitas sedang
  { beban: 'ringan', tidur: 'baik', aktivitas: 'sedang', output: 'rendah' },     // 8
  // Rule 9: Beban ringan, tidur baik, aktivitas tinggi
  { beban: 'ringan', tidur: 'baik', aktivitas: 'tinggi', output: 'sedang' },     // 9

  // === Beban SEDANG (9 kombinasi) ===
  // Rule 10: Beban sedang, tidur kurang, aktivitas rendah
  { beban: 'sedang', tidur: 'kurang', aktivitas: 'rendah', output: 'tinggi' },   // 10
  // Rule 11: Beban sedang, tidur kurang, aktivitas sedang
  { beban: 'sedang', tidur: 'kurang', aktivitas: 'sedang', output: 'sedang' },   // 11
  // Rule 12: Beban sedang, tidur kurang, aktivitas tinggi
  { beban: 'sedang', tidur: 'kurang', aktivitas: 'tinggi', output: 'tinggi' },   // 12
  // Rule 13: Beban sedang, tidur cukup, aktivitas rendah
  { beban: 'sedang', tidur: 'cukup', aktivitas: 'rendah', output: 'sedang' },    // 13
  // Rule 14: Beban sedang, tidur cukup, aktivitas sedang
  { beban: 'sedang', tidur: 'cukup', aktivitas: 'sedang', output: 'rendah' },    // 14
  // Rule 15: Beban sedang, tidur cukup, aktivitas tinggi
  { beban: 'sedang', tidur: 'cukup', aktivitas: 'tinggi', output: 'sedang' },    // 15
  // Rule 16: Beban sedang, tidur baik, aktivitas rendah
  { beban: 'sedang', tidur: 'baik', aktivitas: 'rendah', output: 'sedang' },     // 16
  // Rule 17: Beban sedang, tidur baik, aktivitas sedang
  { beban: 'sedang', tidur: 'baik', aktivitas: 'sedang', output: 'rendah' },     // 17
  // Rule 18: Beban sedang, tidur baik, aktivitas tinggi
  { beban: 'sedang', tidur: 'baik', aktivitas: 'tinggi', output: 'sedang' },     // 18

  // === Beban BERAT (9 kombinasi) ===
  // Rule 19: Beban berat, tidur kurang, aktivitas rendah
  { beban: 'berat', tidur: 'kurang', aktivitas: 'rendah', output: 'tinggi' },    // 19
  // Rule 20: Beban berat, tidur kurang, aktivitas sedang
  { beban: 'berat', tidur: 'kurang', aktivitas: 'sedang', output: 'tinggi' },    // 20
  // Rule 21: Beban berat, tidur kurang, aktivitas tinggi
  { beban: 'berat', tidur: 'kurang', aktivitas: 'tinggi', output: 'tinggi' },    // 21
  // Rule 22: Beban berat, tidur cukup, aktivitas rendah
  { beban: 'berat', tidur: 'cukup', aktivitas: 'rendah', output: 'tinggi' },     // 22
  // Rule 23: Beban berat, tidur cukup, aktivitas sedang
  { beban: 'berat', tidur: 'cukup', aktivitas: 'sedang', output: 'sedang' },     // 23
  // Rule 24: Beban berat, tidur cukup, aktivitas tinggi
  { beban: 'berat', tidur: 'cukup', aktivitas: 'tinggi', output: 'tinggi' },     // 24
  // Rule 25: Beban berat, tidur baik, aktivitas rendah
  { beban: 'berat', tidur: 'baik', aktivitas: 'rendah', output: 'tinggi' },      // 25
  // Rule 26: Beban berat, tidur baik, aktivitas sedang
  { beban: 'berat', tidur: 'baik', aktivitas: 'sedang', output: 'sedang' },      // 26
  // Rule 27: Beban berat, tidur baik, aktivitas tinggi
  { beban: 'berat', tidur: 'baik', aktivitas: 'tinggi', output: 'tinggi' }       // 27
];
