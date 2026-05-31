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
  return `${ratio.toFixed(2)}π`;
}

export function roundPi(value) {
  return Math.round(value / pi * 100) / 100;
}
