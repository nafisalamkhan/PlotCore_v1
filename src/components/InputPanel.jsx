import { memo, useCallback } from 'react';

function InputPanel({ curveType, params, onParamsChange, onGenerate, disabled }) {
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onParamsChange({ ...params, [field]: value });
  }, [params, onParamsChange]);

  const handleCurveTypeChange = useCallback((type) => {
    onParamsChange({ ...params, curveType: type });
  }, [params, onParamsChange]);

  return (
    <div className="input-panel">
      <div className="input-section-label">Curve Type</div>
      <div className="curve-tabs">
        <button
          className={`tab-btn ${curveType === 'rose' ? 'active' : ''}`}
          onClick={() => handleCurveTypeChange('rose')}
        >
          Rose
        </button>
        <button
          className={`tab-btn ${curveType === 'limacon' ? 'active' : ''}`}
          onClick={() => handleCurveTypeChange('limacon')}
        >
          Limaçon
        </button>
      </div>

      <div className="input-section-label">Parameters</div>
      <div className="params-group">
        <div className="param-row">
          <label>A</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={params.a}
            onChange={handleChange('a')}
            disabled={disabled}
          />
        </div>

        {curveType === 'rose' && (
          <div className="param-row">
            <label>N</label>
            <input
              type="number"
              step="1"
              min="1"
              max="12"
              value={params.n}
              onChange={handleChange('n')}
              disabled={disabled}
            />
          </div>
        )}

        {curveType === 'limacon' && (
          <>
            <div className="param-row">
              <label>B</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={params.b}
                onChange={handleChange('b')}
                disabled={disabled}
              />
            </div>
            <div className="param-row">
              <label>Op</label>
              <select value={params.operator} onChange={handleChange('operator')} disabled={disabled}>
                <option value="+">+</option>
                <option value="-">−</option>
              </select>
            </div>
          </>
        )}

        <div className="param-row">
          <label>Fn</label>
          <select value={params.func} onChange={handleChange('func')} disabled={disabled}>
            <option value="cos">cos</option>
            <option value="sin">sin</option>
          </select>
        </div>
      </div>

      <div className="formula-box">
        <span className="formula-label">Equation</span>
        <span className="formula-equation">
          {curveType === 'rose' ? (
            <>r = {params.a}&thinsp;·&thinsp;{params.func}({params.n}&theta;)</>
          ) : (
            <>r = {params.a}&thinsp;{params.operator}&thinsp;{params.b}&thinsp;·&thinsp;{params.func}(&theta;)</>
          )}
        </span>
      </div>

      <button className="generate-btn" onClick={onGenerate} disabled={disabled}>
        {disabled ? 'Animate…' : 'Generate'}
      </button>
    </div>
  );
}

export default memo(InputPanel);
