import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  parseGrammarText,
  validateCNF,
  runCYK,
  generateRandomExample,
  EXAMPLE_LIBRARY,
} from './algorithms/cyk.ts';
import { CYKCell, CYKResult, ExampleCase } from './types/cyk.ts';
import { sound } from './utils/sound.ts';
import {
  exportJSON,
  exportCSV,
  generateShareURL,
  parseShareURL,
} from './utils/export.ts';

import { Header } from './components/Header.tsx';
import { GrammarEditor } from './components/GrammarEditor.tsx';
import { CYKTable } from './components/CYKTable.tsx';
import { CellModal } from './components/CellModal.tsx';
import { StepController } from './components/StepController.tsx';
import { AlgorithmFlow } from './components/AlgorithmFlow.tsx';
import { ParseTreeViewer } from './components/ParseTreeViewer.tsx';
import { AnswerPopup } from './components/AnswerPopup.tsx';
import { PrintReport } from './components/PrintReport.tsx';
import { ResultCard } from './components/ResultCard.tsx';
import { SubstringScanner } from './components/SubstringScanner.tsx';
import { GrammarCoverage } from './components/GrammarCoverage.tsx';

import { LandingPage } from './pages/LandingPage.tsx';
import { LearnPage } from './pages/LearnPage.tsx';
import { ExamplesPage } from './pages/ExamplesPage.tsx';
import { ApiDocsPage } from './pages/ApiDocsPage.tsx';
import { DownloadsPage } from './pages/DownloadsPage.tsx';

