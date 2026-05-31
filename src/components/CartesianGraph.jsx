import { memo, useRef, useEffect } from 'react';
import { formatAngle } from '../utils/calculations';

const PI_FRACTIONS = [
  { v: 0, label: '0' },
  { v: Math.PI / 12, label: 'π/12' },
  { v: Math.PI / 6, label: 'π/6' },
  { v: Math.PI / 4, label: 'π/4' },
  { v: Math.PI / 3, label: 'π/3' },
  { v: Math.PI / 2, label: 'π/2' },
  { v: (2 * Math.PI) / 3, label: '2π/3' },
  { v: (3 * Math.PI) / 4, label: '3π/4' },
  { v: (5 * Math.PI) / 6, label: '5π/6' },
  { v: Math.PI, label: 'π' },
  { v: (7 * Math.PI) / 6, label: '7π/6' },
  { v: (5 * Math.PI) / 4, label: '5π/4' },
  { v: (4 * Math.PI) / 3, label: '4π/3' },
  { v: (3 * Math.PI) / 2, label: '3π/2' },
  { v: (5 * Math.PI) / 3, label: '5π/3' },
  { v: (7 * Math.PI) / 4, label: '7π/4' },
  { v: (11 * Math.PI) / 6, label: '11π/6' },
  { v: 2 * Math.PI, label: '2π' },
];

function formatPi(val) {
  const eps = 0.02;
  for (const f of PI_FRACTIONS) {
    if (Math.abs(val - f.v) < eps) return f.label;
  }
  return (val / Math.PI).toFixed(2) + 'π';
}

