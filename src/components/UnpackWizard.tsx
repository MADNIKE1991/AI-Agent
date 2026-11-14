import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  Save,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { UnpackBlock } from '../types/ivanos.ts';

interface UnpackWizardProps {
  blocks: UnpackBlock[];
  onUpdateBlockAnswer: (id: number, answer: string) => void;
  onSendBlockToAgent: (block: UnpackBlock) => void;
  onSynthesizeAllToBusiness: () => void;
  onOpenFinanceCalculator: () => void;
}

export const UnpackWizard: React.FC<UnpackWizardProps> = ({
  blocks,
  onUpdateBlockAnswer,
  onSendBlockToAgent,
  onSynthesizeAllToBusiness,
  onOpenFinanceCalculator,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const currentBlock = blocks.find((b) => b.id === activeStep) || blocks[0];

  const filledCount = blocks.filter((b) => b.userAnswer.trim().length > 0).length;
  const progressPercent = Math.round((filledCount / blocks.length) * 100);

  const handleNext = () => {
    if (activeStep < blocks.length) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass className="w-48 h-48 text-amber-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            .business/PLAN-RASPAKOVKI.md
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Магистральный сценарий распаковки бизнеса
          </h1>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Фундаментальный опрос из 7 ключевых блоков по методологии MADNIKE OS. Распаковывает хаос в единый
            паспорт проекта, формирует золотой сегмент ЦА и готовит расчет от денег назад.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-2/3 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Прогресс распаковки: {filledCount} из {blocks.length} блоков</span>
              <span className="text-amber-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onSynthesizeAllToBusiness}
              disabled={filledCount === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить в .business</span>
            </button>
            <button
              onClick={onOpenFinanceCalculator}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Часть 2: План по деньгам</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Steps list + Active Question */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono text-zinc-500 uppercase px-1 pb-1">
            7 Блоков распаковки
          </div>
          {blocks.map((block) => {
            const isActive = block.id === activeStep;
            const isFilled = block.userAnswer.trim().length > 0;

            return (
              <button
                key={block.id}
                onClick={() => setActiveStep(block.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isActive
                    ? 'bg-zinc-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-zinc-950 hover:bg-zinc-900/60 border-zinc-800/80'
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 ${
                    isFilled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isActive
                      ? 'bg-amber-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isFilled ? <CheckCircle2 className="w-3.5 h-3.5" /> : block.id}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold truncate ${
                      isActive ? 'text-amber-400' : 'text-zinc-200'
                    }`}
                  >
                    {block.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {block.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Block Content Area */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <span className="text-xs font-mono text-amber-500">Блок {currentBlock.id} из {blocks.length}</span>
              <h2 className="text-xl font-bold text-white mt-0.5">{currentBlock.title}</h2>
              <p className="text-xs text-zinc-400 mt-1">{currentBlock.subtitle}</p>
            </div>
            <button
              onClick={() => onSendBlockToAgent(currentBlock)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
              title="Передать этот блок агенту в чат, чтобы он задал вопрос или проанализировал ответ"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Отправить в чат</span>
            </button>
          </div>

          {/* Prompt Question */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono text-[11px]">
              <HelpCircle className="w-3.5 h-3.5" />
              Вопрос от агента MADNIKE OS:
            </div>
            <p className="text-sm text-zinc-200 font-sans leading-relaxed">
              {currentBlock.promptQuestion}
            </p>
          </div>

          {/* User Answer Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300 font-mono">
              Твой ответ / факт о бизнесе (без выдумывания и клише):
            </label>
            <textarea
              value={currentBlock.userAnswer}
              onChange={(e) => onUpdateBlockAnswer(currentBlock.id, e.target.value)}
              placeholder={currentBlock.placeholder}
              rows={6}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 leading-relaxed font-sans"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              onClick={handlePrev}
              disabled={activeStep === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>

            <div className="flex items-center gap-2">
              {currentBlock.userAnswer.trim().length > 0 && (
                <button
                  onClick={() => onSendBlockToAgent(currentBlock)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Разобрать с агентом</span>
                </button>
              )}

              {activeStep < blocks.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors"
                >
                  <span>Далее</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onOpenFinanceCalculator}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors"
                >
                  <span>Перейти к плану по деньгам</span>
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
