import { memo, useRef, useEffect } from 'react';
import p5 from 'p5';
import { formatAngle } from '../utils/calculations';

function PolarGraph({ allData, currentStep, curveColor, isDark, keyPoints }) {
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
    if (p5Ref.current) {
      p5Ref.current.redraw();
      return;
    }

    const sketch = (p) => {
      let cw = 820, ch = 500;

      p.setup = () => {
        if (containerRef.current) containerRef.current.innerHTML = '';
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

        const bg = dark ? '#0a0a14' : '#fafafa';
        const grid = dark ? '#1a1a2e' : '#d1d5db';
        const gridRadial = dark ? '#1a1a2e' : '#d1d5db';
        const axis = dark ? '#475569' : '#333';
        const textColor = dark ? '#94a3b8' : '#333';
        const TickColor = dark ? '#334155' : '#a0aec0';

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
        const drawScale = Math.min(cw, ch) * 0.36 * zoom;
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
          const ey = p.sin(angle) * gridR * us;
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
          const ly = cy + p.sin(a) * ld;
          p.text(l, lx, ly);
          const tx = cx + p.cos(a) * rOuter;
          const ty = cy + p.sin(a) * rOuter;
          p.stroke(TickColor);
          p.strokeWeight(1);
          p.line(tx - p.cos(a) * 6, ty - p.sin(a) * 6, tx, ty);
        });

        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(10);
        for (let r = 1; r <= gridR; r++) {
          p.fill(textColor);
          p.noStroke();
          p.text(r.toString(), cx - r * us - 5, cy);
          p.text(r.toString(), cx - r * us - 5, cy - r * us);
        }

        const endIdx = step >= 0 && step < data.length ? step : data.length - 1;

        p.stroke(color);
        p.strokeWeight(2.5);
        p.noFill();
        p.beginShape();
        for (let i = 0; i <= endIdx; i++) {
          const px = cx + data[i].r * us * p.cos(data[i].theta);
          const py = cy + data[i].r * us * p.sin(data[i].theta);
          p.vertex(px, py);
        }
        p.endShape();

        if (endIdx >= 0 && endIdx < data.length) {
          const pt = data[endIdx];
          const px = cx + pt.r * us * p.cos(pt.theta);
          const py = cy + pt.r * us * p.sin(pt.theta);
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
          const ay = cy + data[i].r * us * p.sin(data[i].theta);
          const ni = Math.min(i + 1, data.length - 1);
          const bx = cx + data[ni].r * us * p.cos(data[ni].theta);
          const by = cy + data[ni].r * us * p.sin(data[ni].theta);
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

      p.resizeToFit = (newW) => {
        if (newW < 300) newW = 400;
        cw = newW;
        ch = 500;
        p.resizeCanvas(cw, ch);
        p.redraw();
      };
    };

    p5Ref.current = new p5(sketch);

    const container = containerRef.current;
    const parent = container ? container.parentElement : null;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0 && p5Ref.current && p5Ref.current.resizeToFit) {
          const size = Math.max(width - 18, 300);
          p5Ref.current.resizeToFit(size);
        }
      }
    });

    if (parent) observer.observe(parent);

    return () => {
      observer.disconnect();
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, []);

  const handleSave = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'polar-graph.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    zoomRef.current = Math.min(zoomRef.current * 1.35, 4);
    if (p5Ref.current) p5Ref.current.redraw();
  };

  const handleZoomOut = () => {
    zoomRef.current = Math.max(zoomRef.current / 1.35, 0.5);
    if (p5Ref.current) p5Ref.current.redraw();
  };

  const handleZoomReset = () => {
    zoomRef.current = 1;
    if (p5Ref.current) p5Ref.current.redraw();
  };

  useEffect(() => {
    if (p5Ref.current) p5Ref.current.redraw();
  }, [allData, currentStep, curveColor, isDark, keyPoints]);

  return (
    <div className="graph-container polar-container">
      <div className="graph-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Polar Animation</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="ctrl-btn save-btn" onClick={handleZoomOut} title="Zoom out" style={{ width: 26, height: 26 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" /></svg>
          </button>
          <span onClick={handleZoomReset} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', minWidth: 32, textAlign: 'center' }}>
            {zoomRef.current.toFixed(1)}x
          </span>
          <button className="ctrl-btn save-btn" onClick={handleZoomIn} title="Zoom in" style={{ width: 26, height: 26 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
          </button>
          <button className="ctrl-btn save-btn" onClick={handleSave} title="Save as PNG" style={{ width: 26, height: 26 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
              <path d="M5.75 2a.75.75 0 0 0-.75.75V6H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V2.75a.75.75 0 0 0-.75-.75H5.75ZM14 6h-1V3.5H7V6h7ZM6 11a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2Zm7-1a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1Z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="canvas-wrapper polar-wrapper" ref={containerRef} />
    </div>
  );
}

export default memo(PolarGraph);
