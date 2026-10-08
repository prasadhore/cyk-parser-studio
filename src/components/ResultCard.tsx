import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Download,
  Copy,
  Check,
  Maximize2,
  GitBranch,
} from 'lucide-react';
import { CYKResult } from '../types/cyk.ts';
import { sound } from '../utils/sound.ts';
import { exportJSON, exportCSV, generateStandaloneReportHTML } from '../utils/export.ts';

interface ResultCardProps {
  result: CYKResult | null;
  grammarText: string;
  onOpenModal: () => void;
  onPrint: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  grammarText,
  onOpenModal,
  onPrint,
}) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopyJSON = () => {
    sound.play('click');
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    sound.play('click');
    const html = generateStandaloneReportHTML(result, grammarText);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyk-report-${result.input}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="cyk-result-section"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors"
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Step 4 · Final Verification Result
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Algorithm Verdict & Membership Decision
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.play('click');
              onOpenModal();
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Expand into full dialog view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open Result Modal</span>
          </button>
        </div>
      </div>

      {/* Main Status Block */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          result.accepted
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
            : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              result.accepted
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/80 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-900/80 dark:text-rose-300'
            }`}
          >
            {result.accepted ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <XCircle className="w-7 h-7" />
            )}
          </div>

          <div>
            <div
              className={`text-lg font-extrabold tracking-tight ${
                result.accepted
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-rose-800 dark:text-rose-200'
              }`}
            >
              {result.accepted ? '✓ STRING ACCEPTED' : '✕ STRING REJECTED'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {result.accepted
                ? `Input string "${result.input}" is grammatically valid. Start symbol '${result.startSymbol}' was found in root cell T[0][${result.length - 1}].`
                : `Input string "${result.input}" cannot be generated. Start symbol '${result.startSymbol}' was not derived in root cell T[0][${result.length - 1}].`}
            </p>
          </div>
        </div>

        {/* Root cell badge */}
        <div className="text-right sm:text-right shrink-0">
          <div className="text-[10px] uppercase font-mono text-slate-400">
            Apex Cell T[0][{result.length - 1}]
          </div>
          <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
            {result.rootNonTerminals.length > 0 ? (
              <span className="text-indigo-600 dark:text-indigo-400">
                {'{ ' + result.rootNonTerminals.join(', ') + ' }'}
              </span>
            ) : (
              <span className="text-slate-400">∅ (Empty Set)</span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">
            Input Length (n)
          </div>
          <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
            {result.length} characters
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">
            Execution Time
          </div>
          <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
            {result.executionTimeMs} ms
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">
            Grammar Size (|G|)
          </div>
          <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
            {result.grammarSize} rules
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">
            Total Steps
          </div>
          <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
            {result.steps.length} trace steps
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.play('click');
              onPrint();
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML Report</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJSON}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={() => {
              sound.play('click');
              exportCSV(result);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};
