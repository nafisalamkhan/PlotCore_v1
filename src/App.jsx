import { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import VisualizationPanel from './components/VisualizationPanel';
import { calculateCurve, extractWholeNumberPairs, filterMinMidMax } from './utils/calculations';
import './App.css';

const CURVE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];
const ANIMATION_INTERVAL_MS = 12;

/**
 * Root React component that manages curve generation, animation state, and UI composition.
 *
 * Handles curve parameter state, data generation, animation controls (play, pause, step,
 * restart, reset), derived table data, and cleanup. Renders the input panel and visualization
 * panel and wires their callbacks to the internal control functions.
 *
 * @returns {JSX.Element} The root JSX element for the curve visualization application.
 */
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
  const [isPlaying, setIsPlaying] = useState(false);
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

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (intervalRef.current) return;
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      stepRef.current += 1;
      const len = allDataRef.current ? allDataRef.current.length : 0;
      if (stepRef.current >= len - 1) {
        stepRef.current = len - 1;
        setCurrentStep(stepRef.current);
        setAnimProgress(100);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
        return;
      }
      setCurrentStep(stepRef.current);
      setAnimProgress((stepRef.current / (len - 1)) * 100);
    }, ANIMATION_INTERVAL_MS);
  }, []);

  const togglePlay = useCallback(() => {
    if (intervalRef.current) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const stepForward = useCallback(() => {
    pause();
    const len = allDataRef.current ? allDataRef.current.length : 0;
    stepRef.current = Math.min(stepRef.current + 1, len - 1);
    setCurrentStep(stepRef.current);
    setAnimProgress(len > 1 ? (stepRef.current / (len - 1)) * 100 : 0);
  }, [pause]);

  const stepBackward = useCallback(() => {
    pause();
    stepRef.current = Math.max(stepRef.current - 1, 0);
    setCurrentStep(stepRef.current);
    const len = allDataRef.current ? allDataRef.current.length : 0;
    setAnimProgress(len > 1 ? (stepRef.current / (len - 1)) * 100 : 0);
  }, [pause]);

  const reset = useCallback(() => {
    pause();
    stepRef.current = 0;
    setCurrentStep(0);
    setAnimProgress(0);
  }, [pause]);

  const restart = useCallback(() => {
    stepRef.current = 0;
    setCurrentStep(0);
    setAnimProgress(0);
    requestAnimationFrame(() => play());
  }, [play]);

  const handleGenerate = useCallback(() => {
    pause();
    setColorIndex((prev) => (prev + 1) % CURVE_COLORS.length);

    const { data } = calculateCurve(params);
    const rawTable = extractWholeNumberPairs(data);
    const filtered = filterMinMidMax(rawTable);

    allDataRef.current = data;
    stepRef.current = 0;
    setAllData(data);
    setTableData(filtered);
    setCurrentStep(0);
    setAnimProgress(0);

    requestAnimationFrame(() => play());
  }, [params, pause, play]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <InputPanel
          curveType={curveType}
          params={params}
          onParamsChange={handleParamsChange}
          onGenerate={handleGenerate}
          disabled={isPlaying}
        />
        <VisualizationPanel
          allData={allData}
          tableData={tableData}
          currentStep={currentStep}
          curveColor={curveColor}
          isPlaying={isPlaying}
          animProgress={animProgress}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onReset={reset}
          onRestart={restart}
          onTogglePlay={togglePlay}
        />
      </main>
    </div>
  );
}

export default App;
