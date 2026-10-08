import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, Sun, Moon, Laptop, Share2, Sparkles, BookOpen, Code, Download, Library, Maximize, Minimize } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface HeaderProps {
  activeTab: 'studio' | 'examples' | 'learn' | 'api' | 'downloads' | 'landing';
  setActiveTab: (tab: 'studio' | 'examples' | 'learn' | 'api' | 'downloads' | 'landing') => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (t: 'dark' | 'light' | 'system') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onStartDemo: () => void;
  onShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  onStartDemo,
  onShare,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    sound.play('click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  const cycleTheme = () => {
    sound.play('click');
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Zone */}
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('landing');
          }}
          className="flex items-center gap-2 text-left group focus:outline-none min-w-0 shrink"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0">
            Δ
          </div>
          <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap truncate">
            CYK Parser Studio
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('studio');
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            Parser Studio
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('examples');
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'examples'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Library className="w-4 h-4" />
            Examples
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('learn');
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'learn'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Learn CYK
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('api');
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'api'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Code className="w-4 h-4" />
            REST API
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('downloads');
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'downloads'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            Downloads
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Demo Button */}
          <button
            onClick={onStartDemo}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors whitespace-nowrap"
            title="Run interactive guided demo"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Demo</span>
          </button>

          {/* Share */}
          <button
            onClick={onShare}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Share Grammar & Input via URL"
            aria-label="Share URL"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-md transition-colors ${
              soundEnabled
                ? 'text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Full Display)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={cycleTheme}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Current Theme: ${theme}`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto py-1.5 px-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70">
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('studio');
          }}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
            activeTab === 'studio'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          Parser Studio
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('examples');
          }}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'examples'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <Library className="w-3 h-3" />
          <span>Examples</span>
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('learn');
          }}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'learn'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>Learn CYK</span>
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('api');
          }}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'api'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <Code className="w-3 h-3" />
          <span>API</span>
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('downloads');
          }}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'downloads'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <Download className="w-3 h-3" />
          <span>Downloads</span>
        </button>
      </div>
    </header>
  );
};
