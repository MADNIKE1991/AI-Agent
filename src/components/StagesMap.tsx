import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  Send,
  FileText,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AICampStage } from '../types/ivanos.ts';
import { AI_CAMP_STAGES } from '../data/initialMemory.ts';

interface StagesMapProps {
  onExecuteStageWithAgent: (prompt: string) => void;
}

export const StagesMap: React.FC<StagesMapProps> = ({ onExecuteStageWithAgent }) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('stage-00');

  const selectedStage =
    AI_CAMP_STAGES.find((s) => s.id === selectedStageId) || AI_CAMP_STAGES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <MapPin className="w-48 h-48 text-amber-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Методология ИИ-Лагеря Ивана Сергеева
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Карта 8 Этапов Запуска IvanOS
          </h1>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Полный цикл создания, упаковки, запуска и масштабирования продукта: от распаковки хаоса до
            контент-завода и сбора твердых кейсов.
          </p>
        </div>
      </div>

      {/* Grid: Stages Roadmap + Stage Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stages List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-mono text-zinc-500 uppercase px-1 pb-1">
            Фазы запуска (00 — 08)
          </div>
          {AI_CAMP_STAGES.filter((s) => !s.isSpecial).map((stage) => {
            const isSelected = stage.id === selectedStageId;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-amber-500 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`h-7 w-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-850 text-zinc-400 border border-zinc-700/60'
                    }`}
                  >
                    {stage.code}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-amber-400' : 'text-zinc-200'
                      }`}
                    >
                      {stage.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {stage.tagline}
                    </div>
                  </div>
                </div>
                <ArrowRight
                  className={`w-3.5 h-3.5 flex-shrink-0 ml-2 ${
                    isSelected ? 'text-amber-400' : 'text-zinc-600'
                  }`}
                />
              </button>
            );
          })}

          {/* Special Modules */}
          <div className="text-xs font-mono text-zinc-500 uppercase px-1 pt-4 pb-1">
            Специальные модули (S, G, F)
          </div>
          {AI_CAMP_STAGES.filter((s) => s.isSpecial).map((stage) => {
            const isSelected = stage.id === selectedStageId;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-purple-500 shadow-md ring-1 ring-purple-500/20'
                    : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`h-7 w-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-850 text-purple-400 border border-purple-800/40'
                    }`}
                  >
                    {stage.code}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-purple-300' : 'text-zinc-200'
                      }`}
                    >
                      {stage.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {stage.tagline}
                    </div>
                  </div>
                </div>
                <ArrowRight
                  className={`w-3.5 h-3.5 flex-shrink-0 ml-2 ${
                    isSelected ? 'text-purple-400' : 'text-zinc-600'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono font-black text-sm flex items-center justify-center">
                  {selectedStage.code}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {selectedStage.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedStage.tagline}</p>
                </div>
              </div>

              <button
                onClick={() => onExecuteStageWithAgent(selectedStage.promptTemplate)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Запустить этап с Агентом</span>
              </button>
            </div>

            {/* Deliverables / Артефакты */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Осязаемые артефакты этапа:
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedStage.deliverables.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Чек-лист готовности:
              </div>
              <div className="space-y-2">
                {selectedStage.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Template */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-zinc-400 uppercase">
                Готовый промпт для Агента:
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono leading-relaxed">
                {selectedStage.promptTemplate}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex justify-end">
            <button
              onClick={() => onExecuteStageWithAgent(selectedStage.promptTemplate)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Передать задачу Агенту IvanOS в чат</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
