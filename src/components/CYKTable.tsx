import React, { useState } from 'react';
import { CYKCell, CYKResult, CYKStep } from '../types/cyk.ts';
import { sound } from '../utils/sound.ts';
import { Layers, Grid3X3, Eye } from 'lucide-react';

interface CYKTableProps {
  result: CYKResult | null;
  currentStep?: CYKStep | null;
  onSelectCell: (cell: CYKCell) => void;
  selectedCell: CYKCell | null;
}

export const CYKTable: React.FC<CYKTableProps> = ({
  result,
  currentStep,
  onSelectCell,
  selectedCell,
}) => {
  const [viewMode, setViewMode] = useState<'pyramid' | 'matrix'>('pyramid');

  if (!result || result.table.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center bg-slate-50/50 dark:bg-slate-900/30">
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-3">
          Δ
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No Parsing Table Generated
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Click <strong>RUN CYK ALGORITHM</strong> or <strong>WATCH DEMO</strong> to execute the Cocke–Younger–Kasami dynamic programming matrix.
        </p>
      </div>
    );
  }

  const n = result.length;
  const chars = result.input.split('');

  // Determine cell role based on current step
  const getCellHighlight = (i: number, j: number) => {
    const isSelected = selectedCell && selectedCell.i === i && selectedCell.j === j;
    if (isSelected) {
      return 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/90 dark:bg-indigo-950/90';
    }

    if (currentStep) {
      if (currentStep.cell[0] === i && currentStep.cell[1] === j) {
        return 'ring-2 ring-amber-500 bg-amber-50/80 dark:bg-amber-950/70 shadow-md animate-pulse';
      }
      if (
        currentStep.leftCell &&
        currentStep.leftCell[0] === i &&
        currentStep.leftCell[1] === j
      ) {
        return 'ring-2 ring-sky-500 bg-sky-50/80 dark:bg-sky-950/70';
      }
      if (
        currentStep.rightCell &&
        currentStep.rightCell[0] === i &&
        currentStep.rightCell[1] === j
      ) {
        return 'ring-2 ring-violet-500 bg-violet-50/80 dark:bg-violet-950/70';
      }
    }

    // Root cell
    if (i === 0 && j === n - 1) {
      if (result.accepted) {
        return 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
      } else {
        return 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200';
      }
    }

    return 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800';
  };

  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors">
      {/* Table Header and Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Dynamic Programming CYK Table</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              T[0..{n - 1}][0..{n - 1}]
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any cell to inspect substring derivations, split points, and production traces.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => {
              sound.play('click');
              setViewMode('pyramid');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'pyramid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pyramid View</span>
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setViewMode('matrix');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Matrix Grid View</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 dark:bg-amber-500" />
          <span>Active Evaluation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 dark:bg-sky-500" />
          <span>Left Cell (T[i][k])</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-violet-400 dark:bg-violet-500" />
          <span>Right Cell (T[k+1][j])</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>Accepted Root (S ∈ T[0][n-1])</span>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto py-2">
        {viewMode === 'pyramid' ? (
          /* Classical CYK Pyramid: Length n at top, down to length 1 at base */
          <div className="flex flex-col items-center gap-2 min-w-max mx-auto p-2">
            {Array.from({ length: n }, (_, rowIdx) => {
              // len goes from n down to 1
              const len = n - rowIdx;
              const cellCount = n - len + 1;

              return (
                <div key={len} className="flex items-center gap-2">
                  <span className="w-12 text-right text-[11px] font-mono text-slate-400 shrink-0">
                    len={len}
                  </span>

                  <div className="flex gap-2">
                    {Array.from({ length: cellCount }, (_, i) => {
                      const j = i + len - 1;
                      const cell = result.table[i][j];
                      const highlightClass = getCellHighlight(i, j);

                      return (
                        <button
                          key={`${i}-${j}`}
                          onClick={() => {
                            sound.play('cellSelected');
                            onSelectCell(cell);
                          }}
                          className={`w-20 sm:w-24 h-16 sm:h-20 p-1.5 rounded-lg border transition-all text-center flex flex-col justify-between items-center group cursor-pointer focus:outline-none ${highlightClass}`}
                          title={`Click to inspect T[${i}][${j}] ("${cell.substring}")`}
                        >
                          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            <span>[{i},{j}]</span>
                            <span className="truncate max-w-[44px]">"{cell.substring}"</span>
                          </div>

                          <div className="my-auto font-mono text-xs sm:text-sm font-bold tracking-tight">
                            {cell.nonTerminals.length > 0 ? (
                              <span className="text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {'{' + cell.nonTerminals.join(',') + '}'}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700 font-normal">∅</span>
                            )}
                          </div>

                          <div className="text-[9px] text-slate-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-2.5 h-2.5" />
                            <span>trace</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Input Characters Bar under Pyramid Base */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
              <span className="w-12 text-right text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                input w:
              </span>
              <div className="flex gap-2">
                {chars.map((ch, idx) => (
                  <div
                    key={idx}
                    className="w-20 sm:w-24 py-1.5 text-center font-mono font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md border border-slate-200 dark:border-slate-700"
                  >
                    {ch}
                    <div className="text-[10px] font-normal text-slate-400 font-sans">
                      idx {idx}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Matrix Grid View: Upper Triangular */
          <div className="min-w-max p-2">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs font-mono text-slate-400 text-left">
                    i \ j
                  </th>
                  {Array.from({ length: n }, (_, j) => (
                    <th key={j} className="p-2 text-xs font-mono text-slate-600 dark:text-slate-300 text-center w-24">
                      j={j} ('{chars[j]}')
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: n }, (_, i) => (
                  <tr key={i}>
                    <td className="p-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                      i={i} ('{chars[i]}')
                    </td>
                    {Array.from({ length: n }, (_, j) => {
                      if (j < i) {
                        return (
                          <td
                            key={j}
                            className="p-1 text-center bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40"
                          >
                            <span className="text-slate-300 dark:text-slate-800 text-xs">—</span>
                          </td>
                        );
                      }

                      const cell = result.table[i][j];
                      const highlightClass = getCellHighlight(i, j);

                      return (
                        <td key={j} className="p-1">
                          <button
                            onClick={() => {
                              sound.play('cellSelected');
                              onSelectCell(cell);
                            }}
                            className={`w-24 h-16 p-1.5 rounded-lg border transition-all text-center flex flex-col justify-between items-center group cursor-pointer focus:outline-none ${highlightClass}`}
                          >
                            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>[{i},{j}]</span>
                              <span className="truncate max-w-[48px]">"{cell.substring}"</span>
                            </div>

                            <div className="font-mono text-xs font-bold my-auto">
                              {cell.nonTerminals.length > 0 ? (
                                <span className="text-slate-900 dark:text-slate-100">
                                  {'{' + cell.nonTerminals.join(',') + '}'}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700 font-normal">∅</span>
                              )}
                            </div>

                            <div className="text-[9px] text-slate-400">
                              len={j - i + 1}
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
