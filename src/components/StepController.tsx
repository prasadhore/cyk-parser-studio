import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CYKStep } from '../types/cyk.ts';
import { sound } from '../utils/sound.ts';

interface StepControllerProps {
  steps: CYKStep[];
  currentStepIndex: number;
  setCurrentStepIndex: (idx: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (spd: number) => void;
}

export const StepController: React.FC<StepControllerProps> = ({
  steps,
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
}) => {
  const timerRef = useRef<any>(null);

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isPlaying && totalSteps > 0) {
      const intervalMs = Math.max(200, Math.floor(1000 / speed));
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            sound.play('demoCompleted');
            return prev;
          }
          const next = prev + 1;
          const step = steps[next];
          if (step?.matched) {
            sound.play('productionSuccess');
          } else {
            sound.play('stepCompleted');
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps, steps, setCurrentStepIndex, setIsPlaying]);

  if (totalSteps === 0) return null;

  const handleFirst = () => {
    sound.play('click');
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handlePrev = () => {
    sound.play('click');
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    sound.play('click');
    setIsPlaying(false);
    setCurrentStepIndex((prev) => {
      const next = Math.min(totalSteps - 1, prev + 1);
      if (steps[next]?.matched) sound.play('productionSuccess');
      return next;
    });
  };

  const handleLast = () => {
    sound.play('click');
    setIsPlaying(false);
    setCurrentStepIndex(totalSteps - 1);
  };

  const togglePlay = () => {
    sound.play('click');
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    sound.play('click');
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm transition-colors w-full min-w-0 max-w-full overflow-hidden">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Step-by-Step Algorithm Playback
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Speed:</span>
          {[0.5, 1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.play('click');
                setSpeed(s);
              }}
              className={`px-2 py-0.5 rounded font-mono text-xs transition-colors ${
                speed === s
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Timeline Scrubber */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Timeline Scrubber</span>
          <span>{Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% Complete</span>
        </div>
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            const idx = parseInt(e.target.value, 10);
            setCurrentStepIndex(idx);
            if (steps[idx]?.matched) sound.play('productionSuccess');
            else sound.play('stepCompleted');
          }}
          className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none"
        />
      </div>

      {/* Playback Button Group */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
        <button
          onClick={handleFirst}
          disabled={currentStepIndex === 0}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          title="Jump to first step"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          title="Previous step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentStepIndex >= totalSteps - 1 ? 'Replay' : 'Auto Play'}</span>
            </>
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={currentStepIndex >= totalSteps - 1}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          title="Next step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleLast}
          disabled={currentStepIndex >= totalSteps - 1}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          title="Jump to final step"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={handleRestart}
          className="p-2 ml-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Reset to beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time Dynamic Explanation Card */}
      {currentStep && (
        <div className="mt-1 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                {currentStep.type === 'init'
                  ? 'Base Initialization (Length 1)'
                  : currentStep.type === 'check_split'
                  ? `Split Check (k = ${currentStep.splitK})`
                  : 'Cell Aggregation Complete'}
              </span>
            </span>

            <span className="font-mono text-[10px] sm:text-[11px] text-slate-500">
              Cell T[{currentStep.cell[0]}][{currentStep.cell[1]}] · Substring "{currentStep.substring}"
            </span>
          </div>

          <p className="text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
            {currentStep.explanation}
          </p>

          {currentStep.checkingRule && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2 font-mono text-emerald-700 dark:text-emerald-400">
              <span className="text-[11px] font-semibold">Matched Rule:</span>
              <code className="bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                {currentStep.checkingRule}
              </code>
            </div>
          )}

          <div className="mt-2 text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-slate-200/60 dark:border-slate-800/60 pt-1.5">
            <span>Shortcuts: [Space] Play/Pause · [← / →] Prev/Next</span>
            <span>Speed: {speed}x</span>
          </div>
        </div>
      )}
    </div>
  );
};