function CartesianGraph({ allData, currentStep, keyPoints, curveColor }) {
  const canvasRef = useRef(null);
  const hoverRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let width, height, plotW, plotH, padding;

    function setupSize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width - 40;
      height = 300;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      padding = { top: 24, right: 20, bottom: 40, left: 52 };
      plotW = width - padding.left - padding.right;
      plotH = height - padding.top - padding.bottom;
    }

    function toX(theta, thetaMin, thetaMax) {
      return padding.left + ((theta - thetaMin) / (thetaMax - thetaMin || 1)) * plotW;
    }

    function toY(r, rRange) {
      return padding.top + plotH / 2 - (r / rRange) * (plotH / 2);
    }

    function draw(hoverTheta, hoverR) {
      if (!allData || allData.length === 0) return;

      ctx.clearRect(0, 0, width, height);

      const rValues = allData.map((d) => d.r);
      const rMin = Math.min(...rValues);
      const rMax = Math.max(...rValues);
      const rRange = Math.max(Math.abs(rMin), Math.abs(rMax), 1);
      const thetaMin = allData[0].theta;
      const thetaMax = allData[allData.length - 1].theta;

      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let r = -Math.floor(rRange); r <= Math.floor(rRange); r++) {
        if (r === 0) continue;
        const y = toY(r, rRange);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      const numThetaTicks = 8;
      for (let i = 0; i <= numThetaTicks; i++) {
        const theta = thetaMin + (thetaMax - thetaMin) * (i / numThetaTicks);
        const x = toX(theta, thetaMin, thetaMax);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
      }

      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, height - padding.bottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding.left, toY(0, rRange));
      ctx.lineTo(width - padding.right, toY(0, rRange));
      ctx.stroke();

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 11px "SF Mono", "Cascadia Code", "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i <= numThetaTicks; i++) {
        const theta = thetaMin + (thetaMax - thetaMin) * (i / numThetaTicks);
        const x = toX(theta, thetaMin, thetaMax);
        ctx.fillText(formatPi(theta), x, height - padding.bottom + 8);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u03B8', width - padding.right, height - padding.bottom + 18);

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let r = -Math.floor(rRange); r <= Math.floor(rRange); r++) {
        if (r === 0) continue;
        ctx.fillText(r.toString(), padding.left - 8, toY(r, rRange));
      }
      ctx.fillText('0', padding.left - 8, toY(0, rRange));
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('r', padding.left - 5, padding.top - 2);

      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, curveColor + '50');
      gradient.addColorStop(1, curveColor + '08');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(toX(allData[0].theta, thetaMin, thetaMax), padding.top + plotH / 2);
      const step = Math.max(1, Math.floor(allData.length / plotW));
      for (let i = 0; i < allData.length; i += step) {
        ctx.lineTo(toX(allData[i].theta, thetaMin, thetaMax), toY(allData[i].r, rRange));
      }
      ctx.lineTo(toX(allData[allData.length - 1].theta, thetaMin, thetaMax), padding.top + plotH / 2);
      ctx.closePath();
      ctx.fill();

      let endIdx = currentStep >= 0 ? currentStep : allData.length - 1;
      if (endIdx >= allData.length) endIdx = allData.length - 1;

      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toX(allData[0].theta, thetaMin, thetaMax), toY(allData[0].r, rRange));
      for (let i = 1; i <= endIdx; i++) {
        ctx.lineTo(toX(allData[i].theta, thetaMin, thetaMax), toY(allData[i].r, rRange));
      }
      ctx.stroke();

      if (currentStep >= 0 && currentStep < allData.length) {
        const cp = allData[currentStep];
        const cx = toX(cp.theta, thetaMin, thetaMax);
        const cy = toY(cp.r, rRange);

        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, padding.top + plotH / 2);
        ctx.strokeStyle = curveColor + '50';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(padding.left, cy);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = curveColor + '50';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (keyPoints && keyPoints.length > 0) {
        keyPoints.forEach((pt) => {
          const tx = toX(pt.theta, thetaMin, thetaMax);
          const ty = toY(pt.r, rRange);

          ctx.beginPath();
          ctx.arc(tx, ty, 5, 0, 2 * Math.PI);
          ctx.fillStyle = curveColor;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = curveColor;
          ctx.font = 'bold 11px "SF Mono", "Cascadia Code", "Consolas", monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          const label = `${pt.label} (${pt.r}, ${formatAngle(pt.theta)})`;
          ctx.fillText(label, Math.min(tx + 8, width - 120), Math.max(ty - 6, 14));
        });
      }

      if (hoverTheta != null && hoverR != null) {
        const hx = toX(hoverTheta, thetaMin, thetaMax);
        const hy = toY(hoverR, rRange);

        ctx.beginPath();
        ctx.arc(hx, hy, 7, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.stroke();

        const tooltipText = `\u03B8 = ${formatPi(hoverTheta)}, r = ${hoverR.toFixed(2)}`;
        ctx.font = '12px "SF Mono", "Cascadia Code", consolas, monospace';
        const textWidth = ctx.measureText(tooltipText).width;
        const toX2 = Math.min(hx + 12, width - textWidth - 20);
        const toY2 = Math.max(hy - 30, 10);

        ctx.fillStyle = 'rgba(31, 41, 55, 0.9)';
        ctx.beginPath();
        ctx.roundRect(toX2 - 6, toY2 - 4, textWidth + 16, 22, 4);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(tooltipText, toX2 + 2, toY2 + 7);
      }
    }

    function findNearestPoint(mouseX, mouseY) {
      if (!allData || allData.length === 0) return null;
      const rValues = allData.map((d) => d.r);
      const rMin = Math.min(...rValues);
      const rMax = Math.max(...rValues);
      const rRange = Math.max(Math.abs(rMin), Math.abs(rMax), 1);
      const thetaMin = allData[0].theta;
      const thetaMax = allData[allData.length - 1].theta;

      const dataTheta = (mouseX - padding.left) / plotW * (thetaMax - thetaMin) + thetaMin;
      const dataR = ((padding.top + plotH / 2 - mouseY) / (plotH / 2)) * rRange;

      let minDist = Infinity;
      let nearest = null;
      const searchStep = Math.max(1, Math.floor(allData.length / 200));
      for (let i = 0; i < allData.length; i += searchStep) {
        const d = allData[i];
        const dx = d.theta - dataTheta;
        const dy = d.r - dataR;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          nearest = d;
        }
      }

      if (Math.sqrt(minDist) > rRange * 0.3) return null;
      return nearest;
    }

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const pt = findNearestPoint(mx, my);
      hoverRef.current = pt;
      draw(pt ? pt.theta : null, pt ? pt.r : null);
    }

    function handleMouseLeave() {
      hoverRef.current = null;
      draw(null, null);
    }

    setupSize();
    draw(null, null);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    function handleResize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width - 40;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      padding = { top: 24, right: 20, bottom: 40, left: 52 };
      plotW = width - padding.left - padding.right;
      plotH = height - padding.top - padding.bottom;
      const pt = hoverRef.current;
      draw(pt ? pt.theta : null, pt ? pt.r : null);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allData, currentStep, keyPoints, curveColor]);

  return (
    <div className="graph-container">
      <div className="graph-title">Cartesian Plot (r vs &theta;) &mdash; hover to inspect</div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default memo(CartesianGraph);