import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  X,
  Share2,
  FileText,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<
    'landing' | 'studio' | 'examples' | 'learn' | 'api' | 'downloads'
  >('landing');

  // Default Grammar & Input as requested
  const [grammarText, setGrammarText] = useState<string>(
    `S -> AB | BC\nA -> BA | a\nB -> CC | b\nC -> AB | a`
  );
  const [startSymbol, setStartSymbol] = useState<string>('S');
  const [inputString, setInputString] = useState<string>('baaba');

  // Algorithm State
  const [result, setResult] = useState<CYKResult | null>(null);
  const [selectedCell, setSelectedCell] = useState<CYKCell | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);

  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isDemoPaused, setIsDemoPaused] = useState<boolean>(false);

  // Settings & Theme
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('cyk_theme') as any) || 'system';
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme with HTML root class
  useEffect(() => {
    localStorage.setItem('cyk_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  // Load shared URL parameters if present
  useEffect(() => {
    const shared = parseShareURL();
    if (shared) {
      if (shared.grammarText) setGrammarText(shared.grammarText);
      if (shared.startSymbol) setStartSymbol(shared.startSymbol);
      if (shared.input) setInputString(shared.input);
      setActiveTab('studio');
      showToast('Loaded shared CYK configuration from URL');
    }
  }, []);

  // Global Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === ' ' && result && result.steps.length > 0) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'ArrowRight' && result) {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStepIndex((prev) => Math.min(result.steps.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' && result) {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setSelectedCell(null);
        setIsResultModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute CNF validation
  const validation = useMemo(() => {
    const parsed = parseGrammarText(grammarText);
    return validateCNF(parsed.grammar, startSymbol || parsed.startSymbol);
  }, [grammarText, startSymbol]);

  // Core CYK execution: runs algorithm and begins step execution smoothly without blocking popup
  const handleRunCYK = () => {
    const parsed = parseGrammarText(grammarText);
    const currentStart = startSymbol || parsed.startSymbol;

    const val = validateCNF(parsed.grammar, currentStart);
    if (!val.valid) {
      sound.play('rejected');
      showToast('Validation failed. Please fix CNF errors before running CYK.');
      return;
    }

    const res = runCYK(parsed.grammar, currentStart, inputString.trim());
    setResult(res);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setIsResultModalOpen(false);
    showToast(`CYK executed. Playing step-by-step table derivation.`);

    // Smooth scroll down to visualization flow
    setTimeout(() => {
      const el = document.getElementById('cyk-flow-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleValidateOnly = () => {
    if (validation.valid) {
      sound.play('productionSuccess');
      showToast('Chomsky Normal Form Grammar is strictly valid!');
    } else {
      sound.play('rejected');
      showToast(`Grammar has ${validation.errors.length} validation issue(s).`);
    }
  };

  const handleRandomExample = () => {
    const rand = generateRandomExample();
    setGrammarText(rand.grammarText);
    setStartSymbol(rand.startSymbol);
    setInputString(rand.input);
    setResult(null);
    setSelectedCell(null);
    showToast('Generated fresh random valid CNF grammar');
  };

  const handleSelectExample = (ex: ExampleCase) => {
    setGrammarText(ex.grammarText);
    setStartSymbol(ex.startSymbol);
    setInputString(ex.input);
    setActiveTab('studio');
    setResult(null);
    setSelectedCell(null);
    showToast(`Loaded "${ex.title}" into Parser Studio`);
  };

  const handleShare = () => {
    sound.play('click');
    const url = generateShareURL(grammarText, startSymbol, inputString);
    navigator.clipboard.writeText(url);
    showToast('Share link copied to clipboard!');
  };

  const handlePrint = () => {
    sound.play('click');
    window.print();
  };

  // Demo Mode flow
  const handleStartDemo = () => {
    sound.play('click');
    setActiveTab('studio');
    const classic = EXAMPLE_LIBRARY[0];
    setGrammarText(classic.grammarText);
    setStartSymbol(classic.startSymbol);
    setInputString(classic.input);

    const parsed = parseGrammarText(classic.grammarText);
    const res = runCYK(parsed.grammar, classic.startSymbol, classic.input);
    setResult(res);
    setCurrentStepIndex(0);
    setIsDemoMode(true);
    setIsDemoPaused(false);
    setIsPlaying(true);
    setPlaybackSpeed(1.5);
    setIsResultModalOpen(false);
    showToast('Starting Presentation Demo Mode...');

    setTimeout(() => {
      const el = document.getElementById('cyk-flow-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleExitDemo = () => {
    sound.play('click');
    setIsDemoMode(false);
    setIsPlaying(false);
  };

  const handleSkipDemo = () => {
    sound.play('click');
    if (result) {
      setCurrentStepIndex(result.steps.length - 1);
      setIsPlaying(false);
      setIsDemoMode(false);
      const resEl = document.getElementById('cyk-result-section');
      if (resEl) resEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onStartDemo={handleStartDemo}
        onShare={handleShare}
      />

      {/* Demo Mode Control Banner */}
      {isDemoMode && (
        <div
          id="demo-banner"
          className="sticky top-16 z-30 w-full bg-indigo-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            <strong className="tracking-wide">PRESENTATION DEMO MODE ACTIVE:</strong>
            <span className="hidden sm:inline">
              Step {currentStepIndex + 1} of {result?.steps.length || 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.play('click');
                setIsPlaying(!isPlaying);
              }}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded font-semibold flex items-center gap-1"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleSkipDemo}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded font-semibold flex items-center gap-1"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip to Result</span>
            </button>

            <button
              onClick={handleExitDemo}
              className="p-1 hover:bg-white/20 rounded"
              title="Exit Demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Body Viewport (Full Screen Width) */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'landing' && (
          <LandingPage
            onLaunchParser={() => {
              setActiveTab('studio');
              if (!result) handleRunCYK();
            }}
            onWatchDemo={handleStartDemo}
            onLearnCYK={() => setActiveTab('learn')}
            onViewAPI={() => setActiveTab('api')}
            onViewDownloads={() => setActiveTab('downloads')}
          />
        )}

        {activeTab === 'studio' && (
          <div className="space-y-6 w-full">
            {/* Split Top Section: Left Grammar Editor (4 cols on lg, 3 on xl) & Right Execution Panel (8 cols on lg, 9 on xl) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
              {/* Left Panel: Grammar Editor & Production Coverage Matrix */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                <GrammarEditor
                  grammarText={grammarText}
                  setGrammarText={setGrammarText}
                  startSymbol={startSymbol}
                  setStartSymbol={setStartSymbol}
                  inputString={inputString}
                  setInputString={setInputString}
                  validation={validation}
                  onValidate={handleValidateOnly}
                  onRunCYK={handleRunCYK}
                  onLoadExampleClick={() => setActiveTab('examples')}
                  onRandomExample={handleRandomExample}
                />

                {/* Grammar Rule Activation & Coverage Matrix */}
                <GrammarCoverage
                  grammarText={grammarText}
                  result={result}
                  currentStep={result?.steps[currentStepIndex]}
                />
              </div>

              {/* Right Panel: Flow Pipeline, Substring Scanner, and CYK Table */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-5">
                {/* 1. Algorithm Flow Pipeline */}
                <div id="cyk-flow-section" className="w-full">
                  <AlgorithmFlow
                    result={result}
                    currentLength={result?.steps[currentStepIndex]?.length || 1}
                  />
                </div>

                {/* 2. Live Substring Partition & Split Scanner (when result loaded) */}
                {result && (
                  <div className="w-full">
                    <SubstringScanner
                      input={result.input}
                      currentStep={result?.steps[currentStepIndex]}
                      result={result}
                    />
                  </div>
                )}

                {/* 3. Triangular Pyramid & CYK Table */}
                <div className="w-full">
                  <CYKTable
                    result={result}
                    currentStep={result?.steps[currentStepIndex]}
                    onSelectCell={(cell) => setSelectedCell(cell)}
                    selectedCell={selectedCell}
                  />
                </div>
              </div>
            </div>

            {/* 3. Step-by-Step Execution Player & Detailed Trace */}
            {result && result.steps.length > 0 && (
              <div className="pt-1 w-full">
                <StepController
                  steps={result.steps}
                  currentStepIndex={currentStepIndex}
                  setCurrentStepIndex={setCurrentStepIndex}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  speed={playbackSpeed}
                  setSpeed={setPlaybackSpeed}
                />
              </div>
            )}

            {/* 4. And At Last: The Final Parsing Result & Parse Tree */}
            {result && (
              <div className="space-y-5 pt-1 w-full">
                <ResultCard
                  result={result}
                  grammarText={grammarText}
                  onOpenModal={() => setIsResultModalOpen(true)}
                  onPrint={handlePrint}
                />

                {/* Parse Tree Derivation (when accepted) */}
                {result.accepted && result.parseTree && (
                  <div className="w-full">
                    <ParseTreeViewer
                      tree={result.parseTree}
                      input={result.input}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'examples' && (
          <ExamplesPage onSelectExample={handleSelectExample} />
        )}

        {activeTab === 'learn' && (
          <LearnPage onOpenStudio={() => setActiveTab('studio')} />
        )}

        {activeTab === 'api' && <ApiDocsPage />}

        {activeTab === 'downloads' && <DownloadsPage />}
      </main>

      {/* Footer (Full Screen Width) */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-5 text-center text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>CYK Parser Studio</strong> · Cocke–Younger–Kasami Algorithm Visualizer
          </div>
          <div className="flex items-center gap-4">
            <span>Dynamic Programming Matrix</span>
            <span>·</span>
            <span>Chomsky Normal Form</span>
            <span>·</span>
            <span>O(n³·|G|) Complexity</span>
          </div>
        </div>
      </footer>

      {/* Cell Details Modal */}
      {selectedCell && (
        <CellModal
          cell={selectedCell}
          result={result}
          onClose={() => setSelectedCell(null)}
        />
      )}

      {/* Answer Popup / Result Modal */}
      {isResultModalOpen && (
        <AnswerPopup
          result={result}
          grammarText={grammarText}
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          onViewTable={() => setIsResultModalOpen(false)}
          onPrint={handlePrint}
        />
      )}

      {/* Hidden Print-Specific Layout */}
      <PrintReport
        result={result}
        grammarText={grammarText}
        validation={validation}
      />
    </div>
  );
}
