import { memo, useEffect, useCallback, useRef } from 'react';

function polarToSVGPath(fn, samples, maxR, size) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = (size * 0.38) / maxR;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const theta = (i / samples) * 2 * Math.PI;
    const r = fn(theta);
    const x = cx + r * scale * Math.cos(theta);
    const y = cy - r * scale * Math.sin(theta);
    pts.push([x, y]);
  }
  return pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join('');
}

function PolarCurveFigure({ fn, maxR, label, sublabel, size }) {
  const s = size || 120;
  const cx = s / 2;
  const cy = s / 2;
  const rMax = maxR || 3;
  const gridR = (s * 0.38) / rMax;

  return (
    <div className="learn-figure">
      <svg viewBox={`0 0 ${s} ${s}`} className="learn-figure-svg" role="img" aria-label={label}>
        <rect x="0" y="0" width={s} height={s} rx="6" fill="var(--bg-elevated)" />
        <line x1={cx - gridR * rMax} y1={cy} x2={cx + gridR * rMax} y2={cy} stroke="var(--border)" strokeWidth="0.5" />
        <line x1={cx} y1={cy - gridR * rMax} x2={cx} y2={cy + gridR * rMax} stroke="var(--border)" strokeWidth="0.5" />
        {[1, 2, 3].filter(k => k <= rMax).map(k => (
          <circle key={k} cx={cx} cy={cy} r={k * gridR} fill="none" stroke="var(--border)" strokeWidth="0.4" strokeDasharray="2,2" />
        ))}
        <path
          d={polarToSVGPath(fn, 360, rMax, s)}
          fill="none"
          stroke="#b026ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label && <span className="learn-figure-label">{label}</span>}
      {sublabel && <span className="learn-figure-sublabel">{sublabel}</span>}
    </div>
  );
}

