/* inference.js */
/* ================================================================
 * INFERENSI FUZZY MAMDANI
 * ================================================================
 * File ini menjalankan proses inti dari Fuzzy Inference System (FIS)
 * Mamdani, yang terdiri dari 3 tahap utama:
 *
 *   1. FUZZIFIKASI
 *      Mengubah nilai crisp (angka tegas) dari setiap input menjadi
 *      derajat keanggotaan di setiap himpunan fuzzy.
 *
 *   2. EVALUASI RULE (Inferensi)
 *      Mengevaluasi seluruh 27 aturan fuzzy. Untuk setiap aturan:
 *      - Ambil derajat keanggotaan input sesuai antecedent (IF-part)
 *      - Hitung kekuatan aturan (alpha/firing strength) dengan
 *        operasi AND = MIN (metode Mamdani)
 *
 *   3. AGREGASI
 *      Menggabungkan semua hasil rule yang menunjuk ke kategori
 *      output yang sama, menggunakan operasi OR = MAX.
 *
 * Input:
 *   - Beban Akademik       : 0-60 (jam/minggu)
 *   - Durasi Tidur          : 0-10 (jam/hari)
 *   - Aktivitas Non Akademik: 0-40 (jam/minggu)
 *
 * Output:
 *   - Firing strengths per kategori burnout: { rendah, sedang, tinggi }
 * ================================================================ */

import { getBebanAkademikMembership, getDurasiTidurMembership, getAktivitasNonAkademikMembership } from './membership.js';
import { fuzzyRules } from './rules.js';

/**
 * Menjalankan proses inferensi Fuzzy Mamdani secara lengkap.
 *
 * Alur proses:
 *   Input Crisp → Fuzzifikasi → Evaluasi 27 Rules → Agregasi → Output Fuzzy
 *
 * @param {number} beban     - Beban Akademik (0-60 jam/minggu)
 * @param {number} tidur     - Durasi Tidur (0-10 jam/hari)
 * @param {number} aktivitas - Aktivitas Non Akademik (0-40 jam/minggu)
 * @returns {Object} Hasil inferensi:
 *   - outputs: { rendah, sedang, tinggi } — firing strength maksimum per kategori
 *   - evaluations: Array detail evaluasi setiap rule (untuk debugging/logging)
 */
export function evaluateInference(beban, tidur, aktivitas) {
  /* ---------------------------------------------------------------
   * TAHAP 1: FUZZIFIKASI
   * Mengubah setiap input crisp menjadi derajat keanggotaan.
   *
   * Contoh: beban = 25 jam/minggu
   *   → muBeban = { ringan: 0.5, sedang: 0.5, berat: 0 }
   * --------------------------------------------------------------- */
  const muBeban = getBebanAkademikMembership(beban);
  const muTidur = getDurasiTidurMembership(tidur);
  const muAktivitas = getAktivitasNonAkademikMembership(aktivitas);

  // Variabel untuk menyimpan firing strength maksimum per kategori output
  let maxRendah = 0;
  let maxSedang = 0;
  let maxTinggi = 0;

  // Array untuk menyimpan detail evaluasi setiap rule (berguna untuk debugging)
  const ruleEvaluations = [];

  /* ---------------------------------------------------------------
   * TAHAP 2: EVALUASI RULE (27 aturan)
   * Untuk setiap aturan, hitung alpha (firing strength):
   *   alpha = MIN(mu_beban, mu_tidur, mu_aktivitas)
   *
   * Operator AND pada metode Mamdani menggunakan operasi MIN.
   * --------------------------------------------------------------- */
  fuzzyRules.forEach((rule, index) => {
    // Ambil derajat keanggotaan sesuai label di antecedent rule
    const termBeban = muBeban[rule.beban];           // misal: muBeban['ringan']
    const termTidur = muTidur[rule.tidur];           // misal: muTidur['kurang']
    const termAktivitas = muAktivitas[rule.aktivitas]; // misal: muAktivitas['rendah']

    // Hitung firing strength (alpha-cut) menggunakan operasi MIN
    const alpha = Math.min(termBeban, termTidur, termAktivitas);

    // Simpan detail evaluasi untuk referensi/debugging
    ruleEvaluations.push({
      ruleId: index + 1,
      rule,
      inputs: { termBeban, termTidur, termAktivitas },
      alpha
    });

    /* ---------------------------------------------------------------
     * TAHAP 3: AGREGASI
     * Gabungkan firing strength dari semua rule yang menunjuk ke
     * kategori output yang sama. Operasi OR = MAX.
     *
     * Contoh: Jika rule 1 → output 'sedang' (alpha=0.3)
     *         dan rule 5 → output 'sedang' (alpha=0.7)
     *         maka maxSedang = MAX(0.3, 0.7) = 0.7
     * --------------------------------------------------------------- */
    if (rule.output === 'rendah') {
      maxRendah = Math.max(maxRendah, alpha);
    } else if (rule.output === 'sedang') {
      maxSedang = Math.max(maxSedang, alpha);
    } else if (rule.output === 'tinggi') {
      maxTinggi = Math.max(maxTinggi, alpha);
    }
  });

  return {
    outputs: {
      rendah: maxRendah,
      sedang: maxSedang,
      tinggi: maxTinggi
    },
    evaluations: ruleEvaluations
  };
}
