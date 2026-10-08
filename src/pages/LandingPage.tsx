import React from 'react';
import {
  Play,
  ArrowRight,
  BookOpen,
  Code,
  Download,
  CheckCircle,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface LandingPageProps {
  onLaunchParser: () => void;
  onWatchDemo: () => void;
  onLearnCYK: () => void;
  onViewAPI: () => void;
  onViewDownloads: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchParser,
  onWatchDemo,
  onLearnCYK,
  onViewAPI,
  onViewDownloads,
}) => {
  return (
    <div className="flex flex-col gap-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center max-w-5xl mx-auto px-4 sm:px-6 w-full">
        {/* Subtle Ambient Background */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20 pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 blur-3xl" />
        </div>

        {/* Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Parse. Visualize. Understand.</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          CYK Parser Studio
        </h1>

        <p className="mt-3 text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Interactive Cocke–Younger–Kasami Parser & Visualization Tool
        </p>

        <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Execute real Chomsky Normal Form parsing, explore the dynamic programming triangular matrix step-by-step, inspect split points, and export verified academic reports.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.play('click');
              onLaunchParser();
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span>Launch Parser Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.play('click');
              onWatchDemo();
            }}
            className="px-5 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current text-indigo-600 dark:text-indigo-400" />
            <span>Watch Guided Demo</span>
          </button>

          <button
            onClick={() => {
              sound.play('click');
              onLearnCYK();
            }}
            className="px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-sm rounded-xl transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Learn CYK</span>
          </button>
        </div>

        {/* Animated Mini Triangular Matrix in Hero */}
        <div className="mt-12 p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-2xl mx-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Dynamic Programming Triangular Pyramid (Input: "baaba")
          </div>

          <div className="flex flex-col items-center gap-1.5 text-xs font-mono">
            {/* Len 5: Apex */}
            <div className="p-1.5 px-3 rounded bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm animate-pulse">
              [0,4] {'{S}'}
            </div>

            {/* Len 4 */}
            <div className="flex gap-1.5">
              <div className="p-1.5 px-2.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                [0,3] {'{A,C}'}
              </div>
              <div className="p-1.5 px-2.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                [1,4] {'{B}'}
              </div>
            </div>

            {/* Len 3 */}
            <div className="flex gap-1.5">
              <div className="p-1.5 px-2.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                [0,2] {'{A}'}
              </div>
              <div className="p-1.5 px-2.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold">
                [1,3] {'{C}'}
              </div>
              <div className="p-1.5 px-2.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                [2,4] {'{S}'}
              </div>
            </div>

            {/* Len 2 */}
            <div className="flex gap-1.5">
              <div className="p-1 px-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                [0,1] {'{C}'}
              </div>
              <div className="p-1 px-2 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-200 text-sky-700 dark:text-sky-300">
                [1,2] {'{A}'}
              </div>
              <div className="p-1 px-2 rounded bg-violet-50 dark:bg-violet-950/60 border border-violet-200 text-violet-700 dark:text-violet-300">
                [2,3] {'{B}'}
              </div>
              <div className="p-1 px-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                [3,4] {'{C}'}
              </div>
            </div>

            {/* Len 1: Base */}
            <div className="flex gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="p-1 px-2 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                'b' {'{B}'}
              </div>
              <div className="p-1 px-2 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                'a' {'{A,C}'}
              </div>
              <div className="p-1 px-2 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                'a' {'{A,C}'}
              </div>
              <div className="p-1 px-2 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                'b' {'{B}'}
              </div>
              <div className="p-1 px-2 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                'a' {'{A,C}'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Engineered for Academic Rigor & Intuitive Mastery
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Built from scratch for Computer Science students, professors, and algorithm enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Authentic DP Algorithm
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Zero hardcoded results. Computes the real O(n³·|G|) table over arbitrary CNF grammars, indexes binary productions, and validates membership via root cell backpointers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
              T[i][j] = ⋃ (B ∈ T[i][k] ∧ C ∈ T[k+1][j])
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Interactive Triangular Visualization
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Watch subproblem pyramids assemble in real time. Switch between Pyramid and Matrix Grid views, click any cell to inspect binary split points, and step through calculations with audio cues.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-sky-600 dark:text-sky-400">
              Pyramid & Upper-Triangular Matrix
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Full-Stack, Print & Desktop
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Includes Express REST API, standalone downloadable backend package, professional academic print layout, JSON/CSV exports, and Windows desktop application configuration.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              REST API · Print · Export · Desktop
            </div>
          </div>
        </div>
      </section>

      {/* Complexity Breakdown Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 font-semibold">
                Theoretical Complexity Profile
              </span>
              <h3 className="text-lg font-bold mt-1">
                Cocke–Younger–Kasami Dynamic Programming
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                For an input string of length <em>n</em> and grammar of size <em>|G|</em> with <em>|N|</em> non-terminals:
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Time Complexity</div>
                <div className="text-base font-mono font-bold text-indigo-300">O(n³ · |G|)</div>
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Space Complexity</div>
                <div className="text-base font-mono font-bold text-emerald-300">O(n² · |N|)</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
