import React from 'react';
import {
  FileText,
  ShieldCheck,
  Grid,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';
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

  // Determine stage progression
  // Stages: 1. Input -> 2. CNF Validation -> 3. Base Init (L=1) -> 4. DP Substrings (L=2..n) -> 5. Root Symbol -> 6. Verdict
  const getStageStatus = (stageId: string) => {
    if (!result) {
      if (stageId === 'input') return 'active';
      return 'pending';
    }

    if (stageId === 'input' || stageId === 'cnf') {
      return 'completed';
    }

    if (stageId === 'init') {
      if (currentLength === 1) return 'active';
      return 'completed';
    }

    if (stageId === 'dp') {
      if (currentLength > 1 && currentLength <= n) return 'active';
      if (currentLength > n) return 'completed';
      return 'pending';
    }

    if (stageId === 'root') {
      if (currentLength >= n) return 'active';
      return 'pending';
    }

    if (stageId === 'decision') {
      if (currentLength >= n) return 'completed';
      return 'pending';
    }

    return 'pending';
  };

  const stages = [
    {
      id: 'input',
      stepNum: '01',
      title: 'Input String',
      formula: `w = "${result?.input || 'baaba'}"`,
      sub: `n = ${n} symbols`,
      icon: FileText,
    },
    {
      id: 'cnf',
      stepNum: '02',
      title: 'CNF Grammar',
      formula: 'A → BC | A → a',
      sub: 'Chomsky Normal Form',
      icon: ShieldCheck,
    },
    {
      id: 'init',
      stepNum: '03',
      title: 'Base Init (L=1)',
      formula: 'T[i][i] = {A | A→w[i]}',
      sub: `${n} diagonal cells`,
      icon: Grid,
    },
    {
      id: 'dp',
      stepNum: '04',
      title: currentLength > 1 ? `DP (L = ${currentLength})` : 'DP Matrix',
      formula: 'T[i][j] = ⋃ (B ∧ C)',
      sub: `Lengths 2..${n}`,
      icon: Layers,
    },
    {
      id: 'root',
      stepNum: '05',
      title: 'Root Membership',
      formula: `${result?.startSymbol || 'S'} ∈ T[0][${n - 1}]?`,
      sub: 'Start Symbol Check',
      icon: Sparkles,
    },
    {
      id: 'decision',
      stepNum: '06',
      title: result ? (result.accepted ? 'ACCEPTED' : 'REJECTED') : 'Algorithm Verdict',
      formula: result ? (result.accepted ? 'w ∈ L(G)' : 'w ∉ L(G)') : 'Output Decision',
      sub: result ? (result.accepted ? 'Valid Parse Tree' : 'No Valid Derivation') : 'Pending evaluation',
      icon: result ? (result.accepted ? CheckCircle2 : XCircle) : Activity,
    },
  ];

  // Calculate overall percentage
  let completedCount = 0;
  if (result) {
    completedCount = 2; // input + cnf
    if (currentLength > 1) completedCount += 1; // init
    if (currentLength >= n) completedCount += 2; // dp + root
    if (result) completedCount += 1; // verdict
  }
  const progressPercent = Math.min(100, Math.round((completedCount / 6) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm transition-colors w-full min-w-0 max-w-full overflow-hidden">
      {/* Header with Title and Current Phase Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              CYK Dynamic Programming Pipeline Flow
            </h3>
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              O(n³·|G|)
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Six-stage execution lifecycle from grammar validation to dynamic programming membership decision
          </p>
        </div>

        {/* Live Status Indicator Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {result ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>
                {currentLength === 1
                  ? 'Base Initialization (L=1)'
                  : currentLength < n
                  ? `Subproblem Length L = ${currentLength}`
                  : result.accepted
                  ? 'Accepted · w ∈ L(G)'
                  : 'Rejected · w ∉ L(G)'}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <span>Ready to Run</span>
            </span>
          )}
        </div>
      </div>

      {/* Modern Pipeline Progress Bar */}
      <div className="pt-3 pb-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
          <span>PIPELINE PROGRESSION</span>
          <span>{progressPercent}% COMPLETE</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Auto-Wrapping Responsive 6-Stage Flow (No horizontal scrollbar!) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 pt-3">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          const Icon = stage.icon;

          let cardStyle =
            'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400';
          let iconColor = 'text-slate-400';
          let statusBadge = null;

          if (status === 'active') {
            cardStyle =
              'bg-amber-50/90 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-100 shadow-sm ring-2 ring-amber-400/50';
            iconColor = 'text-amber-600 dark:text-amber-400';
            statusBadge = (
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 uppercase tracking-wider animate-pulse">
                Active
              </span>
            );
          } else if (status === 'completed') {
            if (stage.id === 'decision') {
              cardStyle = result?.accepted
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-400/40'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 ring-1 ring-rose-400/40';
              iconColor = result?.accepted
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400';
              statusBadge = (
                <span
                  className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    result?.accepted
                      ? 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {result?.accepted ? 'Pass' : 'Fail'}
                </span>
              );
            } else {
              cardStyle =
                'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 text-slate-800 dark:text-slate-200';
              iconColor = 'text-indigo-600 dark:text-indigo-400';
              statusBadge = (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Done
                </span>
              );
            }
          }

          return (
            <div
              key={stage.id}
              className={`p-2.5 sm:p-3 rounded-xl border flex flex-col justify-between transition-all relative min-w-0 ${cardStyle}`}
            >
              <div>
                {/* Step number and status indicator */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
                    <span className="text-[10px] font-mono font-bold tracking-wider opacity-60">
                      {stage.stepNum}
                    </span>
                  </div>
                  {statusBadge}
                </div>

                {/* Stage title */}
                <div className="text-xs font-bold truncate leading-tight">
                  {stage.title}
                </div>

                {/* Stage formula */}
                <div className="mt-1 font-mono text-[10px] truncate opacity-90 font-medium">
                  {stage.formula}
                </div>
              </div>

              {/* Sub description */}
              <div className="mt-2 pt-1.5 border-t border-current/10 text-[9px] truncate opacity-70">
                {stage.sub}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
