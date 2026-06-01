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
  const end = 2 * pi;
  const steps = 1440;
  const step = end / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const theta = i * step;
    const angle = n * theta;
    const r = func === 'sin' ? a * sin(angle) : a * cos(angle);
    data.push({ theta: re(theta), r: re(r) });
  }

  return { data, period: re(2 * pi / n) };
}

function calculateLimacon(a, b, func, operator) {
  const steps = 1440;
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

export function extractKeyPoints(data, period) {
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

  // Boundary check: first/last points at edge of the data range
  if (data.length >= 3) {
    const first = data[0], second = data[1];
    const last = data[data.length - 1], beforeLast = data[data.length - 2];
    if (Math.abs(first.r) > 0.001) {
      if (first.r > second.r) {
        raw.push({ theta: first.theta, r: round(first.r, 2), label: 'Max' });
      } else if (first.r < second.r) {
        raw.push({ theta: first.theta, r: round(first.r, 2), label: 'Min' });
      }
    }
    if (Math.abs(last.r) > 0.001) {
      if (last.r > beforeLast.r) {
        raw.push({ theta: last.theta, r: round(last.r, 2), label: 'Max' });
      } else if (last.r < beforeLast.r) {
        raw.push({ theta: last.theta, r: round(last.r, 2), label: 'Min' });
      }
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

  // Replicate first-period key points across the full data range
  if (period && period > 0) {
    const firstPeriodPoints = deduped.filter(pt => pt.theta < period - eps);
    if (firstPeriodPoints.length > 0) {
      const maxTheta = data[data.length - 1].theta;
      const maxK = Math.ceil(maxTheta / period);
      const replicated = [];
      for (let k = 0; k < maxK; k++) {
        const offset = k * period;
        for (const pt of firstPeriodPoints) {
          const newTheta = pt.theta + offset;
          if (newTheta <= maxTheta + eps) {
            replicated.push({
              theta: newTheta,
              r: pt.r,
              label: pt.label,
            });
          }
        }
      }
      replicated.sort((a, b) => a.theta - b.theta);
      return appendPiPoints(replicated, data);
    }
  }

  return appendPiPoints(deduped, data);
}

function findRAt(theta, data) {
  let best = null;
  let bestDist = Infinity;
  for (const d of data) {
    const dist = Math.abs(d.theta - theta);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return bestDist < 0.01 ? best.r : null;
}

function appendPiPoints(points, data) {
  const result = [...points];
  for (const target of [pi, 2 * pi]) {
    const r = findRAt(target, data);
    if (r != null && !result.some(p => Math.abs(p.theta - target) < 0.005)) {
      result.push({ theta: re(target), r: round(r, 2), label: '' });
    }
  }
  return result.sort((a, b) => a.theta - b.theta);
}

export function formatPeriodLabel(period) {
  const ratio = period / pi;
  if (abs(ratio - 1) < 0.001) return 'π';
  if (abs(ratio - 2) < 0.001) return '2π';
  for (let den = 1; den <= 20; den++) {
    for (let num = 1; num <= 2 * den; num++) {
      if (abs(ratio - num / den) < 0.005) {
        const g = gcd(num, den);
        const sn = num / g;
        const sd = den / g;
        if (sd === 1) return `${sn === 1 ? '' : sn}π`;
        return `${sn === 1 ? '' : sn}π/${sd}`;
      }
    }
  }
  return ratio.toFixed(2) + 'π';
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

export function formatAngle(theta) {
  const ratio = theta / pi;
  const eps = 0.005;

  if (abs(ratio) < eps) return '0';
  if (abs(abs(ratio) - 1) < eps) return ratio > 0 ? 'π' : '-π';
  if (abs(abs(ratio) - 2) < eps) return ratio > 0 ? '2π' : '-2π';

  for (let den = 1; den <= 20; den++) {
    for (let num = -2 * den; num <= 2 * den; num++) {
      if (abs(ratio - num / den) < eps) {
        if (num === 0) return '0';
        const g = gcd(Math.abs(num), den);
        const sn = num / g;
        const sd = den / g;
        const sign = sn < 0 ? '-' : '';
        const absSn = Math.abs(sn);
        if (sd === 1) return `${sign}${absSn === 1 ? '' : absSn}π`;
        return `${sign}${absSn === 1 ? '' : absSn}π/${sd}`;
      }
    }
  }

  return `${ratio.toFixed(2)}π`;
}
