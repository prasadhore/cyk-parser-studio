import React from 'react';
import { X, ArrowRight, CornerDownRight, Check, Split } from 'lucide-react';
import { CYKCell, CYKResult } from '../types/cyk.ts';
import { sound } from '../utils/sound.ts';

interface CellModalProps {
  cell: CYKCell | null;
  result: CYKResult | null;
  onClose: () => void;
}

export const CellModal: React.FC<CellModalProps> = ({
  cell,
  result,
  onClose,
}) => {
  if (!cell || !result) return null;

  const { i, j, substring, length, nonTerminals, derivations } = cell;

  // Compute all potential split positions for this cell if length > 1
  const splitsInfo = [];
  if (length > 1) {
    for (let k = i; k < j; k++) {
      const leftCell = result.table[i][k];
      const rightCell = result.table[k + 1][j];
      const matchingDerivs = derivations.filter((d) => d.splitK === k);

      splitsInfo.push({
        splitK: k,
        leftSub: result.input.slice(i, k + 1),
        rightSub: result.input.slice(k + 1, j + 1),
        leftCellCoord: `T[${i}][${k}]`,
        rightCellCoord: `T[${k + 1}][${j}]`,
        leftSymbols: leftCell.nonTerminals,
        rightSymbols: rightCell.nonTerminals,
        derivations: matchingDerivs,
      });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                T[{i}][{j}]
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cell Derivation Details
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Substring: <strong className="font-mono text-slate-800 dark:text-slate-200">"{substring}"</strong> · Indices: {i} to {j} · Length: {length}
            </p>
          </div>

          <button
            onClick={() => {
              sound.play('click');
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Result Non-Terminals Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Derivable Non-Terminals Set
              </div>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
                {nonTerminals.length > 0 ? (
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {'{ ' + nonTerminals.join(', ') + ' }'}
                  </span>
                ) : (
                  <span className="text-slate-400">∅ (Empty Set)</span>
                )}
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              {i === 0 && j === result.length - 1 ? (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold ${
                  result.accepted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                  Root Parsing Cell
                </span>
              ) : (
                <span>Subproblem cell</span>
              )}
            </div>
          </div>

          {/* Base Case (Length = 1) Terminal Production */}
          {length === 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Base Case Calculation (Length = 1)
              </h4>
              <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-sm">
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  For a single terminal character <code>'{substring}'</code>, we identify all grammar rules of the form <code>A → '{substring}'</code>:
                </p>
                {derivations.length > 0 ? (
                  <ul className="space-y-1.5 font-mono text-indigo-700 dark:text-indigo-300">
                    {derivations.map((d, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-semibold">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{d.rule}</span>
                        <span className="text-xs text-slate-500 font-sans font-normal">
                          → adds <strong>{d.lhs}</strong> to T[{i}][{j}]
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-rose-600 dark:text-rose-400 text-xs">
                    No terminal production produces character '{substring}'. Cell remains empty.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Inductive Case (Length > 1) Splits & Visual Diagram */}
          {length > 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Split className="w-4 h-4 text-indigo-500" />
                  <span>Binary Split Evaluations (k = {i} to {j - 1})</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {splitsInfo.length} split point{splitsInfo.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3">
                {splitsInfo.map((split, sIdx) => {
                  const hasMatches = split.derivations.length > 0;

                  return (
                    <div
                      key={sIdx}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        hasMatches
                          ? 'bg-slate-50 dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 opacity-75'
                      }`}
                    >
                      {/* Split Info Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Split at <strong>k = {split.splitK}</strong>: Substring division{' '}
                          <span className="font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold">
                            "{split.leftSub}"
                          </span>{' '}
                          +{' '}
                          <span className="font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-violet-600 dark:text-violet-400 font-semibold">
                            "{split.rightSub}"
                          </span>
                        </div>
                        {hasMatches ? (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            {split.derivations.length} Match{split.derivations.length > 1 ? 'es' : ''} Found
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">No match</span>
                        )}
                      </div>

                      {/* Visual Flow Diagram */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono">
                        {/* Left Cell */}
                        <div className="p-2 rounded bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 text-center">
                          <div className="text-[10px] text-sky-600 dark:text-sky-400 font-sans">
                            Left: {split.leftCellCoord}
                          </div>
                          <div className="font-bold text-sky-900 dark:text-sky-200 mt-0.5">
                            {split.leftSymbols.length > 0 ? `{${split.leftSymbols.join(', ')}}` : '∅'}
                          </div>
                        </div>

                        {/* Combinator arrow */}
                        <div className="flex flex-col items-center text-center text-slate-400 font-sans text-[11px]">
                          <span>combine ×</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 my-0.5" />
                          <span>check A → BC</span>
                        </div>

                        {/* Right Cell */}
                        <div className="p-2 rounded bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/50 text-center">
                          <div className="text-[10px] text-violet-600 dark:text-violet-400 font-sans">
                            Right: {split.rightCellCoord}
                          </div>
                          <div className="font-bold text-violet-900 dark:text-violet-200 mt-0.5">
                            {split.rightSymbols.length > 0 ? `{${split.rightSymbols.join(', ')}}` : '∅'}
                          </div>
                        </div>
                      </div>

                      {/* Matching Rules details */}
                      {hasMatches && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
                          {split.derivations.map((d, dIdx) => (
                            <div
                              key={dIdx}
                              className="text-xs font-mono flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"
                            >
                              <CornerDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Rule: <strong>{d.rule}</strong></span>
                              <span className="text-slate-400 font-sans text-[11px]">
                                (where {d.leftSymbol} ∈ left, {d.rightSymbol} ∈ right)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end">
          <button
            onClick={() => {
              sound.play('click');
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
