import { memo } from 'react';
import CartesianGraph from './CartesianGraph';
import DataTable from './DataTable';
import PolarGraph from './PolarGraph';

/**
 * Render the visualization panel that shows either a placeholder (when no curve data) or an animation/control UI with a progress indicator and three visualization sections: Cartesian graph, data table, and polar graph.
 *
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.allData - Full dataset for the visualizations; used to derive availability and length.
 * @param {Array<Object>} props.tableData - Data formatted for the DataTable component.
 * @param {number} props.currentStep - Current animation step index.
 * @param {string} props.curveColor - CSS color used for the curve and progress bar.
 * @param {boolean} props.isPlaying - Playback state; true when animation is playing.
 * @param {number} props.animProgress - Animation progress as a percentage (0–100).
 * @param {Function} props.onStepForward - Callback to advance one step.
 * @param {Function} props.onStepBackward - Callback to go back one step.
 * @param {Function} props.onReset - Callback to reset to the first step.
 * @param {Function} props.onRestart - Callback to restart animation from the beginning.
 * @param {Function} props.onTogglePlay - Callback to toggle play/pause.
 * @returns {JSX.Element} The rendered visualization panel.
 */
function VisualizationPanel({
  allData,
  tableData,
  currentStep,
  curveColor,
  isPlaying,
  animProgress,
  onStepForward,
  onStepBackward,
  onReset,
  onRestart,
  onTogglePlay,
}) {
  const hasData = allData && allData.length > 0;
  const atStart = currentStep <= 0;
  const atEnd = currentStep >= (allData ? allData.length - 1 : 0);

  return (
    <div className="viz-panel">
      {!hasData ? (
        <div className="placeholder">
          <div className="placeholder-icon">⟐</div>
          <p>Configure your curve parameters and click <strong>Generate &amp; Animate</strong></p>
        </div>
      ) : (
        <>
          <div className="viz-controls">
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
          </div>

          <div className="anim-buttons">
            <button className="anim-btn" onClick={onReset} disabled={atStart} title="Reset to start">
              ⏮
            </button>
            <button className="anim-btn" onClick={onStepBackward} disabled={atStart} title="Step backward">
              ⏪
            </button>
            <button
              className={`anim-btn anim-btn-play ${isPlaying ? 'playing' : ''}`}
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="anim-btn" onClick={onStepForward} disabled={atEnd} title="Step forward">
              ⏩
            </button>
            <button className="anim-btn" onClick={onRestart} title="Restart from beginning">
              🔄
            </button>
          </div>

          <div className="viz-grid">
            <div className="viz-section-cartesian">
              <CartesianGraph
                allData={allData}
                currentStep={currentStep}
                tableData={tableData}
                curveColor={curveColor}
              />
            </div>
            <div className="viz-section-table">
              <DataTable
                tableData={tableData}
                currentStep={currentStep}
                allData={allData}
                curveColor={curveColor}
              />
            </div>
            <div className="viz-section-polar">
              <PolarGraph
                allData={allData}
                currentStep={currentStep}
                curveColor={curveColor}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(VisualizationPanel);
