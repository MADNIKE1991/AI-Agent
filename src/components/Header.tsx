import React from 'react';
import {
  Bot,
  Brain,
  Compass,
  FileCheck2,
  Moon,
  Sparkles,
  Sun,
  Download,
  Calculator,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'unpack' | 'memory' | 'humaniser' | 'finance' | 'stages';
  setActiveTab: (tab: 'chat' | 'unpack' | 'memory' | 'humaniser' | 'finance' | 'stages') => void;
  sessionActive: boolean;
  onStartSession: () => void;
  onFinishSession: () => void;
  onExportMemory: () => void;
  onResetMemory: () => void;
  ruleCount: number;
  docsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sessionActive,
  onStartSession,
  onFinishSession,
  onExportMemory,
  onResetMemory,
  ruleCount,
  docsCount,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top brand and status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">IvanOS Agent</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Complete Edition
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Стратегический координатор по методологии ИИ-Лагеря Ивана Сергеева
              </p>
            </div>
          </div>

          {/* Quick Ritual Buttons & Global Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                sessionActive
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  sessionActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
              {sessionActive ? 'Сессия открыта' : 'Сессия закрыта'}
            </div>

            <button
              onClick={onStartSession}
              title="Выполнить ритуал 'Старт сессии'"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors shadow-sm"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Старт сессии</span>
            </button>

            <button
              onClick={onFinishSession}
              title="Выполнить ритуал 'Заверши сессию' и сохранить уроки в memory/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors shadow-sm"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Заверши сессию</span>
            </button>

            <button
              onClick={onExportMemory}
              title="Экспорт всех 4 слоев памяти и файлов бизнеса"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline">Экспорт базы</span>
            </button>

            <button
              onClick={onResetMemory}
              title="Сбросить память к заводским эталонам IvanOS"
              className="p-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Чат Агента</span>
          </button>

          <button
            onClick={() => setActiveTab('unpack')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'unpack'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Распаковка (7 блоков)</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'finance'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Калькулятор от денег</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'memory'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>4 Слоя Памяти</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'memory' ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {ruleCount + docsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('humaniser')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'humaniser'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Humaniser</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'stages'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>8 Этапов Лагеря</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
