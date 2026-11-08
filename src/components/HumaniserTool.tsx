import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { cleanIvanOSText, detectCliches } from '../utils/textUtils.ts';

interface HumaniserToolProps {
  initialText?: string;
  onSendToChat?: (cleanedText: string) => void;
}

const SAMPLE_AI_SLOP = `В современном мире создание эффективного контента является безусловно ключевым аспектом успешного бизнеса. Важно отметить, что многие предприниматели стремятся к гармоничной трансформации своих маркетинговых процессов. Ноль хаоса. Ноль стресса. Ноль потерянных лидов.

Погрузимся в мир передовых нейросетевых технологий, которые предлагают не просто инструмент автоматизации, а целостную экосистему для масштабирования вашего бренда — от разработки уникального ценностного предложения до точечной доставки смыслов вашей целевой аудитории через мультимодальные воронки продаж нового поколения.`;

export const HumaniserTool: React.FC<HumaniserToolProps> = ({
  initialText = '',
  onSendToChat,
}) => {
  const [inputText, setInputText] = useState(initialText || SAMPLE_AI_SLOP);
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = detectCliches(inputText);

  const handleClean = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/humanise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutputText(data.text || cleanIvanOSText(inputText));
      } else {
        // Fallback to local rule engine
        setOutputText(cleanIvanOSText(inputText));
      }
    } catch {
      setOutputText(cleanIvanOSText(inputText));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertSample = () => {
    setInputText(SAMPLE_AI_SLOP);
    setOutputText('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-purple-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Скинни-скилл 6.1 IvanOS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Humaniser: Очистка от ИИ-мусора
          </h1>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Автоматическая дезинфекция текста от нейросетевых клише, замена длинных тире на дефисы,
            нарезка на короткие абзацы (до 3 предложений) и приведение к плотному инженерному стилю.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center gap-3 flex-wrap">
          <button
            onClick={handleClean}
            disabled={isProcessing || !inputText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors shadow-lg shadow-purple-600/20"
          >
            <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Очищаю текст...' : 'Очистить по стандарту IvanOS'}</span>
          </button>

          <button
            onClick={handleInsertSample}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Вставить образец со штампами</span>
          </button>
        </div>
      </div>

      {/* Violation Detection Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono text-zinc-400">Детектор машинных штампов:</span>

          <span
            className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 ${
              stats.count > 0
                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {stats.count > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            )}
            Клише и стоп-слов: {stats.count}
          </span>

          <span
            className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 ${
              stats.hasLongDashes
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {stats.hasLongDashes ? 'Длинные тире («—», «–»): Есть' : 'Длинные тире: Отсутствуют'}
          </span>

          <span
            className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 ${
              stats.longParagraphsCount > 0
                ? 'bg-zinc-800 text-zinc-300'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            Длинных абзацев (&gt;3 предл.): {stats.longParagraphsCount}
          </span>
        </div>

        {stats.matches.length > 0 && (
          <div className="text-[11px] font-mono text-red-400/90 truncate max-w-full">
            Найдено: {stats.matches.join(', ')}
          </div>
        )}
      </div>

      {/* Editor Grid: Raw vs Cleaned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 flex flex-col h-[460px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-zinc-500" />
              Исходный текст (до очистки)
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {inputText.length} символов
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Вставь сюда текст поста, статьи или письма для проверки..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 leading-relaxed font-mono resize-none"
          />
        </div>

        {/* Cleaned Result Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 flex flex-col h-[460px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Очищенный текст (стандарт IvanOS)
            </span>
            {outputText && (
              <span className="text-[11px] font-mono text-emerald-400">
                {outputText.length} символов
              </span>
            )}
          </div>

          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-100 leading-relaxed font-sans overflow-y-auto whitespace-pre-wrap">
            {outputText ? (
              outputText
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
                <Sparkles className="w-8 h-8 opacity-40 text-purple-500" />
                <span className="text-xs">Нажми «Очистить по стандарту IvanOS» выше</span>
              </div>
            )}
          </div>

          {outputText && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
              </button>

              {onSendToChat && (
                <button
                  onClick={() => onSendToChat(outputText)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Отправить в чат Агенту</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
