import { memo } from 'react';
import logo from '../assets/logo.png';

function Header({ isDark, onToggleTheme, onOpenLearn }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <img src={logo} alt="PlotCore" className="header-icon" />
        <div className="header-titles">
          <h1>PlotCore_v1</h1>
          <div className="sub">Polar Curve Animator</div>
        </div>
      </div>
      <div className="header-actions">
      <button
        className="theme-toggle"
        onClick={onOpenLearn}
        title="Learn about polar curves"
        aria-label="Open learn panel"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path d="M10.362 1.093a.75.75 0 0 0-.724 0l-7.5 4.125a.75.75 0 0 0 0 1.328l7.5 4.125a.75.75 0 0 0 .724 0l7.5-4.125a.75.75 0 0 0 0-1.328l-7.5-4.125Z" />
          <path d="M2.5 8.757v4.375a.75.75 0 0 0 1.5 0V9.956l5.25 2.888a.75.75 0 0 0 .724 0l5.25-2.888v3.176a.75.75 0 0 0 1.5 0V8.757l-6.138 3.376a.75.75 0 0 1-.724 0L2.5 8.757Z" />
        </svg>
      </button>
      <button
        className="theme-toggle"
        onClick={onToggleTheme}
        title={isDark ? 'Light mode' : 'Dark mode'}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-.464 4.95.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 1.414Zm2.12-10.607a1 1 0 0 1 0 1.414l-.706.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0ZM17 11a1 1 0 1 0 0-2h-1a1 1 0 1 0 0 2h1Zm-7 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM5.05 6.464A1 1 0 1 0 6.465 5.05l-.708-.707a1 1 0 0 0-1.414 1.414l.707.707Zm1.414 8.486-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414ZM4 11a1 1 0 1 0 0-2H3a1 1 0 0 0 0 2h1Z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      </div>
    </header>
  );
}

export default memo(Header);
