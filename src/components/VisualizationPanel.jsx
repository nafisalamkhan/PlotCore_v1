import { memo } from 'react';
import CartesianGraph from './CartesianGraph';
import DataTable from './DataTable';
import PolarGraph from './PolarGraph';
import { formatPeriodLabel } from '../utils/calculations';

function VisualizationPanel({
  allData,
  keyPoints,
  period,
  currentStep,
  curveColor,
  isPlaying,
  animProgress,
  isDark,
  onStepForward,
  onStepBackward,
  onReset,
  onRestart,
  onTogglePlay,
  params,
}) {
  const hasData = allData && allData.length > 0;
  const atStart = currentStep <= 0;
  const atEnd = currentStep >= (allData ? allData.length - 1 : 0);

  const handleClick = (fn) => (e) => {
    e.preventDefault();
    e.target.blur();
    fn();
  };

  return (
    <div className="viz-panel">
      {!hasData ? (
        <div className="placeholder">
          <div className="placeholder-icon">◈</div>
          <p>Set parameters and click <strong>Generate</strong></p>
        </div>
      ) : (
        <>
          <div className="viz-top-bar">
            <div className="period-badge">
              <span className="period-label">Period</span>
              <span className="period-value">{formatPeriodLabel(period)}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${animProgress}%`,
                  backgroundColor: curveColor,
                }}
              />
            </div>
            <span className="progress-text">{Math.round(animProgress)}%</span>
            <div className="anim-buttons">
              <button
                className="ctrl-btn"
                onClick={handleClick(onReset)}
                disabled={atStart}
                title="Reset to start"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M15 3.5a1 1 0 0 1 1 1v11a1 1 0 1 1-2 0v-11a1 1 0 0 1 1-1Z" clipRule="evenodd" /><path fillRule="evenodd" d="M4 10L12 4v12L4 10Z" clipRule="evenodd" /></svg>
              </button>
              <button
                className="ctrl-btn"
                onClick={handleClick(onStepBackward)}
                disabled={atStart}
                title="Step backward"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z" clipRule="evenodd"/></svg>
              </button>
              <button
                className={`ctrl-btn ctrl-btn-play ${isPlaying ? 'is-playing' : ''}`}
                onClick={handleClick(onTogglePlay)}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z"/></svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z"/></svg>
                )}
              </button>
              <button
                className="ctrl-btn"
                onClick={handleClick(onStepForward)}
                disabled={atEnd}
                title="Step forward"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M12.207 2.232a.75.75 0 0 0 .025 1.06L16.378 7.25H6.375a5.375 5.375 0 0 0 0 10.75h2.875a.75.75 0 0 0 0-1.5H6.375a3.875 3.875 0 0 1 0-7.75h10.003l-4.146 3.957a.75.75 0 0 0 1.036 1.085l5.5-5.25a.75.75 0 0 0 0-1.085l-5.5-5.25a.75.75 0 0 0-1.06.025Z" clipRule="evenodd"/></svg>
              </button>
              <button
                className="ctrl-btn"
                onClick={handleClick(onRestart)}
                title="Restart from beginning"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>

          <div className="viz-graphs-row">
            <div className="viz-section-cartesian">
              <CartesianGraph
                allData={allData}
                currentStep={currentStep}
                keyPoints={keyPoints}
                curveColor={curveColor}
                isDark={isDark}
              />
            </div>
            <div className="viz-section-polar">
              <PolarGraph
                allData={allData}
                currentStep={currentStep}
                curveColor={curveColor}
                isDark={isDark}
                keyPoints={keyPoints}
                params={params}
              />
            </div>
          </div>

          <div className="viz-table-row">
            <DataTable
              keyPoints={keyPoints}
              currentStep={currentStep}
              allData={allData}
              curveColor={curveColor}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default memo(VisualizationPanel);
