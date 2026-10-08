import React from 'react';
import { BookOpen, Check, Layers, Code, Clock, Database, Sparkles, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface LearnPageProps {
  onOpenStudio: () => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({ onOpenStudio }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Computer Science Theory & Automata</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          The Cocke–Younger–Kasami (CYK) Algorithm
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          A definitive, self-contained educational guide to dynamic programming parsing for context-free grammars in Chomsky Normal Form.
        </p>
      </div>

      {/* Section 1: CFG & CNF */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>1. Context-Free Grammars (CFG) & Chomsky Normal Form (CNF)</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          A <strong>Context-Free Grammar (CFG)</strong> is a 4-tuple <code className="font-mono text-indigo-600 dark:text-indigo-400">G = (V, Σ, R, S)</code> where <code className="font-mono">V</code> is a set of non-terminals, <code className="font-mono">Σ</code> is an alphabet of terminal symbols, <code className="font-mono">R</code> is a set of production rules, and <code className="font-mono">S ∈ V</code> is the start symbol.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          A grammar is in <strong>Chomsky Normal Form (CNF)</strong> if every production rule has one of exactly two canonical forms:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Rule Type 1: Binary Non-Terminals
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
              A → BC
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Where <code className="font-mono">A, B, C ∈ V</code>. Both symbols on the right-hand side must be non-terminals.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Rule Type 2: Single Terminal
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
              A → a
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Where <code className="font-mono">A ∈ V</code> and <code className="font-mono">a ∈ Σ</code>. Exactly one terminal character.
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs text-amber-800 dark:text-amber-300">
          <strong>Why CNF?</strong> Every non-empty context-free language can be expressed in CNF. CNF guarantees that any derivation of a string of length <em>n</em> takes exactly <em>2n - 1</em> steps, rendering the derivation tree strictly binary and enabling polynomial-time dynamic programming.
        </div>
      </section>

      {/* Section 2: What is CYK & Why Dynamic Programming */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>2. What is CYK & Why Dynamic Programming?</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The <strong>Cocke–Younger–Kasami (CYK) algorithm</strong> was independently discovered by John Cocke (1969), Daniel Younger (1967), and Tadao Kasami (1965). It answers the fundamental membership question:
        </p>

        <blockquote className="p-4 border-l-4 border-indigo-500 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm italic rounded-r-lg">
          Given a context-free grammar G in CNF and a string w = w₁w₂...wₙ, does w ∈ L(G)?
        </blockquote>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          A naive recursive search or top-down backtracking parser explores exponentially many branching derivations (<code className="font-mono">O(2ⁿ)</code>), which quickly hangs or crashes on even modest sentence lengths.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          CYK applies <strong>Dynamic Programming</strong>: the derivation of string <code className="font-mono">w[i..j]</code> is broken down into subproblems of deriving <code className="font-mono">w[i..k]</code> and <code className="font-mono">w[k+1..j]</code>. Since each substring derivation depends only on smaller substrings, we solve subproblems in increasing order of length <code className="font-mono">len = 1, 2, ..., n</code> and memoize them in a 2D table <code className="font-mono">T[i][j]</code>.
        </p>
      </section>

      {/* Section 3: The Dynamic Programming Table Recurrence */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>3. Dynamic Programming Formulation</span>
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase mb-2">
              Base Case (Length = 1)
            </div>
            <div className="text-slate-900 dark:text-slate-100 font-bold">
              T[i][i] = {'{ A ∈ V | (A → w[i]) ∈ R }'}
            </div>
            <div className="text-xs text-slate-500 font-sans mt-1">
              For every single character at index i, identify all non-terminals deriving that terminal symbol.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase mb-2">
              Inductive Step (Length = 2 to n)
            </div>
            <div className="text-slate-900 dark:text-slate-100 font-bold leading-relaxed">
              T[i][j] = ⋃ (k = i to j - 1) {'{ A ∈ V | A → BC, B ∈ T[i][k], C ∈ T[k+1][j] }'}
            </div>
            <div className="text-xs text-slate-500 font-sans mt-1">
              Partition the substring at split index k. Combine the sets from left cell T[i][k] and right cell T[k+1][j], then lookup matching binary production rules A → BC.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase mb-2">
              Acceptance Condition
            </div>
            <div className="text-slate-900 dark:text-slate-100 font-bold">
              ACCEPT ⟺ S ∈ T[0][n - 1]
            </div>
            <div className="text-xs text-slate-500 font-sans mt-1">
              The full string is accepted if and only if the grammar's start symbol S appears in the apex root cell T[0][n-1].
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Complexity Analysis */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          <span>4. Complexity Analysis</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400">
              Time Complexity
            </div>
            <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              O(n³ · |G|)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              There are <code className="font-mono">O(n²)</code> cells in the upper triangular table. For each cell, we test <code className="font-mono">O(n)</code> split points <code className="font-mono">k</code>. Testing each split checks productions of the grammar <code className="font-mono">|G|</code>. Thus total time is cubic in the string length.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">
              Space Complexity
            </div>
            <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              O(n² · |N|)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              The dynamic programming table stores sets of non-terminals for each pair <code className="font-mono">(i, j)</code>. Since <code className="font-mono">0 ≤ i ≤ j &lt; n</code>, there are <code className="font-mono">n(n + 1)/2</code> cells, and each cell stores a subset of at most <code className="font-mono">|N|</code> non-terminals.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Real-World Applications */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>5. Real-World Applications</span>
        </h2>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              ✓
            </div>
            <div>
              <strong>Natural Language Processing (NLP):</strong> Used in probabilistic form (Probabilistic CYK / PCFG) to compute the most likely syntactic parse tree of sentences (e.g., Stanford Parser).
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              ✓
            </div>
            <div>
              <strong>Bioinformatics & RNA Secondary Structure:</strong> Stochastic CFGs use CYK-style algorithms to predict base-pairing and folding loops in ribosomal RNA molecules.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              ✓
            </div>
            <div>
              <strong>Compiler Construction:</strong> Forms the theoretical bedrock of general context-free parsing and syntax error recovery in parser generators.
            </div>
          </li>
        </ul>

        {/* CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.play('click');
              onOpenStudio();
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <span>Launch Interactive Visualizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