function LearnPanel({ onClose }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const panelRef = useRef(null);

  const roseFigures = [
    {
      fn: (t) => 2 * Math.cos(1 * t),
      maxR: 2.5,
      label: 'n = 1',
      sublabel: 'r = 2·cos(θ)\nOne loop (circle-like)',
    },
    {
      fn: (t) => 2 * Math.cos(2 * t),
      maxR: 2.5,
      label: 'n = 2',
      sublabel: 'r = 2·cos(2θ)\n4 petals (clover)',
    },
    {
      fn: (t) => 2 * Math.cos(3 * t),
      maxR: 2.5,
      label: 'n = 3',
      sublabel: 'r = 2·cos(3θ)\n3 petals (trefoil)',
    },
    {
      fn: (t) => 2 * Math.cos(4 * t),
      maxR: 2.5,
      label: 'n = 4',
      sublabel: 'r = 2·cos(4θ)\n8 petals (daisy)',
    },
  ];

  const limaconFigures = [
    {
      fn: (t) => 3 + 1 * Math.cos(t),
      maxR: 4.5,
      label: 'a/b ≈ 3',
      sublabel: 'r = 3 + cos(θ)\nConvex — smooth, no dimple',
    },
    {
      fn: (t) => 2.5 + 2 * Math.cos(t),
      maxR: 4.5,
      label: 'a/b ≈ 1.25',
      sublabel: 'r = 2.5 + 2·cos(θ)\nDimpled — slight inward dent',
    },
    {
      fn: (t) => 2 + 2 * Math.cos(t),
      maxR: 4.5,
      label: 'a/b = 1',
      sublabel: 'r = 2 + 2·cos(θ)\nCardioid — heart shape',
    },
    {
      fn: (t) => 1.5 + 2 * Math.cos(t),
      maxR: 4.5,
      label: 'a/b ≈ 0.75',
      sublabel: 'r = 1.5 + 2·cos(θ)\nInner loop — self-crossing',
    },
  ];

  return (
    <div className="learn-overlay" onClick={onClose}>
      <div className="learn-panel" ref={panelRef} onClick={e => e.stopPropagation()}>
        <button className="learn-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        <h2 className="learn-title">Polar Curves: A Student's Guide</h2>
        <p className="learn-subtitle">Understanding Rose Curves and Limaçons</p>

        <div className="learn-section">
          <h3>Why Polar Coordinates?</h3>
          <p>
            You're probably used to the Cartesian coordinate system, where every point
            is described by an <em>(x, y)</em> pair: how far right and how far up.
            Polar coordinates take a different approach &mdash; every point is described
            by <em>(r, &theta;)</em>, where:
          </p>
          <dl className="learn-dl">
            <dt><strong>r</strong> &mdash; the <em>radius</em></dt>
            <dd>
              The straight-line distance from the origin (center) to the point.
              Always non-negative in this app (though r <em>can</em> be negative in
              mathematics, which reflects the point across the origin).
            </dd>
            <dt><strong>&theta;</strong> &mdash; the <em>angle</em></dt>
            <dd>
              Measured from the positive x-axis, rotating counterclockwise.
              Usually given in radians: 0 to 2&pi; for a full circle.
            </dd>
          </dl>
          <p>
            For a polar curve, <em>r</em> is a function of <em>&theta;</em>:
            we write <em>r = f(&theta;)</em>. As the angle sweeps from 0 to 2&pi;,
            the radius changes, tracing out a shape. This is perfect for curves
            with rotational symmetry &mdash; flowers, hearts, spirals.
          </p>
        </div>

        <div className="learn-divider" />

        <div className="learn-section">
          <h3>Rose Curves: The Details</h3>
          <div className="learn-equation">r = a &middot; cos(n&theta;) &nbsp; or &nbsp; r = a &middot; sin(n&theta;)</div>
          <p>
            Rose curves produce symmetric, petal-shaped patterns that look like
            flowers. The integer <em>n</em> controls the number of petals, and the
            coefficient <em>a</em> controls their length.
          </p>

          <h4 className="learn-h4">How the Petal Count Works</h4>
          <p>
            This is the trickiest part of rose curves, and also the most beautiful.
            The number of petals depends on whether <em>n</em> is <strong>odd</strong>
            or <strong>even</strong>:
          </p>
          <dl className="learn-dl">
            <dt><strong>n is odd</strong> (1, 3, 5, &hellip;)</dt>
            <dd>
              The curve has exactly <em>n</em> petals, and it completes the entire
              shape within <strong>&pi;</strong> radians (180&deg;). Each petal is
              traced twice &mdash; once in the forward direction and once in reverse
              (when r becomes negative). That's why the petal count equals n, not 2n.
            </dd>
            <dt><strong>n is even</strong> (2, 4, 6, &hellip;)</dt>
            <dd>
              The curve has <strong>2n</strong> petals, and it takes the full
              <strong>2&pi;</strong> radians (360&deg;) to complete. Each petal
              is traced exactly once, so you get twice as many.
            </dd>
          </dl>

          <h4 className="learn-h4">cos vs sin: It's Just a Rotation</h4>
          <p>
            Swapping <em>cos</em> for <em>sin</em> doesn't change the shape of
            the rose &mdash; it simply <strong>rotates</strong> the entire curve
            by &pi;/2 (90&deg;) radians. Try generating a rose with cos, then with
            sin, and compare. The petals shift position but the count and size
            stay identical.
          </p>

          <h4 className="learn-h4">The Amplitude a</h4>
          <p>
            The parameter <em>a</em> scales the entire curve. Each petal extends
            out to exactly <em>r = a</em> at its tip. Double <em>a</em>, and the
            rose gets twice as big in every direction. The <em>shape</em> (petal
            count, angles, proportions) remains unchanged.
          </p>

          <h4 className="learn-h4">Visual Examples</h4>
          <p>Here is how <em>n</em> changes the petal count for <em>r = 2&middot;cos(n&theta;)</em>:</p>
          <div className="learn-figure-grid">
            {roseFigures.map((fig, i) => (
              <PolarCurveFigure key={i} {...fig} />
            ))}
          </div>
        </div>

        <div className="learn-divider" />

        <div className="learn-section">
          <h3>Limaçons: The Details</h3>
          <div className="learn-equation">r = a &plusmn; b &middot; cos(&theta;) &nbsp; or &nbsp; r = a &plusmn; b &middot; sin(&theta;)</div>
          <p>
            Limaçons (pronounced "lee-muh-sawns", French for "snail") are a family
            of curves that includes heart shapes, dimpled ovals, and loops. Unlike
            roses, the trigonometric argument is always just <em>&theta;</em> (no
            integer multiplier), so the shape is determined by the ratio
            <strong> a / b</strong>.
          </p>

          <h4 className="learn-h4">The a/b Ratio: The Master Control</h4>
          <p>
            Limaçons come in four distinct types. The ratio <em>a/b</em> is the
            single number that tells you which type you're looking at:
          </p>
          <table className="learn-table">
            <thead>
              <tr>
                <th>Condition</th>
                <th>Shape Name</th>
                <th>Key Feature</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>a/b &gt; 2</strong></td>
                <td>Convex limaçon</td>
                <td>Smooth, rounded oval with no indentations. Looks like a stretched circle.</td>
              </tr>
              <tr>
                <td><strong>1 &lt; a/b &lt; 2</strong></td>
                <td>Dimpled limaçon</td>
                <td>A visible inward dent appears on one side. The curve is still simple (no crossing).</td>
              </tr>
              <tr>
                <td><strong>a/b = 1</strong></td>
                <td>Cardioid</td>
                <td>The dent becomes a sharp cusp (a point). The shape is a heart (hence "cardioid").</td>
              </tr>
              <tr>
                <td><strong>0 &lt; a/b &lt; 1</strong></td>
                <td>Limaçon with a loop</td>
                <td>The curve crosses itself, forming a small inner loop inside the outer curve.</td>
              </tr>
            </tbody>
          </table>
          <p>
            A special case: when <strong>a = 0</strong>, the limaçon reduces to
            <em>r = b&middot;cos(&theta;)</em>, which is a <strong>circle</strong>
            of diameter <em>b</em> passing through the origin.
          </p>

          <h4 className="learn-h4">cos vs sin and the Operator</h4>
          <p>
            Just like with roses, using <em>sin</em> instead of <em>cos</em>
            rotates the curve by &pi;/2. The operator (<em>+</em> or <em>&minus;</em>)
            flips the curve relative to the vertical axis. Try <em>r = 2 + 2&middot;cos(&theta;)</em>
            vs <em>r = 2 &minus; 2&middot;cos(&theta;)</em> &mdash; one faces right,
            the other faces left.
          </p>

          <h4 className="learn-h4">Visual Examples</h4>
          <p>Here is how the <em>a/b</em> ratio transforms the limaçon shape:</p>
          <div className="learn-figure-grid">
            {limaconFigures.map((fig, i) => (
              <PolarCurveFigure key={i} {...fig} />
            ))}
          </div>
        </div>

        <div className="learn-divider" />

        <div className="learn-section">
          <h3>Connecting Polar and Cartesian Views</h3>
          <p>
            One of the most powerful features of this tool is the side-by-side
            display. The <strong>polar graph</strong> shows the curve in the
            (x, y) plane, while the <strong>Cartesian graph</strong> shows the
            same data as a function plot: <em>r</em> on the y-axis vs
            <em>&theta;</em> on the x-axis.
          </p>
          <p>
            This dual view helps you see <em>why</em> the polar curve has its
            shape. For a rose with <em>n = 3</em>, the Cartesian graph shows
            three full "humps" of the cosine wave in the range [0, &pi;),
            which correspond to the three petals. When the Cartesian graph
            crosses zero (r = 0), the polar curve passes through the origin.
          </p>
        </div>

        <div className="learn-divider" />

        <div className="learn-section">
          <h3>Key Points &amp; The Data Table</h3>
          <p>
            After generating a curve, the <strong>data table</strong> at the
            bottom shows the key points: angles where something important happens.
            These include:
          </p>
          <ul className="learn-bullets">
            <li><strong>Maxima</strong> &mdash; where <em>r</em> reaches its largest value (petal tips in roses, the outer edge in limaçons)</li>
            <li><strong>Minima</strong> &mdash; where <em>r</em> reaches its most negative value (petal tips on the opposite side)</li>
            <li><strong>Zero crossings</strong> &mdash; where <em>r = 0</em> and the curve passes through the origin</li>
            <li><strong>Period boundaries</strong> &mdash; at 0, &pi;, and 2&pi; depending on the curve type</li>
          </ul>
          <p>
            The cursor in the data table highlights the column closest to your
            current animation step, helping you connect the visual position on
            the graphs to the exact numerical values.
          </p>
        </div>

        <div className="learn-divider" />

        <div className="learn-section">
          <h3>Tips for Exploration</h3>
          <ul className="learn-bullets">
            <li>Start with <strong>n = 1 through n = 6</strong> for roses to see how the petal pattern builds.</li>
            <li>Try <strong>odd vs even n</strong> and watch the Cartesian graph to see why one completes in &pi; and the other in 2&pi;.</li>
            <li>For limaçons, fix <strong>b = 2</strong> and vary <strong>a</strong> from 5 down to 1 to watch the curve evolve through all four types.</li>
            <li>Toggle <strong>dark/light mode</strong> if the graph is hard to read &mdash; sometimes one theme makes the curve pop better.</li>
            <li>Use the <strong>step buttons</strong> (&laquo; &gt; &raquo;) to move through the trace slowly and see exactly where each data point lies.</li>
            <li>Download the <strong>PNG</strong> of the polar graph to save a particular curve for your notes.</li>
          </ul>
        </div>

        <div className="learn-divider" />

        <div className="learn-section">
          <h3>Summary</h3>
          <table className="learn-table">
            <thead>
              <tr>
                <th>Curve Type</th>
                <th>Equation</th>
                <th>Key Parameters</th>
                <th>What Changes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Rose</strong></td>
                <td>r = a&middot;cos(n&theta;)</td>
                <td>a, n</td>
                <td>a = petal size, n = petal count (odd: n, even: 2n)</td>
              </tr>
              <tr>
                <td><strong>Limaçon</strong></td>
                <td>r = a &plusmn; b&middot;cos(&theta;)</td>
                <td>a, b, &plusmn;</td>
                <td>a/b ratio determines shape (convex &rarr; dimpled &rarr; cardioid &rarr; loop)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default memo(LearnPanel);
