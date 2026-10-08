import React, { useMemo, useState } from 'react';
import { EXAMPLE_LIBRARY, parseGrammarText, runCYK } from '../algorithms/cyk.ts';
import { ExampleCase } from '../types/cyk.ts';
import { CheckCircle2, XCircle, ArrowRight, Filter, BookOpen } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface ExamplesPageProps {
  onSelectExample: (ex: ExampleCase) => void;
}

export const ExamplesPage: React.FC<ExamplesPageProps> = ({ onSelectExample }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Basic', 'Accepted', 'Rejected', 'Ambiguous', 'Longer Input', 'Multiple Productions', 'Educational'];

  // Run the actual CYK parser on every example in the library so there is zero fake data!
  const computedExamples = useMemo(() => {
    return EXAMPLE_LIBRARY.map((ex) => {
      const parsed = parseGrammarText(ex.grammarText);
      const res = runCYK(parsed.grammar, ex.startSymbol, ex.input);
      return {
        ...ex,
        actualAccepted: res.accepted,
        executionTimeMs: res.executionTimeMs,
        rootSet: res.rootNonTerminals,
      };
    });
  }, []);

  const filtered = computedExamples.filter((ex) => {
    if (selectedCategory === 'all') return true;
    return ex.category === selectedCategory;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated CS Theory Benchmark Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Chomsky Normal Form Example Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            10 verified textbook cases. Every result below is computed by the real CYK dynamic programming engine.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.play('click');
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Examples (10)' : cat}
          </button>
        ))}
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            className="flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60">
                  {ex.category}
                </span>

                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    ex.actualAccepted
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}
                >
                  {ex.actualAccepted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{ex.actualAccepted ? 'ACCEPTED' : 'REJECTED'}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {ex.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {ex.description}
              </p>

              {/* Input String and Start Symbol */}
              <div className="flex items-center gap-4 my-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Input w: </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    "{ex.input}"
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Start: </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {ex.startSymbol}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Root: </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {ex.rootSet.length > 0 ? `{${ex.rootSet.join(',')}}` : '∅'}
                  </span>
                </div>
              </div>

              {/* Grammar snippet */}
              <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-x-auto max-h-28">
                {ex.grammarText}
              </pre>
            </div>

            {/* Load Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {ex.executionTimeMs} ms verified
              </span>
              <button
                onClick={() => {
                  sound.play('click');
                  onSelectExample(ex);
                }}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-indigo-300 dark:hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
              >
                <span>Load into Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
