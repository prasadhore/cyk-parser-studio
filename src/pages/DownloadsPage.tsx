import React from 'react';
import {
  Download,
  Monitor,
  Server,
  Globe,
  Github,
  CheckCircle,
  FileCode,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { sound } from '../utils/sound.ts';

export const DownloadsPage: React.FC = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Download className="w-3.5 h-3.5" />
          <span>Multi-Platform Distribution</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          CYK Parser Studio Downloads
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Get standalone binaries, local server packages, or configure automated desktop releases via GitHub Actions.
        </p>
      </div>

      {/* 4 Primary Distribution Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Web App */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Web Application
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Zero-install instant access in any modern web browser. Supports full interactive visualization, step-by-step playback, sound synthesis, and print report generation.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Active in current browser session</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                sound.play('click');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/60 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white text-xs font-semibold rounded-xl transition-all text-center"
            >
              Open Parser Studio
            </button>
          </div>
        </div>

        {/* Card 2: Standalone API Package */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Backend API ZIP Archive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Complete standalone Node.js / Express backend server with algorithm implementation, package.json, documentation, and test scripts.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <FileCode className="w-4 h-4 text-emerald-500" />
              <span>cyk-parser-studio-api.zip (~15 KB)</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <a
              href="/api/download/package"
              download="cyk-parser-studio-api.zip"
              onClick={() => sound.play('click')}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download API ZIP</span>
            </a>
          </div>
        </div>

        {/* Card 3: Windows Desktop (.exe) Pipeline */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Windows Desktop Application
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Native offline Windows executable package. Built using Electron & electron-builder via our GitHub Actions Windows CI pipeline (<code className="font-mono">.github/workflows/windows.yml</code>).
            </p>
            <div className="mt-4 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <strong>Windows Target:</strong> <code className="font-mono">CYK-Parser-Studio-Setup.exe</code> & Portable x64
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              To produce the <code>.exe</code> on your computer or CI:
            </div>
            <pre className="p-2 rounded bg-slate-950 text-slate-200 font-mono text-[10px]">
              npx electron-builder --windows --x64
            </pre>
          </div>
        </div>

        {/* Card 4: Source Code */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center mb-4">
              <Github className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Source Code Repository
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Full TypeScript source code, test suites, algorithms, frontend components, and CI/CD workflow configuration ready for college project submission and GitHub publication.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-mono">
              <Terminal className="w-4 h-4" />
              <span>git clone & npm run dev</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
