import { memo, useRef, useEffect } from 'react';
import p5 from 'p5';
import { formatAngle } from '../utils/calculations';

function PolarGraph({ allData, currentStep, curveColor, isDark, keyPoints, params }) {
  const containerRef = useRef(null);
  const p5Ref = useRef(null);
  const dataRef = useRef(allData);
  const stepRef = useRef(currentStep);
  const colorRef = useRef(curveColor);
  const darkRef = useRef(isDark);
  const kpRef = useRef(keyPoints);
  const zoomRef = useRef(1);

  dataRef.current = allData;
  stepRef.current = currentStep;
  colorRef.current = curveColor;
  darkRef.current = isDark;
  kpRef.current = keyPoints;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (p5Ref.current) {
      p5Ref.current.redraw();
      return;
    }

    const sketch = (p) => {
      let cw = 800, ch = 500;

      p.setup = () => {
        if (containerRef.current) containerRef.current.innerHTML = '';
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          cw = Math.max(rect.width, 300);
          ch = Math.max(rect.height, 200);
        }
        const canvas = p.createCanvas(cw, ch);
        canvas.parent(containerRef.current);
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.noLoop();
      };

      p.draw = () => {
        const data = dataRef.current;
        const step = stepRef.current;
        const color = colorRef.current;
        const zoom = zoomRef.current;
        const dark = darkRef.current;

        const bg = dark ? '#0a0a12' : '#f8f8fc';
        const grid = dark ? '#1a1a2a' : '#d0d0e0';
        const gridRadial = dark ? '#14142a' : '#d0d0e0';
        const axis = dark ? '#2a2a44' : '#444466';
        const textColor = dark ? '#666699' : '#666688';
        const TickColor = dark ? '#222244' : '#9999aa';

        p.background(bg);

        if (!data || data.length === 0) {
          p.fill(textColor);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(16);
          p.text('Click "Generate & Animate" to begin', cw / 2, ch / 2);
          return;
        }

        const cx = cw / 2;
        const cy = ch / 2;
        const rValues = data.map((d) => Math.abs(d.r));
        const maxAbsR = Math.max(...rValues, 1);
        const gridR = Math.ceil(maxAbsR);
        const padding = 30;
        const maxRadius = Math.min(cw, ch) / 2 - padding;
        const drawScale = maxRadius * zoom;
        const us = drawScale / gridR;

        p.stroke(gridRadial);
        p.strokeWeight(0.5);
        p.noFill();
        for (let r = 1; r <= gridR; r++) {
          p.ellipse(cx, cy, r * us * 2);
        }

        p.stroke(grid);
        p.strokeWeight(0.5);
        for (let a = 0; a < 24; a++) {
          const angle = (a * p.PI) / 12;
          const ex = p.cos(angle) * gridR * us;
          const ey = -p.sin(angle) * gridR * us;
          p.line(cx, cy, cx + ex, cy + ey);
        }

        p.stroke(axis);
        p.strokeWeight(1.5);
        p.line(0, cy, cw, cy);
        p.line(cx, 0, cx, ch);

        p.noStroke();
        p.fill(textColor);
        p.textSize(12);
        p.textAlign(p.CENTER, p.TOP);
        const ld = gridR * us + 16;
        const kp = kpRef.current || [];
        const labelSet = new Map();
        for (let k = 0; k < 8; k++) {
          const a = (k * p.PI) / 4;
          let l;
          if (k === 0) l = '0';
          else if (k === 1) l = '\u03C0/4';
          else if (k === 2) l = '\u03C0/2';
          else if (k === 3) l = '3\u03C0/4';
          else if (k === 4) l = '\u03C0';
          else if (k === 5) l = '5\u03C0/4';
          else if (k === 6) l = '3\u03C0/2';
          else l = '7\u03C0/4';
          labelSet.set(a, l);
        }
        const eps = 0.02;
        kp.forEach(pt => {
          if (pt.label === 'Min') return;
          let dup = false;
          for (const existing of labelSet.keys()) {
            if (Math.abs(pt.theta - existing) < eps) { dup = true; break; }
          }
          if (!dup) labelSet.set(pt.theta, formatAngle(pt.theta));
        });
        const majorAngles = Array.from(labelSet.entries())
          .map(([a, l]) => ({ a: parseFloat(a), l }))
          .sort((a, b) => a.a - b.a);

        const rOuter = gridR * us;
        majorAngles.forEach(({ a, l }) => {
          const lx = cx + p.cos(a) * ld;
          const ly = cy - p.sin(a) * ld;
          p.text(l, lx, ly);
          const tx = cx + p.cos(a) * rOuter;
          const ty = cy - p.sin(a) * rOuter;
          p.stroke(TickColor);
          p.strokeWeight(1);
          p.line(tx - p.cos(a) * 6, ty + p.sin(a) * 6, tx, ty);
        });

        const endIdx = step >= 0 && step < data.length ? step : data.length - 1;

        p.stroke(color);
        p.strokeWeight(2.5);
        p.noFill();
        p.beginShape();
        for (let i = 0; i <= endIdx; i++) {
          const px = cx + data[i].r * us * p.cos(data[i].theta);
          const py = cy - data[i].r * us * p.sin(data[i].theta);
          p.vertex(px, py);
        }
        p.endShape();

        if (endIdx >= 0 && endIdx < data.length) {
          const pt = data[endIdx];
          const px = cx + pt.r * us * p.cos(pt.theta);
          const py = cy - pt.r * us * p.sin(pt.theta);
          p.stroke(color);
          p.strokeWeight(2);
          p.fill(255);
          p.ellipse(px, py, 10);
          p.fill(color);
          p.ellipse(px, py, 5);
        }

        const arrowCount = Math.min(20, endIdx);
        const arrowInterval = Math.max(1, Math.floor(endIdx / arrowCount));
        for (let i = arrowInterval; i < endIdx && i < data.length - 1; i += arrowInterval) {
          const ax = cx + data[i].r * us * p.cos(data[i].theta);
          const ay = cy - data[i].r * us * p.sin(data[i].theta);
          const ni = Math.min(i + 1, data.length - 1);
          const bx = cx + data[ni].r * us * p.cos(data[ni].theta);
          const by = cy - data[ni].r * us * p.sin(data[ni].theta);
          const angle = p.atan2(by - ay, bx - ax);
          const as2 = 6;
          p.push();
          p.translate(ax, ay);
          p.rotate(angle);
          p.fill(color);
          p.noStroke();
          p.triangle(as2, 0, -as2 * 0.5, -as2 * 0.4, -as2 * 0.5, as2 * 0.4);
          p.pop();
        }
      };

      p.resizeToFit = (newW, newH) => {
        cw = Math.max(newW, 300);
        ch = Math.max(newH, 200);
        p.resizeCanvas(cw, ch);
        p.redraw();
      };
    };

    p5Ref.current = new p5(sketch);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          p5Ref.current?.resizeToFit(width, height);
        }
      }
    });
    ro.observe(el);

    requestAnimationFrame(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        p5Ref.current?.resizeToFit(w, h);
      }
    });

    return () => {
      ro.disconnect();
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (p5Ref.current) p5Ref.current.redraw();
  }, [allData, currentStep, curveColor, isDark, keyPoints]);

  const handleSave = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      const scale = 3;
      const temp = document.createElement('canvas');
      temp.width = canvas.width * scale;
      temp.height = canvas.height * scale;
      const ctx = temp.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(canvas, 0, 0, temp.width, temp.height);
      const link = document.createElement('a');
      const p = params || {};
      const ct = p.curveType || 'polar';
      const eq = ct === 'rose'
        ? `r=${p.a}·${p.func}(${p.n}θ)`
        : `r=${p.a}${p.operator}${p.b}·${p.func}(θ)`;
      link.download = `${ct.charAt(0).toUpperCase() + ct.slice(1)}_${eq}.png`;
      link.href = temp.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="graph-container polar-container">
      <div className="graph-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Polar Animation</span>
        <button className="ctrl-btn save-btn" onClick={handleSave} title="Download as PNG" style={{ width: 22, height: 22 }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
        </button>
      </div>
      <div className="canvas-wrapper" ref={containerRef} />
    </div>
  );
}

export default memo(PolarGraph);
