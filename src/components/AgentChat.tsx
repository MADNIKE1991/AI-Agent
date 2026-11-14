import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User,
  ShieldAlert,
  ArrowRight,
  Brain,
  FileText,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { ChatMessage } from '../types/ivanos.ts';
import { useDraggableScroll } from '../hooks/useDraggableScroll.ts';

interface AgentChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
  onSaveMessageToMemoryRule?: (text: string) => void;
  onSaveMessageToBusinessDoc?: (text: string) => void;
  onSendToHumaniser?: (text: string) => void;
}

const QUICK_ACTIONS = [
  { label: '☀️ Старт сессии', prompt: 'Старт сессии' },
  { label: '🌙 Заверши сессию', prompt: 'Заверши сессию' },
  { label: '📅 Контент-план (Хант)', prompt: 'Сгенерируй детальный контент-план на 7 дней по лестнице Ханта для Ice Studio.' },
  { label: '🎬 Сценарий Рилс (9:16)', prompt: 'Напиши сценарий 30-секундного Рилса с раскадровкой, кинетическими титрами и озвучкой для ElevenLabs.' },
  { label: '📢 Мультипостинг (ТГ/ВК/Дзен)', prompt: 'Подготовь пост для мультипостинга в Telegram, ВК, Дзен и Нельзяграм с разметкой под каждый канал.' },
  { label: '🧭 Запусти распаковку', prompt: 'Запусти распаковку' },
  { label: '💰 План по деньгам', prompt: 'Рассчитай план по деньгам от цели 1 000 000 ₽ на 12 недель назад: декомпозиция на 3 месяца и 3 дня смены.' },
  { label: '👥 Профиль ЦА (Хант)', prompt: 'Собери детальный профиль ЦА с 4 блоками (ситуация, боли, результат, цитаты) и 5 уровнями осознанности по лестнице Ханта.' },
  { label: '🔬 12-шаговый Deep Research', prompt: 'Запусти 12-шаговый Deep Research для анализа ключевых конкурентов в моей нише. Начни с Шагов 1-5 и остановись на гейте.' },
  { label: '🎯 Сетка офферов', prompt: 'Спроектируй линейку продуктов: бесплатный лид-магнит, трипваер, флагман и VIP-тариф с ценовой лестницей.' },
];

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  onSaveMessageToMemoryRule,
  onSaveMessageToBusinessDoc,
  onSendToHumaniser,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quickActionsScrollRef = useDraggableScroll<HTMLDivElement>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] bg-zinc-950 text-zinc-100">
      {/* Top IvanOS Protocol Guard Banner */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            Правило №1:
          </span>
          <span className="text-zinc-300">
            Идти до результата, приходить только с результатом. Без лишних вопросов и клише.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Дефисы вместо тире
          </span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">Короткие абзацы (1-3 предл.)</span>
          <button
            onClick={onClearChat}
            title="Очистить историю чата"
            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            Очистить
          </button>
        </div>
      </div>

      {/* Quick Action Chips (Mouse Draggable) */}
      <div
        ref={quickActionsScrollRef}
        className="px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/40 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-mono text-zinc-500 mr-1 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            Быстрый пуск:
          </span>
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(action.prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs rounded-md bg-zinc-800/80 hover:bg-zinc-700 hover:text-white text-zinc-300 border border-zinc-700/60 transition-all font-mono whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-4 text-zinc-400">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                MADNIKE OS Agent готов к работе
              </h2>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                Персональный координатор и стратегический партнер проектов Ice Studio (Никита Меньшаев) по системе MADNIKE OS.
                Память проекта и 4 слоя активны.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left w-full pt-2">
              <button
                onClick={() => onSendMessage('Старт сессии')}
                className="p-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all text-left group"
              >
                <div className="font-semibold text-amber-400 flex items-center justify-between mb-1">
                  ☀️ Старт сессии
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                Инициализация контекста и считывание памяти MEMORY.md
              </button>

              <button
                onClick={() => onSendMessage('Запусти распаковку')}
                className="p-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all text-left group"
              >
                <div className="font-semibold text-amber-400 flex items-center justify-between mb-1">
                  🧭 Запусти распаковку
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                7 блоков вопросов и финансовая модель от денег назад
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            const isStartSessionResponse = message.content.includes('🟢 Сессия открыта');
            const isFinishSessionResponse = message.content.includes('✅ Всё сохранено');

            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-4xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex-shrink-0 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-amber-500/10">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[78%]`}>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 px-1 font-mono">
                    <span>{isUser ? 'Вы' : 'MADNIKE OS Agent'}</span>
                    <span>•</span>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isStartSessionResponse && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                        Ритуал: Старт
                      </span>
                    )}
                    {isFinishSessionResponse && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold border border-indigo-500/20">
                        Ритуал: Финиш
                      </span>
                    )}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-amber-600 text-zinc-950 font-medium rounded-tr-none shadow-md shadow-amber-600/10'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words font-sans">
                      {message.content}
                    </div>
                  </div>

                  {/* Actions for Assistant Messages */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400 px-1 flex-wrap">
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] transition-colors"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Скопировано</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Копировать
                          </>
                        )}
                      </button>

                      {onSendToHumaniser && (
                        <button
                          onClick={() => onSendToHumaniser(message.content)}
                          className="flex items-center gap-1 hover:text-amber-300 px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Humaniser
                        </button>
                      )}

                      {onSaveMessageToMemoryRule && message.content.includes('feedback_') && (
                        <button
                          onClick={() => onSaveMessageToMemoryRule(message.content)}
                          className="flex items-center gap-1 hover:text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-[11px] transition-colors"
                        >
                          <Brain className="w-3 h-3 text-indigo-400" />
                          В память (memory/)
                        </button>
                      )}

                      {onSaveMessageToBusinessDoc && (
                        <button
                          onClick={() => onSaveMessageToBusinessDoc(message.content)}
                          className="flex items-center gap-1 hover:text-amber-300 px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] transition-colors"
                        >
                          <FileText className="w-3 h-3 text-zinc-400" />
                          В .business
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-lg bg-zinc-800 flex-shrink-0 flex items-center justify-center text-zinc-300 font-bold border border-zinc-700">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-4xl mx-auto">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex-shrink-0 flex items-center justify-center text-amber-400 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-zinc-400 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>MADNIKE OS Agent выполняет расчет и сборку артефакта...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative rounded-xl border border-zinc-700 bg-zinc-900 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all shadow-lg">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Дай задачу агенту, введи данные или нажми 'Старт сессии' (Enter для отправки, Shift+Enter для новой строки)..."
              rows={1}
              className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none max-h-44 leading-relaxed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="absolute right-2.5 bottom-2.5 h-8 w-8 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-600 flex items-center justify-center transition-all disabled:cursor-not-allowed font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1.5 px-1">
            <span>Протокол: Правило №1 • Без клише • Обычный дефис (-)</span>
            <span>gemini-3.8-flash</span>
          </div>
        </form>
      </div>
    </div>
  );
};
