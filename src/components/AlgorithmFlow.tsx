import React from 'react';
import { ArrowRight, Check, Play, Circle } from 'lucide-react';
import { CYKResult } from '../types/cyk.ts';

interface AlgorithmFlowProps {
  result: CYKResult | null;
  currentLength?: number;
}

export const AlgorithmFlow: React.FC<AlgorithmFlowProps> = ({
  result,
  currentLength = 1,
}) => {
  const n = result?.length || 5;

  const stages = [
    { id: 'input', label: 'Input String', sub: `w = "${result?.input || 'baaba'}"` },
    { id: 'cnf', label: 'CNF Validation', sub: 'Rules: A→BC | A→a' },
    { id: 'init', label: 'Base Init (L=1)', sub: 'T[i][i] = {A|A→w[i]}' },
  ];

  for (let l = 2; l <= Math.min(n, 5); l++) {
    stages.push({
      id: `len-${l}`,
      label: `Length L = ${l}`,
      sub: `T[i][j] = ⋃ (B ∈ T[i][k] ∧ C ∈ T[k+1][j])`,
    });
  }

  stages.push({
    id: 'root',
    label: 'Start Symbol Check',
    sub: `${result?.startSymbol || 'S'} ∈ T[0][${n - 1}]?`,
  });

  stages.push({
    id: 'decision',
    label: result ? (result.accepted ? 'ACCEPTED' : 'REJECTED') : 'ACCEPT / REJECT',
    sub: result ? (result.accepted ? 'w ∈ L(G)' : 'w ∉ L(G)') : 'Output boolean',
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            CYK Dynamic Programming Pipeline Flow
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stage progression through subproblem lengths and final membership decision
          </p>
        </div>
      </div>

      {/* Horizontal Flow Pipeline */}
      <div className="overflow-x-auto py-3">
        <div className="flex items-center gap-2 min-w-max">
          {stages.map((stage, idx) => {
            const isLast = idx === stages.length - 1;
            const isDecision = stage.id === 'decision';

            // Determine whether stage is active, past, or future
            let isActive = false;
            let isPast = false;

            if (stage.id === 'input' || stage.id === 'cnf') {
              isPast = result !== null;
            } else if (stage.id === 'init') {
              isActive = currentLength === 1 && result !== null;
              isPast = currentLength > 1 && result !== null;
            } else if (stage.id.startsWith('len-')) {
              const lNum = parseInt(stage.id.replace('len-', ''), 10);
              isActive = currentLength === lNum && result !== null;
              isPast = currentLength > lNum && result !== null;
            } else if (stage.id === 'root') {
              isActive = currentLength === n && result !== null;
              isPast = false;
            } else if (isDecision) {
              isActive = result !== null;
            }

            let badgeColor = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400';

            if (isActive && !isDecision) {
              badgeColor = 'bg-amber-50 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/50 shadow-sm';
            } else if (isPast && !isDecision) {
              badgeColor = 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200';
            } else if (isDecision && result) {
              badgeColor = result.accepted
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-400/40'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-bold ring-1 ring-rose-400/40';
            }

            return (
              <React.Fragment key={stage.id}>
                <div
                  className={`px-3 py-2 rounded-lg border flex flex-col items-center text-center transition-all ${badgeColor}`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    ) : (
                      <Circle className="w-2 h-2 fill-current opacity-40" />
                    )}
                    <span>{stage.label}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-80 mt-0.5">
                    {stage.sub}
                  </span>
                </div>

                {!isLast && (
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
