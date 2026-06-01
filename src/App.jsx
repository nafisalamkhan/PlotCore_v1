import { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import VisualizationPanel from './components/VisualizationPanel';
import { calculateCurve, extractKeyPoints } from './utils/calculations';
import './App.css';

const CURVE_COLORS = ['#66fcf1', '#b026ff', '#ff6b6b', '#ffd93d', '#6bcbff'];
const ANIMATION_INTERVAL_MS = 12;

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('plotcore-theme');
    if (stored === 'dark' || stored === 'light') return stored === 'dark';
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

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
  const [keyPoints, setKeyPoints] = useState([]);
  const [period, setPeriod] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [animProgress, setAnimProgress] = useState(0);
  const [isDark, setIsDark] = useState(getInitialTheme);

  const intervalRef = useRef(null);
  const stepRef = useRef(0);
  const allDataRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('plotcore-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

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
      const len = allDataRef.current ? allDataRef.current.length : 0;
      if (len < 2) return;
      const skip = Math.max(1, Math.floor(len / 360));
      stepRef.current += skip;
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
    const skip = Math.max(1, Math.floor(len / 50));
    stepRef.current = Math.min(stepRef.current + skip, len - 1);
    setCurrentStep(stepRef.current);
    setAnimProgress(len > 1 ? (stepRef.current / (len - 1)) * 100 : 0);
  }, [pause]);

  const stepBackward = useCallback(() => {
    pause();
    const len = allDataRef.current ? allDataRef.current.length : 0;
    const skip = Math.max(1, Math.floor(len / 50));
    stepRef.current = Math.max(stepRef.current - skip, 0);
    setCurrentStep(stepRef.current);
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

    const { data, period: p } = calculateCurve(params);
    const points = extractKeyPoints(data, p);

    allDataRef.current = data;
    stepRef.current = 0;
    setAllData(data);
    setKeyPoints(points);
    setPeriod(p);
    setCurrentStep(0);
    setAnimProgress(0);

    requestAnimationFrame(() => play());
  }, [params, pause, play]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="app">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />
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
          keyPoints={keyPoints}
          period={period}
          currentStep={currentStep}
          curveColor={curveColor}
          isPlaying={isPlaying}
          animProgress={animProgress}
          isDark={isDark}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onReset={reset}
          onRestart={restart}
          onTogglePlay={togglePlay}
          params={params}
        />
      </main>
    </div>
  );
}

export default App;
