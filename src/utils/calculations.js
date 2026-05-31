import { cos, sin, pi, abs, round, evaluate, re } from 'mathjs';

export function calculateCurve(params) {
  const { curveType, a, b, n, func, operator } = params;
  if (curveType === 'rose') {
    return calculateRose(a, n, func);
  } else {
    return calculateLimacon(a, b, func, operator);
  }
}

function calculateRose(a, n, func) {
  const isOdd = Math.abs(n % 2) === 1;
  const end = isOdd ? pi : 2 * pi;
  const steps = 720;
  const step = end / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const theta = i * step;
    const angle = n * theta;
    const r = func === 'sin' ? a * sin(angle) : a * cos(angle);
    data.push({ theta: re(theta), r: re(r) });
  }

  return { data, period: re(end) };
}

function calculateLimacon(a, b, func, operator) {
  const steps = 720;
  const step = (2 * pi) / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const theta = i * step;
    const trigVal = func === 'sin' ? sin(theta) : cos(theta);
    let r;
    if (operator === '+') {
      r = a + b * trigVal;
    } else {
      r = a - b * trigVal;
    }
    data.push({ theta: re(theta), r: re(r) });
  }

  return { data, period: re(2 * pi) };
}

/**
 * Extracts points whose radius is effectively an integer and returns unique theta–radius pairs.
 *
 * Scans `data` for points where `r` rounded to two decimals is within `tolerance` of an integer, rounds that radius to the nearest integer, and omits points whose `theta` is within 0.001 of an already-included theta.
 * @param {Array<{theta: number, r: number}>} data - Array of points with numeric `theta` and `r`.
 * @param {number} [tolerance=0.01] - Maximum allowed difference between the rounded radius and the nearest integer.
 * @returns {Array<{theta: number, r: number}>} An array of points containing the original `theta` and the integer `r` (rounded), with no two returned points having `theta` values closer than 0.001.
 */
export function extractWholeNumberPairs(data, tolerance = 0.01) {
  const result = [];
  for (const point of data) {
    const rounded = round(point.r, 2);
    if (abs(rounded - round(rounded)) < tolerance) {
      const alreadyExists = result.some(
        (p) => abs(p.theta - point.theta) < 0.001
      );
      if (!alreadyExists) {
        result.push({
          theta: point.theta,
          r: round(rounded),
        });
      }
    }
  }
  return result;
}

/**
 * Selects points whose rounded radius equals the rounded minimum, the rounded value closest to zero, or the rounded maximum.
 *
 * Filters the input array of polar points to keep only those whose Math.round(r) matches one of three representative radii: the smallest rounded r, the rounded r nearest zero (by absolute value), and the largest rounded r. If the set of unique rounded radii has three or fewer values, all points with those rounded radii are retained. Returns an empty array when `data` is missing or empty.
 *
 * @param {Array<{theta: number, r: number}>} data - Array of points with numeric `theta` and `r`.
 * @returns {Array<{theta: number, r: number}>} Filtered subset of `data` containing only points for the min, mid (closest to zero), and max rounded radii.
 */
export function filterMinMidMax(data) {
  if (!data || data.length === 0) return [];

  const uniqueRValues = [...new Set(data.map((d) => Math.round(d.r)))].sort(
    (a, b) => a - b
  );

  if (uniqueRValues.length <= 3) {
    const keep = new Set(uniqueRValues);
    return data.filter((d) => keep.has(Math.round(d.r)));
  }

  const minR = uniqueRValues[0];
  const maxR = uniqueRValues[uniqueRValues.length - 1];
  let midR = uniqueRValues[0];
  let minDist = Infinity;
  for (const r of uniqueRValues) {
    const dist = Math.abs(r);
    if (dist < minDist) {
      minDist = dist;
      midR = r;
    }
  }

  const keep = new Set([minR, midR, maxR]);
  return data.filter((d) => keep.has(Math.round(d.r)));
}

/**
 * Format an angle in radians as a human-readable multiple of π.
 *
 * Recognizes common fractional multiples of π (including ±π/6, ±π/4, ±π/3, ±π/2, ±2π/3, ±3π/2, ±5π/6, ±4π/3, ±5π/3, ±7π/4, ±5π/4, ±2π, and 0) and returns them using π notation; for other angles returns the coefficient rounded to two decimals followed by "π" (e.g., "0.33π").
 * @param {number} theta - Angle value in radians.
 * @returns {string} The angle formatted as a multiple of π.
 */
export function formatAngle(theta) {
  const ratio = theta / pi;
  if (abs(ratio) < 0.001) return '0';
  if (abs(abs(ratio) - 0.5) < 0.001) return `${ratio > 0 ? '' : '-'}π/2`;
  if (abs(abs(ratio) - 1) < 0.001) return `${ratio > 0 ? '' : '-'}π`;
  if (abs(abs(ratio) - 1.5) < 0.001) return `${ratio > 0 ? '' : '-'}3π/2`;
  if (abs(abs(ratio) - 2) < 0.001) return `${ratio > 0 ? '' : '-'}2π`;
  if (abs(abs(ratio) - 0.25) < 0.001) return `${ratio > 0 ? '' : '-'}π/4`;
  if (abs(abs(ratio) - 0.75) < 0.001) return `${ratio > 0 ? '' : '-'}3π/4`;
  if (abs(abs(ratio) - 4/3) < 0.001) return `${ratio > 0 ? '' : '-'}4π/3`;
  if (abs(abs(ratio) - 5/3) < 0.001) return `${ratio > 0 ? '' : '-'}5π/3`;
  if (abs(abs(ratio) - 7/4) < 0.001) return `${ratio > 0 ? '' : '-'}7π/4`;
  if (abs(abs(ratio) - 5/4) < 0.001) return `${ratio > 0 ? '' : '-'}5π/4`;
  if (abs(abs(ratio) - 1/3) < 0.001) return `${ratio > 0 ? '' : '-'}π/3`;
  if (abs(abs(ratio) - 2/3) < 0.001) return `${ratio > 0 ? '' : '-'}2π/3`;
  if (abs(abs(ratio) - 1/6) < 0.001) return `${ratio > 0 ? '' : '-'}π/6`;
  if (abs(abs(ratio) - 5/6) < 0.001) return `${ratio > 0 ? '' : '-'}5π/6`;
  return `${ratio.toFixed(2)}π`;
}
