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
      let w = 500, h = 500, cx, cy, unitScale, gridR;

      p.setup = () => {
        const container = containerRef.current;
        w = container.clientWidth || 500;
        h = 520;
        const canvas = p.createCanvas(w, h);
        canvas.parent(container);
        p.pixelDensity(1);
        cx = w / 2;
        cy = h / 2;
        unitScale = Math.min(w, h) * 0.42;
        gridR = 5;
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
        gridR = Math.ceil(maxAbsR);
        const us = unitScale / gridR;

        p.stroke(210);
        p.strokeWeight(0.5);
        p.noFill();
        for (let r = 1; r <= gridR; r++) {
          p.ellipse(cx, cy, r * us * 2);
        }

        p.stroke(190);
        p.strokeWeight(0.5);
        for (let a = 0; a < 24; a++) {
          const angle = (a * p.PI) / 12;
          p.line(cx, cy, cx + p.cos(angle) * gridR * us, cy + p.sin(angle) * gridR * us);
        }

        p.stroke(160);
        p.strokeWeight(1);
        p.line(0, cy, w, cy);
        p.line(cx, 0, cx, h);

        p.noStroke();
        p.fill(100);
        p.textSize(11);
        p.textFont('"SF Mono", "Cascadia Code", monospace');
        p.textAlign(p.CENTER, p.TOP);
        const labelDist = gridR * us + 14;
        const labelAngles = [0, p.PI / 2, p.PI, (3 * p.PI) / 2];
        const labels = ['0', '\u03C0/2', '\u03C0', '3\u03C0/2'];
        labelAngles.forEach((a, i) => {
          p.text(labels[i], cx + p.cos(a) * labelDist, cy + p.sin(a) * labelDist);
        });

        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(10);
        for (let r = 1; r <= gridR; r++) {
          p.fill(100);
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
          const arrowSize = 6;
          p.push();
          p.translate(ax, ay);
          p.rotate(angle);
          p.fill(color);
          p.noStroke();
          p.triangle(arrowSize, 0, -arrowSize * 0.5, -arrowSize * 0.4, -arrowSize * 0.5, arrowSize * 0.4);
          p.pop();
        }
      };

      p.windowResized = () => {
        const container = containerRef.current;
        if (container) {
          w = container.clientWidth || 500;
          p.resizeCanvas(w, h);
          cx = w / 2;
          cy = h / 2;
          unitScale = Math.min(w, h) * 0.42;
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
    <div className="graph-container polar-container">
      <div className="graph-title">Polar Animation</div>
      <div className="canvas-wrapper polar-wrapper" ref={containerRef} />
    </div>
  );
}

export default memo(PolarGraph);
