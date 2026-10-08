import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Shuffle,
  Wand2,
  BookMarked,
  Info,
} from 'lucide-react';
import { ValidationResult } from '../types/cyk.ts';
import { sound } from '../utils/sound.ts';

interface GrammarEditorProps {
  grammarText: string;
  setGrammarText: (text: string) => void;
  startSymbol: string;
  setStartSymbol: (s: string) => void;
  inputString: string;
  setInputString: (str: string) => void;
  validation: ValidationResult;
  onValidate: () => void;
  onRunCYK: () => void;
  onLoadExampleClick: () => void;
  onRandomExample: () => void;
  isRunning?: boolean;
}

export const GrammarEditor: React.FC<GrammarEditorProps> = ({
  grammarText,
  setGrammarText,
  startSymbol,
  setStartSymbol,
  inputString,
  setInputString,
  validation,
  onValidate,
  onRunCYK,
  onLoadExampleClick,
  onRandomExample,
  isRunning = false,
}) => {
  const [showHelper, setShowHelper] = useState(false);

  // Auto format grammar text
  const formatGrammar = () => {
    sound.play('click');
    const lines = grammarText.split('\n');
    const formatted = lines
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'))
      .map((l) => {
        const arrow = l.includes('→') ? '→' : '->';
        if (!l.includes(arrow)) return l;
        const [lhs, rhs] = l.split(arrow);
        const alts = rhs
          .split('|')
          .map((a) => a.trim())
          .filter(Boolean)
          .join(' | ');
        return `${lhs.trim()} -> ${alts}`;
      })
      .join('\n');
    if (formatted) setGrammarText(formatted);
  };

  const lineCount = Math.max(grammarText.split('\n').length, 5);

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm transition-colors w-full min-w-0 max-w-full overflow-hidden">
      {/* Grammar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Chomsky Normal Form Grammar</span>
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="CNF Specification Rules"
              aria-label="CNF Specification Rules"
            >
              <Info className="w-4 h-4" />
            </button>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rules must be binary (A → BC) or terminal (A → a)
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={formatGrammar}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1"
            title="Clean whitespace and format arrows"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Format</span>
          </button>
        </div>
      </div>

      {/* Helper Callout */}
      {showHelper && (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Chomsky Normal Form (CNF) Invariants:
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Binary Non-Terminals:</strong> <code className="text-indigo-600 dark:text-indigo-400">A → BC</code> (exactly two non-terminals).
            </li>
            <li>
              <strong>Single Terminal:</strong> <code className="text-indigo-600 dark:text-indigo-400">A → a</code> (one terminal character).
            </li>
            <li>No unit productions (<code className="text-rose-500">A → B</code>), no mixed (<code className="text-rose-500">A → aB</code>), and no ternary (<code className="text-rose-500">A → BCD</code>).
            </li>
          </ul>
        </div>
      )}

      {/* Code Editor Box */}
      <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 font-mono text-sm">
        <div className="flex">
          {/* Line Numbers */}
          <div className="select-none py-3 px-2 text-right text-xs text-slate-400 dark:text-slate-600 bg-slate-100/60 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 w-9">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={grammarText}
            onChange={(e) => setGrammarText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onRunCYK();
              }
            }}
            rows={Math.max(lineCount, 6)}
            spellCheck={false}
            className="w-full py-3 px-3.5 bg-transparent resize-y text-slate-900 dark:text-slate-100 focus:outline-none leading-6 placeholder:text-slate-400 font-mono text-xs sm:text-sm"
            placeholder="S -> AB | BC&#10;A -> BA | a&#10;B -> CC | b&#10;C -> AB | a"
          />
        </div>

        {/* Quick symbol insertion & shortcut hint */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Insert:</span>
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                setGrammarText(grammarText + ' -> ');
              }}
              className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700"
            >
              -&gt;
            </button>
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                setGrammarText(grammarText + ' → ');
              }}
              className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                setGrammarText(grammarText + ' | ');
              }}
              className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700"
            >
              |
            </button>
          </div>

          <span className="hidden sm:inline text-slate-400">
            Ctrl + Enter to run
          </span>
        </div>
      </div>

      {/* Start Symbol & Input String Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Start Symbol */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Start Symbol
          </label>
          <input
            type="text"
            value={startSymbol}
            onChange={(e) => setStartSymbol(e.target.value.trim().toUpperCase() || 'S')}
            maxLength={3}
            className="w-full px-3 py-2 text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:border-indigo-500 focus:outline-none"
            placeholder="S"
          />
        </div>

        {/* Input String */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Input String (w)
            </label>
            <span className="text-[11px] text-slate-400">
              Length: {inputString.length} chars (max 20 recommended)
            </span>
          </div>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onRunCYK();
              }
            }}
            maxLength={25}
            className="w-full px-3 py-2 text-sm font-mono tracking-wider font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:border-indigo-500 focus:outline-none"
            placeholder="e.g. baaba"
          />
        </div>
      </div>

      {/* Validation Banner */}
      {!validation.valid && validation.errors.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Grammar Validation Failed ({validation.errors.length} issue{validation.errors.length > 1 ? 's' : ''})</span>
          </div>
          <div className="space-y-2">
            {validation.errors.map((err, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded border border-rose-100 dark:border-rose-900/40">
                {err.production && (
                  <div className="font-mono text-slate-900 dark:text-slate-100 font-semibold mb-0.5">
                    Production: {err.production}
                  </div>
                )}
                <div className="text-rose-700 dark:text-rose-400">
                  <strong>Problem:</strong> {err.problem}
                </div>
                <div className="text-slate-600 dark:text-slate-300 mt-1">
                  <strong>Suggestion:</strong> {err.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {validation.valid && (
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Valid Chomsky Normal Form</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
            {validation.totalProductions} rules · {validation.nonTerminals.length} non-terminals
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Run CYK */}
        <button
          onClick={() => {
            sound.play('click');
            onRunCYK();
          }}
          disabled={isRunning || !validation.valid}
          className="col-span-2 sm:col-span-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>RUN CYK ALGORITHM</span>
        </button>

        {/* Validate CNF */}
        <button
          onClick={() => {
            sound.play('click');
            onValidate();
          }}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Validate CNF</span>
        </button>

        {/* Random Example */}
        <button
          onClick={() => {
            sound.play('click');
            onRandomExample();
          }}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          title="Generate fresh random valid CNF grammar"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Random</span>
        </button>
      </div>

      {/* Load Example Button */}
      <button
        onClick={() => {
          sound.play('click');
          onLoadExampleClick();
        }}
        className="w-full py-2 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1.5"
      >
        <BookMarked className="w-3.5 h-3.5" />
        <span>Load from Example Library (10+ CS Theory Cases)...</span>
      </button>
    </div>
  );
};
