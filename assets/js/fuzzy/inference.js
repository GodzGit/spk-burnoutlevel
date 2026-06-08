/* inference.js */
import { getBebanAkademikMembership, getDurasiTidurMembership, getAktivitasNonAkademikMembership } from './membership.js';
import { fuzzyRules } from './rules.js';

/**
 * Executes the Mamdani fuzzy inference logic.
 * @param {number} beban - Beban Akademik input (0-100)
 * @param {number} tidur - Durasi Tidur input (0-12)
 * @param {number} aktivitas - Aktivitas Non Akademik input (0-100)
 * @returns {Object} Firing strengths per output category (rendah, sedang, tinggi)
 */
export function evaluateInference(beban, tidur, aktivitas) {
  // 1. Fuzzification
  const muBeban = getBebanAkademikMembership(beban);
  const muTidur = getDurasiTidurMembership(tidur);
  const muAktivitas = getAktivitasNonAkademikMembership(aktivitas);

  // Firing strengths for output classes
  let maxRendah = 0;
  let maxSedang = 0;
  let maxTinggi = 0;

  const ruleEvaluations = [];

  // 2. Rule Evaluation (Mamdani AND = MIN)
  fuzzyRules.forEach((rule, index) => {
    const termBeban = muBeban[rule.beban];
    const termTidur = muTidur[rule.tidur];
    const termAktivitas = muAktivitas[rule.aktivitas];

    // Compute firing strength (alpha-cut) using MIN
    const alpha = Math.min(termBeban, termTidur, termAktivitas);

    ruleEvaluations.push({
      ruleId: index + 1,
      rule,
      inputs: { termBeban, termTidur, termAktivitas },
      alpha
    });

    // 3. Aggregation (Mamdani OR = MAX per category)
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
