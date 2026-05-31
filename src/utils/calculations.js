import { cos, sin, pi, abs, round, re } from 'mathjs';

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

export function extractKeyPoints(data) {
  if (!data || data.length === 0) return [];

  let maxPt = data[0];
  let minPt = data[0];
  let zeroPt = data[0];
  let minZeroDist = Infinity;

  for (const pt of data) {
    if (pt.r > maxPt.r) maxPt = pt;
    if (pt.r < minPt.r) minPt = pt;
    const d = abs(pt.r);
    if (d < minZeroDist) {
      minZeroDist = d;
      zeroPt = pt;
    }
  }

  const result = [];
  const seen = new Set();

  for (const pt of [minPt, zeroPt, maxPt]) {
    const key = round(pt.theta, 4).toString();
    if (!seen.has(key)) {
      seen.add(key);
      let label = '';
      if (pt === minPt && pt.r < 0) label = 'Min';
      else if (pt === maxPt && pt.r > 0) label = 'Max';
      else label = 'Zero';
      result.push({ theta: pt.theta, r: round(pt.r, 2), label });
    }
  }

  return result.sort((a, b) => a.r - b.r);
}

export function formatPeriodLabel(period) {
  const ratio = period / pi;
  if (abs(ratio - 1) < 0.001) return 'π';
  if (abs(ratio - 2) < 0.001) return '2π';
  return ratio.toFixed(2) + 'π';
}

export function formatAngle(theta) {
  const ratio = theta / pi;
  if (abs(ratio) < 0.001) return '0';
  if (abs(abs(ratio) - 0.5) < 0.001) return `${ratio > 0 ? '' : '-'}π/2`;
  if (abs(abs(ratio) - 1) < 0.001) return `${ratio > 0 ? '' : '-'}π`;
  if (abs(abs(ratio) - 1.5) < 0.001) return `${ratio > 0 ? '' : '-'}3π/2`;
  if (abs(abs(ratio) - 2) < 0.001) return `${ratio > 0 ? '' : '-'}2π`;
  if (abs(abs(ratio) - 0.25) < 0.001) return `${ratio > 0 ? '' : '-'}π/4`;
  if (abs(abs(ratio) - 0.75) < 0.001) return `${ratio > 0 ? '' : '-'}3π/4`;
  if (abs(abs(ratio) - 1 / 3) < 0.001) return `${ratio > 0 ? '' : '-'}π/3`;
  if (abs(abs(ratio) - 2 / 3) < 0.001) return `${ratio > 0 ? '' : '-'}2π/3`;
  if (abs(abs(ratio) - 1 / 6) < 0.001) return `${ratio > 0 ? '' : '-'}π/6`;
  if (abs(abs(ratio) - 5 / 6) < 0.001) return `${ratio > 0 ? '' : '-'}5π/6`;
  return `${ratio.toFixed(2)}π`;
}
