import React, { useMemo } from 'react';
import { CYKResult, CYKStep } from '../types/cyk.ts';
import { CheckCircle2, CircleDashed, Sparkles, Activity } from 'lucide-react';

interface GrammarCoverageProps {
  grammarText: string;
  result: CYKResult | null;
  currentStep?: CYKStep | null;
}

export const GrammarCoverage: React.FC<GrammarCoverageProps> = ({
  grammarText,
  result,
  currentStep,
}) => {
  // Extract all individual production rules
  const ruleStats = useMemo(() => {
    const rules: { lhs: string; rhs: string; ruleStr: string; isTerminal: boolean; count: number }[] = [];
    const lines = grammarText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.includes('→') ? '→' : '->';
      if (!trimmed.includes(separator)) continue;

      const [lhsRaw, rhsRaw] = trimmed.split(separator);
      const lhs = lhsRaw.trim();
      const rhss = rhsRaw.split('|').map((s) => s.trim()).filter(Boolean);

      for (const rhs of rhss) {
        rules.push({
          lhs,
          rhs,
          ruleStr: `${lhs} → ${rhs}`,
          isTerminal: rhs.length === 1 && !/^[A-Z]$/.test(rhs),
          count: 0,
        });
      }
    }

    // Count how many times each rule was derived in the result table
    if (result) {
      for (let r = 0; r < result.table.length; r++) {
        for (let c = 0; c < result.table[r].length; c++) {
          const cell = result.table[r][c];
          for (const d of cell.derivations) {
            const normalizedRule = d.rule.replace('->', '→').trim();
            const found = rules.find((item) => item.ruleStr === normalizedRule);
            if (found) {
              found.count++;
            }
          }
        }
      }
    }

    return rules;
  }, [grammarText, result]);

  const activeRuleStr = currentStep?.checkingRule?.replace('->', '→').trim();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span>Grammar Rule Activation & Coverage Matrix</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Production Usage in Table Derivation
          </h3>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {ruleStats.filter((r) => r.count > 0).length} of {ruleStats.length} rules productive
        </div>
      </div>

      {/* Grid of production rules with live activation indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-3">
        {ruleStats.map((item, idx) => {
          const isActive = activeRuleStr && activeRuleStr.includes(item.lhs) && activeRuleStr.includes(item.rhs);
          const wasUsed = item.count > 0;

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border font-mono text-xs transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/50 scale-[1.02]'
                  : wasUsed
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                  : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{item.ruleStr}</span>
                {wasUsed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <CircleDashed className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-40" />
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-sans">
                <span className="opacity-75">{item.isTerminal ? 'terminal' : 'binary'}</span>
                <span className="font-mono font-semibold">
                  {item.count > 0 ? `×${item.count}` : '0 uses'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
