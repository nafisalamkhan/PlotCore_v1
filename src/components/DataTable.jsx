import { memo, useRef, useEffect } from 'react';
import { formatAngle } from '../utils/calculations';

function DataTable({ keyPoints, currentStep, allData, curveColor }) {
  const activeRowRef = useRef(null);

  let highlightedIdx = -1;
  if (currentStep >= 0 && allData && allData.length > 0 && keyPoints.length > 0) {
    const currentTheta = allData[currentStep].theta;
    let minDist = Infinity;
    keyPoints.forEach((pt, i) => {
      const dist = Math.abs(pt.theta - currentTheta);
      if (dist < minDist) {
        minDist = dist;
        highlightedIdx = i;
      }
    });
  }

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlightedIdx]);

  return (
    <div className="graph-container table-container">
      <div className="graph-title">Key Points</div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>r</th>
              <th>&theta;</th>
            </tr>
          </thead>
          <tbody>
            {keyPoints.length === 0 ? (
              <tr>
                <td colSpan={2} className="empty-msg">
                  No key points found
                </td>
              </tr>
            ) : (
              keyPoints.map((pt, i) => (
                <tr
                  key={i}
                  ref={i === highlightedIdx ? activeRowRef : null}
                  className={i === highlightedIdx ? 'active-row' : ''}
                  style={
                    i === highlightedIdx
                      ? {
                          backgroundColor: curveColor + '20',
                          borderLeft: `3px solid ${curveColor}`,
                        }
                      : {}
                  }
                >
                  <td className="r-value">{pt.r}</td>
                  <td className="theta-value">{formatAngle(pt.theta)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(DataTable);
