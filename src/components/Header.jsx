import { memo } from 'react';

function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-icon">◈</div>
        <div className="header-titles">
          <h1>PlotCore_v1</h1>
          <div className="sub">Polar Curve Animator</div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
