import { memo, useRef, useEffect } from 'react';

function CartesianGraph({ allData, currentStep, tableData, curveColor }) {
  const canvasRef = useRef(null);

  const formatPi = (val) => {
    const pi = Math.PI;
    const eps = 0.05;
    if (Math.abs(val) < eps) return '0';
    if (Math.abs(val - pi / 2) < eps) return 'π/2';
    if (Math.abs(val - pi) < eps) return 'π';
    if (Math.abs(val - (3 * pi) / 2) < eps) return '3π/2';
    if (Math.abs(val - 2 * pi) < eps) return '2π';
    if (Math.abs(val - pi / 4) < eps) return 'π/4';
    if (Math.abs(val - (3 * pi) / 4) < eps) return '3π/4';
    if (Math.abs(val - (5 * pi) / 4) < eps) return '5π/4';
    if (Math.abs(val - (7 * pi) / 4) < eps) return '7π/4';
    if (Math.abs(val - pi / 6) < eps) return 'π/6';
    if (Math.abs(val - (5 * pi) / 6) < eps) return '5π/6';
    if (Math.abs(val - (7 * pi) / 6) < eps) return '7π/6';
    if (Math.abs(val - (11 * pi) / 6) < eps) return '11π/6';
    return (val / pi).toFixed(2) + 'π';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width - 40;
    const height = 300;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    function draw() {
      if (!allData || allData.length === 0) return;

      ctx.clearRect(0, 0, width, height);

      const rValues = allData.map((d) => d.r);
      const rMin = Math.min(...rValues);
      const rMax = Math.max(...rValues);
      const rRange = Math.max(Math.abs(rMin), Math.abs(rMax), 1);
      const thetaMin = allData[0].theta;
      const thetaMax = allData[allData.length - 1].theta;

      const toX = (theta) => padding.left + ((theta - thetaMin) / (thetaMax - thetaMin || 1)) * plotW;
      const toY = (r) => padding.top + plotH / 2 - (r / rRange) * (plotH / 2);

      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let r = -Math.floor(rRange); r <= Math.floor(rRange); r++) {
        if (r === 0) continue;
        const y = toY(r);
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
        const x = toX(theta);
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
      ctx.moveTo(padding.left, toY(0));
      ctx.lineTo(width - padding.right, toY(0));
      ctx.stroke();

      ctx.fillStyle = '#666';
      ctx.font = '11px "SF Mono", "Cascadia Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i <= numThetaTicks; i++) {
        const theta = thetaMin + (thetaMax - thetaMin) * (i / numThetaTicks);
        const x = toX(theta);
        ctx.fillText(formatPi(theta), x, height - padding.bottom + 8);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('θ', width - padding.right, height - padding.bottom + 18);

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let r = -Math.floor(rRange); r <= Math.floor(rRange); r++) {
        if (r === 0) continue;
        const y = toY(r);
        ctx.fillText(r.toString(), padding.left - 8, y);
      }
      ctx.fillText('0', padding.left - 8, toY(0));
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('r', padding.left - 5, padding.top - 2);

      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, curveColor + '80');
      gradient.addColorStop(1, curveColor + '20');
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(toX(allData[0].theta), padding.top + plotH / 2);
      const step = Math.max(1, Math.floor(allData.length / plotW));
      for (let i = 0; i < allData.length; i += step) {
        const d = allData[i];
        ctx.lineTo(toX(d.theta), toY(d.r));
      }
      const last = allData[allData.length - 1];
      ctx.lineTo(toX(last.theta), padding.top + plotH / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const endIdx = currentStep >= 0 ? currentStep : allData.length - 1;
      ctx.moveTo(toX(allData[0].theta), toY(allData[0].r));
      for (let i = 1; i <= endIdx; i++) {
        const d = allData[i];
        ctx.lineTo(toX(d.theta), toY(d.r));
      }
      ctx.stroke();

      ctx.strokeStyle = curveColor + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      if (endIdx < allData.length - 1) {
        ctx.beginPath();
        ctx.moveTo(toX(allData[endIdx].theta), toY(allData[endIdx].r));
        for (let i = endIdx + 1; i < allData.length; i += step) {
          const d = allData[i];
          ctx.lineTo(toX(d.theta), toY(d.r));
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      if (currentStep >= 0 && currentStep < allData.length) {
        const cp = allData[currentStep];
        const cx = toX(cp.theta);
        const cy = toY(cp.r);

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
        ctx.strokeStyle = curveColor + '60';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(padding.left, cy);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = curveColor + '60';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (tableData && tableData.length > 0) {
        tableData.forEach((pt) => {
          const tx = toX(pt.theta);
          const ty = toY(pt.r);
          ctx.beginPath();
          ctx.arc(tx, ty, 4, 0, 2 * Math.PI);
          ctx.fillStyle = curveColor + '80';
          ctx.fill();
          ctx.strokeStyle = curveColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }

    draw();

    function handleResize() {
      const newRect = canvas.parentElement.getBoundingClientRect();
      const newWidth = newRect.width - 40;
      canvas.width = newWidth * dpr;
      canvas.height = height * dpr;
      canvas.style.width = newWidth + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      draw();
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [allData, currentStep, tableData, curveColor]);

  return (
    <div className="graph-container">
      <div className="graph-title">Cartesian Plot (r vs θ)</div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default memo(CartesianGraph);
