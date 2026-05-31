import { memo, useRef, useEffect } from 'react';
import p5 from 'p5';

function PolarGraph({ allData, currentStep, curveColor }) {
  const containerRef = useRef(null);
  const p5Ref = useRef(null);
  const dataRef = useRef(allData);
  const stepRef = useRef(currentStep);
  const colorRef = useRef(curveColor);

  dataRef.current = allData;
  stepRef.current = currentStep;
  colorRef.current = curveColor;

  useEffect(() => {
    if (p5Ref.current) {
      p5Ref.current.redraw();
      return;
    }

    const sketch = (p) => {
      let cw = 400, ch = 400;

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

        p.background(252);

        if (!data || data.length === 0) {
          p.fill(150);
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
        const drawScale = Math.min(cw, ch) * 0.36;
        const us = drawScale / gridR;

        p.stroke(215);
        p.strokeWeight(0.5);
        p.noFill();
        for (let r = 1; r <= gridR; r++) {
          p.ellipse(cx, cy, r * us * 2);
        }

        p.stroke(195);
        p.strokeWeight(0.5);
        for (let a = 0; a < 24; a++) {
          const angle = (a * p.PI) / 12;
          const ex = p.cos(angle) * gridR * us;
          const ey = p.sin(angle) * gridR * us;
          p.line(cx, cy, cx + ex, cy + ey);
        }

        p.stroke(165);
        p.strokeWeight(1);
        p.line(0, cy, cw, cy);
        p.line(cx, 0, cx, ch);

        p.noStroke();
        p.fill(90);
        p.textSize(12);
        p.textAlign(p.CENTER, p.TOP);
        const ld = gridR * us + 14;
        const la = [0, p.PI / 2, p.PI, (3 * p.PI) / 2];
        const ll = ['0', '\u03C0/2', '\u03C0', '3\u03C0/2'];
        la.forEach((a, i) => p.text(ll[i], cx + p.cos(a) * ld, cy + p.sin(a) * ld));

        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(10);
        for (let r = 1; r <= gridR; r++) {
          p.fill(90);
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

      p.resizeToFit = (newW, newH) => {
        if (newW < 200) newW = 400;
        if (newH < 200) newH = 400;
        cw = newW;
        ch = newH;
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
          const size = Math.min(Math.max(width - 18, 300), 400);
          p5Ref.current.resizeToFit(size, size);
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

  useEffect(() => {
    if (p5Ref.current) p5Ref.current.redraw();
  }, [allData, currentStep, curveColor]);

  return (
    <div className="graph-container polar-container">
      <div className="graph-title">Polar Animation</div>
      <div className="canvas-wrapper polar-wrapper" ref={containerRef} />
    </div>
  );
}

export default memo(PolarGraph);
