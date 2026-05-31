import { memo, useCallback } from 'react';

function InputPanel({ curveType, params, onParamsChange, onGenerate, disabled }) {
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onParamsChange({ ...params, [field]: value });
  }, [params, onParamsChange]);

  const handleCurveTypeChange = useCallback((type) => {
    onParamsChange({
      ...params,
      curveType: type,
    });
  }, [params, onParamsChange]);

  return (
    <div className="input-panel">
      <div className="curve-tabs">
        <button
          className={`tab-btn ${curveType === 'rose' ? 'active' : ''}`}
          onClick={() => handleCurveTypeChange('rose')}
        >
          <span className="tab-icon">🌹</span>
          Rose Petals
        </button>
        <button
          className={`tab-btn ${curveType === 'limacon' ? 'active' : ''}`}
          onClick={() => handleCurveTypeChange('limacon')}
        >
          <span className="tab-icon">💧</span>
          Limaçons
        </button>
      </div>

      <div className="params-grid">
        <div className="param-group">
          <label>a =</label>
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
          <div className="param-group">
            <label>n =</label>
            <input
              type="number"
              step="1"
              min="1"
              max="12"
              value={params.n}
              onChange={handleChange('n')}
              disabled={disabled}
            />
            <span className="param-hint">(integer 1–12)</span>
          </div>
        )}

        {curveType === 'limacon' && (
          <>
            <div className="param-group">
              <label>b =</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={params.b}
                onChange={handleChange('b')}
                disabled={disabled}
              />
            </div>
            <div className="param-group">
              <label>Op</label>
              <select value={params.operator} onChange={handleChange('operator')} disabled={disabled}>
                <option value="+">+</option>
                <option value="-">−</option>
              </select>
            </div>
          </>
        )}

        <div className="param-group">
          <label>Func</label>
          <select value={params.func} onChange={handleChange('func')} disabled={disabled}>
            <option value="cos">cos</option>
            <option value="sin">sin</option>
          </select>
        </div>
      </div>

      <div className="formula-display">
        {curveType === 'rose' ? (
          <span>r = {params.a} · {params.func}({params.n}θ)</span>
        ) : (
          <span>r = {params.a} {params.operator} {params.b} · {params.func}(θ)</span>
        )}
      </div>

      <button className="generate-btn" onClick={onGenerate} disabled={disabled}>
        {disabled ? 'Animating...' : '▶ Generate & Animate'}
      </button>
    </div>
  );
}

export default memo(InputPanel);
