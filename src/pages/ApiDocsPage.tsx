import React, { useState } from 'react';
import { Code, Copy, Check, Download, ExternalLink, Sparkles, Server } from 'lucide-react';
import { sound } from '../utils/sound.ts';

export const ApiDocsPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    sound.play('click');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const endpoints = [
    {
      id: 'parse',
      method: 'POST',
      path: '/api/cyk/parse',
      summary: 'Execute CYK parsing algorithm',
      description: 'Parses the input string against a Chomsky Normal Form grammar and returns the triangular matrix, derivation steps, and membership result.',
      request: JSON.stringify(
        {
          grammarText: "S -> AB | BC\nA -> BA | a\nB -> CC | b\nC -> AB | a",
          startSymbol: "S",
          input: "baaba"
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          accepted: true,
          input: "baaba",
          startSymbol: "S",
          length: 5,
          table: "CYKCell[5][5]",
          steps: "CYKStep[35]",
          executionTimeMs: 0.96,
          grammarSize: 8,
          nonTerminalsCount: 4,
          rootNonTerminals: ["S", "C"]
        },
        null,
        2
      ),
      curl: `curl -X POST http://localhost:3000/api/cyk/parse \\
  -H "Content-Type: application/json" \\
  -d '{"grammarText":"S -> AB | BC\\nA -> BA | a\\nB -> CC | b\\nC -> AB | a","startSymbol":"S","input":"baaba"}'`
    },
    {
      id: 'validate',
      method: 'POST',
      path: '/api/cyk/validate',
      summary: 'Validate Chomsky Normal Form (CNF)',
      description: 'Verifies whether all grammar production rules satisfy A → BC or A → a. Returns pinpoint errors and remediation suggestions.',
      request: JSON.stringify(
        {
          grammarText: "S -> ABC\nA -> a",
          startSymbol: "S"
        },
        null,
        2
      ),
      response: JSON.stringify(
        {
          valid: false,
          errors: [
            {
              production: "S -> ABC",
              problem: "Right-hand side 'ABC' has 3 symbols. CNF requires exactly two non-terminals or one terminal.",
              suggestion: "Decompose longer rules into binary rules. Rewrite S -> ABC into S -> AX and X -> BC."
            }
          ]
        },
        null,
        2
      ),
      curl: `curl -X POST http://localhost:3000/api/cyk/validate \\
  -H "Content-Type: application/json" \\
  -d '{"grammarText":"S -> ABC\\nA -> a"}'`
    },
    {
      id: 'examples',
      method: 'GET',
      path: '/api/examples',
      summary: 'List preloaded textbook examples',
      description: 'Returns the curated library of 10+ standard CNF test cases across 7 categories.',
      request: null,
      response: JSON.stringify(
        {
          count: 10,
          examples: [
            { id: "default-classic", title: "Default Hopcroft & Ullman Classic", category: "Basic" }
          ]
        },
        null,
        2
      ),
      curl: `curl http://localhost:3000/api/examples`
    },
    {
      id: 'health',
      method: 'GET',
      path: '/api/health',
      summary: 'Health check and service status',
      description: 'Returns API health, server uptime, and timestamp.',
      request: null,
      response: JSON.stringify(
        {
          status: "ok",
          service: "CYK Parser Studio API",
          uptime: 120.4,
          timestamp: "2026-10-07T12:00:00.000Z"
        },
        null,
        2
      ),
      curl: `curl http://localhost:3000/api/health`
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            <Server className="w-3.5 h-3.5" />
            <span>Developer REST API & SDK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            CYK Parser Studio REST API
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Production JSON endpoints for automated grammar validation, parsing, and execution trace retrieval.
          </p>
        </div>

        <div>
          <a
            href="/api/download/package"
            download
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download API ZIP Package</span>
          </a>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        {endpoints.map((ep) => (
          <div
            key={ep.id}
            className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4"
          >
            {/* Top Method & Path */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                    ep.method === 'POST'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {ep.path}
                </span>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                {ep.summary}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {ep.description}
            </p>

            {/* cURL Command */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>cURL Request</span>
                <button
                  onClick={() => copyToClipboard(ep.curl, `${ep.id}-curl`)}
                  className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedId === `${ep.id}-curl` ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedId === `${ep.id}-curl` ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
                {ep.curl}
              </pre>
            </div>

            {/* Request & Response Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {ep.request && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Request Body (JSON)</span>
                    <button
                      onClick={() => copyToClipboard(ep.request!, `${ep.id}-req`)}
                      className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === `${ep.id}-req` ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto max-h-48">
                    {ep.request}
                  </pre>
                </div>
              )}

              <div className={`space-y-1 ${!ep.request ? 'md:col-span-2' : ''}`}>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Response (200 OK JSON)</span>
                  <button
                    onClick={() => copyToClipboard(ep.response, `${ep.id}-res`)}
                    className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedId === `${ep.id}-res` ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto max-h-48">
                  {ep.response}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
