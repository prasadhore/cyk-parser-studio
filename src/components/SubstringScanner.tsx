import React from 'react';
import { CYKStep, CYKResult } from '../types/cyk.ts';
import { Split, Zap } from 'lucide-react';

interface SubstringScannerProps {
  input: string;
  currentStep?: CYKStep | null;
  result?: CYKResult | null;
}

export const SubstringScanner: React.FC<SubstringScannerProps> = ({
  input,
  currentStep,
}) => {
  const chars = input.split('');

  if (!currentStep) return null;

  const [i, j] = currentStep.cell;
  const k = currentStep.splitK;
  const len = currentStep.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm transition-colors w-full min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Live Substring Partition & Split Scanner
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Substring w[{i}..{j}] = "{currentStep.substring}" (Length {len})
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto">
          {k !== undefined ? (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Split className="w-3.5 h-3.5 shrink-0" />
              <span>Split k = {k} (w[{i}..{k}] | w[{k + 1}..{j}])</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-semibold text-[11px] sm:text-xs">
              Base Token (k = none, len = 1)
            </span>
          )}
        </div>
      </div>

      {/* String Tape with Interactive Coordinate Brackets */}
      <div className="w-full overflow-x-auto py-3">
        <div className="inline-flex items-center justify-center min-w-full px-1 gap-1 sm:gap-2">
          {chars.map((ch, idx) => {
            const isInsideSubstring = idx >= i && idx <= j;
            const isLeftPartition = k !== undefined && idx >= i && idx <= k;
            const isRightPartition = k !== undefined && idx >= k + 1 && idx <= j;

            let cellBg = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400';
            let label = '';

            if (isLeftPartition) {
              cellBg = 'bg-sky-50 dark:bg-sky-950/80 border-sky-400 dark:border-sky-600 text-sky-900 dark:text-sky-200 font-bold ring-2 ring-sky-300/60';
              label = 'Left';
            } else if (isRightPartition) {
              cellBg = 'bg-violet-50 dark:bg-violet-950/80 border-violet-400 dark:border-violet-600 text-violet-900 dark:text-violet-200 font-bold ring-2 ring-violet-300/60';
              label = 'Right';
            } else if (isInsideSubstring) {
              cellBg = 'bg-amber-50 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200 font-bold';
              label = 'Active';
            }

            return (
              <div key={idx} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 mb-1">
                    i={idx}
                  </span>

                  <div
                    className={`w-10 sm:w-12 md:w-14 h-12 sm:h-14 md:h-16 rounded-lg border flex flex-col items-center justify-center font-mono text-sm sm:text-base transition-all ${cellBg}`}
                  >
                    <span>'{ch}'</span>
                    {label && (
                      <span className="text-[8px] sm:text-[9px] font-sans uppercase tracking-tight opacity-75 mt-0.5">
                        {label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Split separator bar between k and k+1 */}
                {k !== undefined && idx === k && (
                  <div className="px-1 sm:px-1.5 flex flex-col items-center self-center pt-3 sm:pt-4">
                    <div className="h-8 sm:h-10 w-0.5 bg-indigo-500 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-mono text-indigo-500 font-bold mt-0.5">
                      k={k}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross Product Evaluation Visualizer */}
      {k !== undefined && currentStep.leftCell && currentStep.rightCell && (
        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-semibold">
              T[{currentStep.leftCell[0]}][{currentStep.leftCell[1]}]: {'{' + (currentStep.leftSymbols?.join(', ') || '∅') + '}'}
            </span>
            <span className="text-slate-400">×</span>
            <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 font-semibold">
              T[{currentStep.rightCell[0]}][{currentStep.rightCell[1]}]: {'{' + (currentStep.rightSymbols?.join(', ') || '∅') + '}'}
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
              T[{i}][{j}]
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {currentStep.matched ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>Rule: <strong>{currentStep.checkingRule}</strong></span>
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">
                No matching CNF rule A → BC for this partition
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
