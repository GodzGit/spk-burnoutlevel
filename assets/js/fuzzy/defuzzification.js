/* defuzzification.js */
import { getBurnoutMembership } from './membership.js';

/**
 * Calculates the crisp output score from fuzzy output values using the Centroid method (Center of Area).
 * @param {Object} aggregatedOutputs - Firing strengths for each category: { rendah, sedang, tinggi }
 * @param {number} step - Step size for discretization (default: 1.0)
 * @returns {number} Crisp score in range [0, 100]
 */
export function calculateCentroid(aggregatedOutputs, step = 1.0) {
  const alphaRendah = aggregatedOutputs.rendah;
  const alphaSedang = aggregatedOutputs.sedang;
  const alphaTinggi = aggregatedOutputs.tinggi;

  let sumNumerator = 0;
  let sumDenominator = 0;

  // Discretize output space from 0 to 100
  for (let y = 0; y <= 100; y += step) {
    const muOut = getBurnoutMembership(y);

    // Mamdani implication: clipping (min)
    const ruleRendah = Math.min(alphaRendah, muOut.rendah);
    const ruleSedang = Math.min(alphaSedang, muOut.sedang);
    const ruleTinggi = Math.min(alphaTinggi, muOut.tinggi);

    // Aggregation: max
    const muAgg = Math.max(ruleRendah, ruleSedang, ruleTinggi);

    // Summation for centroid calculation
    sumNumerator += y * muAgg;
    sumDenominator += muAgg;
  }

  // Fallback if denominator is zero (no rules fired)
  if (sumDenominator === 0) {
    return 50.0;
  }

  return sumNumerator / sumDenominator;
}

/**
 * Maps the defuzzified score to the matching Burnout category.
 * @param {number} score - Defuzzified score (0-100)
 * @returns {string} Category label: 'Rendah', 'Sedang', or 'Tinggi'
 */
export function getBurnoutCategory(score) {
  if (score <= 50) {
    return 'Rendah';
  } else if (score <= 75) {
    return 'Sedang';
  } else {
    return 'Tinggi';
  }
}
