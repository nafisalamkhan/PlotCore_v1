import { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import VisualizationPanel from './components/VisualizationPanel';
import { calculateCurve, extractWholeNumberPairs } from './utils/calculations';
import './App.css';

const CURVE_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];
const ANIMATION_INTERVAL_MS = 12;

function App() {
  const [curveType, setCurveType] = useState('rose');
  const [params, setParams] = useState({
    curveType: 'rose',
    a: 2,
    b: 2,
    n: 3,
    func: 'cos',
    operator: '+',
  });
  const [allData, setAllData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [animating, setAnimating] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [animProgress, setAnimProgress] = useState(0);

  const intervalRef = useRef(null);
  const stepRef = useRef(0);
  const allDataRef = useRef(null);

  const curveColor = CURVE_COLORS[colorIndex % CURVE_COLORS.length];

  const handleParamsChange = useCallback((newParams) => {
    setParams(newParams);
    setCurveType(newParams.curveType);
  }, []);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAnimating(false);
  }, []);

  const startAnimation = useCallback((data) => {
    stopAnimation();
    allDataRef.current = data;
    stepRef.current = 0;
    setAllData(data);
    setCurrentStep(0);
    setAnimProgress(0);
    setAnimating(true);

    intervalRef.current = setInterval(() => {
      stepRef.current += 1;
      if (stepRef.current >= data.length - 1) {
        stepRef.current = data.length - 1;
        setCurrentStep(data.length - 1);
        setAnimProgress(100);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setAnimating(false);
        return;
      }
      setCurrentStep(stepRef.current);
      setAnimProgress((stepRef.current / (data.length - 1)) * 100);
    }, ANIMATION_INTERVAL_MS);
  }, [stopAnimation]);

  const handleGenerate = useCallback(() => {
    stopAnimation();
    setColorIndex((prev) => (prev + 1) % CURVE_COLORS.length);

    const { data } = calculateCurve(params);
    const table = extractWholeNumberPairs(data);

    setAllData(data);
    setTableData(table);
    setCurrentStep(0);
    setAnimProgress(0);

    requestAnimationFrame(() => {
      startAnimation(data);
    });
  }, [params, stopAnimation, startAnimation]);

  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <InputPanel
          curveType={curveType}
          params={params}
          onParamsChange={handleParamsChange}
          onGenerate={handleGenerate}
          disabled={animating}
        />
        <VisualizationPanel
          allData={allData}
          tableData={tableData}
          currentStep={currentStep}
          curveColor={curveColor}
          animating={animating}
          animProgress={animProgress}
        />
      </main>
    </div>
  );
}

export default App;
