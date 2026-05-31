import { memo, useRef, useEffect } from 'react';
import { formatAngle } from '../utils/calculations';

function DataTable({ tableData, currentStep, allData, curveColor }) {
  const activeRowRef = useRef(null);

  let highlightedIdx = -1;
  if (currentStep >= 0 && allData && allData.length > 0 && tableData.length > 0) {
    const currentTheta = allData[currentStep].theta;
    let minDist = Infinity;
    tableData.forEach((pt, i) => {
      const dist = Math.abs(pt.theta - currentTheta);
      if (dist < minDist) {
        minDist = dist;
        highlightedIdx = i;
      }
    });
  }

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedIdx]);

  return (
    <div className="graph-container table-container">
      <div className="graph-title">Key Data Points</div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>r</th>
              <th>θ</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-msg">
                  No whole-number r values found
                </td>
              </tr>
            ) : (
              tableData.map((pt, i) => (
                <tr
                  key={i}
                  ref={i === highlightedIdx ? activeRowRef : null}
                  className={i === highlightedIdx ? 'active-row' : ''}
                  style={
                    i === highlightedIdx
                      ? {
                          backgroundColor: curveColor + '25',
                          borderLeft: `4px solid ${curveColor}`,
                        }
                      : {}
                  }
                >
                  <td>{i + 1}</td>
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
