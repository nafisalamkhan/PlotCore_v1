import { memo, useCallback } from 'react';

/**
 * Render controls for selecting a curve type, editing curve parameters, previewing the resulting polar equation, and triggering generation/animation.
 *
 * @param {{curveType: string, params: Object, onParamsChange: function, onGenerate: function, disabled: boolean}} props
 * @param {'rose'|'limacon'} props.curveType - Currently selected curve type.
 * @param {{a: number, n?: number, b?: number, operator?: string, func: string}} props.params - Current parameter values used to build the equation preview.
 * @param {(updatedParams: Object) => void} props.onParamsChange - Called with an updated params object when any input changes.
 * @param {() => void} props.onGenerate - Called when the Generate & Animate button is clicked.
 * @param {boolean} props.disabled - When true, inputs/selects are disabled and the generate button shows a busy label.
 * @returns {JSX.Element} The input panel element containing curve tabs, parameter inputs, equation preview, and generate button.
 */
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

      <div className="formula-box">
        <span className="formula-label">Equation:</span>
        <span className="formula-equation">
          {curveType === 'rose' ? (
            <>r = {params.a}&thinsp;·&thinsp;{params.func}({params.n}&theta;)</>
          ) : (
            <>r = {params.a}&thinsp;{params.operator}&thinsp;{params.b}&thinsp;·&thinsp;{params.func}(&theta;)</>
          )}
        </span>
      </div>

      <button className="generate-btn" onClick={onGenerate} disabled={disabled}>
        {disabled ? '⏳ Animating...' : '▶ Generate & Animate'}
      </button>
    </div>
  );
}

export default memo(InputPanel);
