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

  const raw = [];
  const eps = 0.005;

  // Zero crossings: sign change or zero boundary between consecutive points
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    if (prev.r * curr.r <= 0 && !(prev.r === 0 && curr.r === 0)) {
      const pt = Math.abs(prev.r) <= Math.abs(curr.r) ? prev : curr;
      raw.push({ theta: pt.theta, r: 0, label: 'Zero' });
    }
  }

  // Local extrema: compare with neighbors
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const next = data[i + 1];
    if (curr.r > prev.r && curr.r > next.r) {
      raw.push({ theta: curr.theta, r: round(curr.r, 2), label: 'Max' });
    }
    if (curr.r < prev.r && curr.r < next.r) {
      raw.push({ theta: curr.theta, r: round(curr.r, 2), label: 'Min' });
    }
  }

  // Boundary check: first and last points may be extrema (periodic wrapping)
  if (data.length >= 3) {
    const first = data[0], second = data[1], last = data[data.length - 1];
    if (first.r > second.r && first.r > last.r) {
      raw.push({ theta: first.theta, r: round(first.r, 2), label: 'Max' });
    }
    if (first.r < second.r && first.r < last.r) {
      raw.push({ theta: first.theta, r: round(first.r, 2), label: 'Min' });
    }
    if (last.r > data[data.length - 2].r && last.r > first.r) {
      raw.push({ theta: last.theta, r: round(last.r, 2), label: 'Max' });
    }
    if (last.r < data[data.length - 2].r && last.r < first.r) {
      raw.push({ theta: last.theta, r: round(last.r, 2), label: 'Min' });
    }
  }

  // Deduplicate: merge points with very close theta
  const sorted = raw.sort((a, b) => a.theta - b.theta);
  const deduped = [];

  for (const pt of sorted) {
    const last = deduped[deduped.length - 1];
    if (last && Math.abs(pt.theta - last.theta) < eps) {
      if (pt.label === 'Zero') {
        last.label = 'Zero';
        last.r = 0;
      }
    } else {
      deduped.push({ ...pt });
    }
  }

  return deduped;
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
