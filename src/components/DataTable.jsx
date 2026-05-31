import { memo, useRef, useEffect } from 'react';
import { formatAngle } from '../utils/calculations';

function DataTable({ keyPoints, currentStep, allData, curveColor }) {
  const activeCellRef = useRef(null);
  const scrollRef = useRef(null);

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
    if (activeCellRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const cell = activeCellRef.current;
      const cellLeft = cell.offsetLeft;
      const cellRight = cellLeft + cell.offsetWidth;
      const cScroll = container.scrollLeft;
      const cWidth = container.clientWidth;
      if (cellLeft < cScroll || cellRight > cScroll + cWidth) {
        container.scrollLeft = cellLeft - cWidth / 2 + cell.offsetWidth / 2;
      }
    }
  }, [highlightedIdx]);

  return (
    <div className="graph-container table-container">
      <div className="graph-title">Key Points</div>
      <div className="table-scroll" ref={scrollRef}>
        <table className="data-table horizontal-table">
          <tbody>
            {keyPoints.length === 0 ? (
              <tr>
                <td className="empty-msg" colSpan={2}>No key points found</td>
              </tr>
            ) : (
              <>
                <tr>
                  <th className="data-table-header">R</th>
                  {keyPoints.map((pt, i) => (
                    <td
                      key={i}
                      ref={i === highlightedIdx ? activeCellRef : null}
                      className={i === highlightedIdx ? 'r-value active-col' : 'r-value'}
                      style={
                        i === highlightedIdx
                          ? {
                              backgroundColor: curveColor + '20',
                              borderLeft: `3px solid ${curveColor}`,
                            }
                          : {}
                      }
                    >
                      {pt.r}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="data-table-header">&theta;</th>
                  {keyPoints.map((pt, i) => (
                    <td
                      key={i}
                      className={i === highlightedIdx ? 'theta-value active-col' : 'theta-value'}
                      style={
                        i === highlightedIdx
                          ? {
                              backgroundColor: curveColor + '20',
                              borderLeft: `3px solid ${curveColor}`,
                            }
                          : {}
                      }
                    >
                      {formatAngle(pt.theta)}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(DataTable);
