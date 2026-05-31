import { memo } from 'react';
import CartesianGraph from './CartesianGraph';
import DataTable from './DataTable';
import PolarGraph from './PolarGraph';

function VisualizationPanel({
  allData,
  tableData,
  currentStep,
  curveColor,
  animating,
  animProgress,
}) {
  return (
    <div className="viz-panel">
      {!allData || allData.length === 0 ? (
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
          <div className="viz-grid">
            <div className="viz-section">
              <CartesianGraph
                allData={allData}
                currentStep={currentStep}
                tableData={tableData}
                curveColor={curveColor}
              />
            </div>
            <div className="viz-section">
              <DataTable
                tableData={tableData}
                currentStep={currentStep}
                allData={allData}
                curveColor={curveColor}
              />
            </div>
            <div className="viz-section">
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
