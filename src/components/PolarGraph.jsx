import { memo, useRef, useEffect, useCallback } from 'react';
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
      let w, h, cx, cy, scale, maxR;

      p.setup = () => {
        const container = containerRef.current;
        w = container.clientWidth || 400;
        h = 400;
        const canvas = p.createCanvas(w, h);
        canvas.parent(container);
        p.pixelDensity(1);
        cx = w / 2;
        cy = h / 2;
        scale = Math.min(w, h) * 0.38;
        maxR = 5;
        p.noLoop();
      };

      p.draw = () => {
        const data = dataRef.current;
        const step = stepRef.current;
        const color = colorRef.current;

        if (!data || data.length === 0) {
          p.background(250);
          p.fill(150);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(16);
          p.text('Click "Generate & Animate" to begin', w / 2, h / 2);
          return;
        }

        p.background(250);

        const rValues = data.map((d) => Math.abs(d.r));
        const maxAbsR = Math.max(...rValues, 1);
        const gridR = Math.ceil(maxAbsR);

        p.stroke(220);
        p.strokeWeight(0.5);
        p.fill(240);
        for (let r = 1; r <= gridR; r++) {
          const pr = (r / gridR) * scale;
          p.ellipse(cx, cy, pr * 2);
        }

        for (let a = 0; a < 12; a++) {
          const angle = (a * p.PI) / 6;
          p.stroke(200);
          p.strokeWeight(0.5);
          p.line(
            cx,
            cy,
            cx + p.cos(angle) * scale,
            cy + p.sin(angle) * scale
          );
        }

        p.stroke(180);
        p.strokeWeight(1);
        p.line(0, cy, w, cy);
        p.line(cx, 0, cx, h);

        p.noStroke();
        p.fill(120);
        p.textSize(10);
        p.textAlign(p.CENTER, p.TOP);
        const labelRadius = scale + 16;
        const labelAngles = [0, p.PI / 2, p.PI, (3 * p.PI) / 2];
        const labels = ['0', 'π/2', 'π', '3π/2'];
        labelAngles.forEach((a, i) => {
          p.text(labels[i], cx + p.cos(a) * labelRadius, cy + p.sin(a) * labelRadius);
        });

        p.textAlign(p.RIGHT, p.CENTER);
        for (let r = 1; r <= gridR; r++) {
          const pr = (r / gridR) * scale;
          p.text(r.toString(), cx - pr - 6, cy);
          p.text(r.toString(), cx - pr - 6, cy - pr);
        }

        const endIdx = step >= 0 && step < data.length ? step : data.length - 1;

        p.stroke(color);
        p.strokeWeight(3);
        p.noFill();
        p.beginShape();
        for (let i = 0; i <= endIdx; i++) {
          const theta = data[i].theta;
          const r = data[i].r;
          const px = cx + (r / gridR) * scale * p.cos(theta);
          const py = cy + (r / gridR) * scale * p.sin(theta);
          p.vertex(px, py);
        }
        p.endShape();

        if (endIdx >= 0 && endIdx < data.length) {
          const pt = data[endIdx];
          const px = cx + (pt.r / gridR) * scale * p.cos(pt.theta);
          const py = cy + (pt.r / gridR) * scale * p.sin(pt.theta);

          p.stroke(color);
          p.strokeWeight(3);
          p.fill(255);
          p.ellipse(px, py, 10);
          p.fill(color);
          p.ellipse(px, py, 5);
        }

        const arrowInterval = Math.max(1, Math.floor(endIdx / 20));
        for (let i = arrowInterval; i < endIdx; i += arrowInterval) {
          const t1 = data[i].theta;
          const r1 = data[i].r;
          const ax = cx + (r1 / gridR) * scale * p.cos(t1);
          const ay = cy + (r1 / gridR) * scale * p.sin(t1);

          const next = Math.min(i + 1, data.length - 1);
          const t2 = data[next].theta;
          const r2 = data[next].r;
          const bx = cx + (r2 / gridR) * scale * p.cos(t2);
          const by = cy + (r2 / gridR) * scale * p.sin(t2);

          const angle = p.atan2(by - ay, bx - ax);
          const arrowSize = 7;

          p.push();
          p.translate(ax, ay);
          p.rotate(angle);
          p.fill(color);
          p.noStroke();
          p.triangle(arrowSize, 0, -arrowSize * 0.5, -arrowSize * 0.5, -arrowSize * 0.5, arrowSize * 0.5);
          p.pop();
        }

        p.noFill();
        p.stroke(color + '20');
        p.strokeWeight(1);
        p.drawingContext.setLineDash([4, 4]);
        p.beginShape();
        for (let i = endIdx + 1; i < data.length; i++) {
          const theta = data[i].theta;
          const r = data[i].r;
          const px = cx + (r / gridR) * scale * p.cos(theta);
          const py = cy + (r / gridR) * scale * p.sin(theta);
          p.vertex(px, py);
        }
        p.endShape();
        p.drawingContext.setLineDash([]);
      };

      p.windowResized = () => {
        const container = containerRef.current;
        if (container) {
          w = container.clientWidth || 400;
          p.resizeCanvas(w, h);
          cx = w / 2;
          cy = h / 2;
          scale = Math.min(w, h) * 0.38;
          p.redraw();
        }
      };
    };

    p5Ref.current = new p5(sketch);

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (p5Ref.current) {
      p5Ref.current.redraw();
    }
  }, [allData, currentStep, curveColor]);

  return (
    <div className="graph-container">
      <div className="graph-title">Polar Animation</div>
      <div className="canvas-wrapper polar-wrapper" ref={containerRef} />
    </div>
  );
}

export default memo(PolarGraph);
