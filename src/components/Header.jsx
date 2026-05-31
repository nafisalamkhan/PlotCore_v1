import { memo } from 'react';

function Header() {
  return (
    <header className="app-header">
      <h1 className="app-title">
        <span className="title-icon">⟐</span>
        PlotCore
        <span className="title-sub">Polar Curve Animator</span>
      </h1>
      <p className="app-desc">
        Visualize how Rose curves and Limaçons are formed — mapped from Cartesian to Polar coordinates
      </p>
    </header>
  );
}

export default memo(Header);
