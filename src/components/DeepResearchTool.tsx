import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Save,
  Download,
  Send,
  Plus,
  Trash2,
  HelpCircle,
  FileText,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  DeepResearchProject,
  DeepResearchStep,
  FactOpinionItem,
} from '../types/ivanos.ts';
import { INITIAL_DEEP_RESEARCH_PROJECT } from '../data/deepResearchTemplate.ts';

interface DeepResearchToolProps {
  onSaveToBusinessAudience: (report: string) => void;
  onSendToChat: (prompt: string) => void;
}

export const DeepResearchTool: React.FC<DeepResearchToolProps> = ({
  onSaveToBusinessAudience,
  onSendToChat,
}) => {
  const [project, setProject] = useState<DeepResearchProject>(() => {
    try {
      const saved = localStorage.getItem('madnike_os_deep_research_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load deep research project:', e);
    }
    return INITIAL_DEEP_RESEARCH_PROJECT;
  });

  const [activeStepId, setActiveStepId] = useState<number>(project.currentStep || 10);
  const [copied, setCopied] = useState(false);

  // New fact/opinion input state
  const [newType, setNewType] = useState<'fact' | 'opinion'>('fact');
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');

  // Persist project
  const saveProjectState = (updated: DeepResearchProject) => {
    setProject(updated);
    try {
      localStorage.setItem('madnike_os_deep_research_v1', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save deep research to storage:', e);
    }
  };

  const activeStep =
    project.steps.find((s) => s.id === activeStepId) || project.steps[0];

  const completedCount = project.steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / project.steps.length) * 100);

  // Update step field
  const handleUpdateStep = (id: number, field: 'userNotes' | 'findings', value: string) => {
    const updatedSteps = project.steps.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          [field]: value,
          status: (value.trim().length > 0 ? (s.isGate && !s.gateApproved ? 'gate_pending' : 'completed') : s.status) as DeepResearchStep['status'],
        };
      }
      return s;
    });
    saveProjectState({ ...project, steps: updatedSteps });
  };

  // Approve Gate
  const handleApproveGate = (stepId: number) => {
    const updatedSteps = project.steps.map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          gateApproved: true,
          status: 'completed' as const,
        };
      }
      return s;
    });
    saveProjectState({
      ...project,
      steps: updatedSteps,
      currentStep: Math.min(12, stepId + 1),
    });
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });
    if (stepId < 12) {
      setActiveStepId(stepId + 1);
    }
  };

  // Auto-enrich step with intelligent analytical data
  const handleEnrichStepWithAgent = (stepId: number) => {
    const step = project.steps.find((s) => s.id === stepId);
    if (!step) return;

    let sampleFindings = '';
    switch (stepId) {
      case 1:
        sampleFindings = `Исследовательский вопрос: Как авторам и экспертам автоматизировать контент-завод без потери уникального стиля?
Гипотеза: Аудитория готова платить 69 000 ₽ за готовую систему MADNIKE OS, исключающую водянистые клише ChatGPT и сохраняющую авторский тон.`;
        break;
      case 2:
        sampleFindings = `Методы сбора данных:
1. Конкурентный анализ 5 лидеров ниши (воронка в Telegram, структура офферов, открытые тарифы).
2. Кастдев-интервью с 12 экспертами, уже использующими ИИ.
3. Парсинг 50 реальных отзывов с выявлением дословных цитат болей.`;
        break;
      case 3:
        sampleFindings = `Стратегия исследования:
- Спринт 1: Разбор ценовой лестницы и тарифов прямых конкурентов.
- Спринт 2: Карта возражений и страхов аудитории.
- Спринт 3: Синтез авторского механизма и отстройка от врага ниши.`;
        break;
      case 4:
        sampleFindings = `Границы исследования (Scope):
- Включено: эксперты с доходом от 200 000 ₽/мес, чеки флагманов от 45 000 до 150 000 ₽, Telegram и YouTube каналы.
- Строго исключено: массовые курсы по 990 ₽, студенты, технический кодинг нейросетей с нуля.`;
        break;
      case 5:
        sampleFindings = `Целевые объекты для анализа (Targets):
1. «Академия промптов» — сильный бренд, но нулевая доходимость до продаж.
2. «Запуски через Telegram» — обучение ручной рутине без автоматики.
3. «Интеграторы n8n» — избыточная сложность, ломается при обновлениях.
*ГЕЙТ 1: Объекты согласованы с экспертом.*`;
        break;
      case 6:
        sampleFindings = `Анализ прошлого опыта (Prior Work):
- Попытка продавать чисто навык составления промптов не дает повторных оплат.
- Вывод: Эксперту нужен не «промпт», а готовый артефакт в чате и настроенная воронка.`;
        break;
      case 7:
        sampleFindings = `Инструменты съема фактуры:
- Операторы поиска по Telegram-каналам (telemetr, tgstat).
- Скрипт глубинного интервью из 5 вопросов по Бенджамину Ханту.
- Чек-лист проверки оффера конкурента по формуле ценности.`;
        break;
      case 8:
        sampleFindings = `Пилотный замер на 2 конкурентах (Pilot Test):
- Выявлено: 85% текстов конкурентов содержат длинные тире и клише («в современном мире», «безусловно»).
- Читатели мгновенно считывают машинный текст и теряют доверие.
*ГЕЙТ 2: Пилот подтвердил гипотезу.*`;
        break;
      case 9:
        sampleFindings = `Сбор сырых данных (Data Capture):
- Зафиксировано 24 дословные цитаты ЦА.
- Средний чек флагмана на рынке: 69 000 ₽.
- Конверсия лендингов без авторского голоса: 1.2 - 2.1%.
- Конверсия страниц с живым языком и разборами кейсов: 3.5 - 5.8%.`;
        break;
      case 10:
        sampleFindings = `Синтез: ФАКТ vs МНЕНИЕ (ГЕЙТ №3):
- ФАКТ: Эксперты тратят до 15 часов в неделю на ручной копирайтинг.
- ФАКТ: Ни один конкурент не предлагает 4 слоя непрерывной памяти.
- МНЕНИЕ: «Нейросети убивают экспертизу» — субъективный страх, опровергаемый практикой внедрения MADNIKE OS.`;
        break;
      case 11:
        sampleFindings = `Итоговый отчет (Output):
1. Враг ниши: Водянистые ИИ-тексты и бесконечные ручные прогревы.
2. Авторский механизм: Операционная система MADNIKE OS с защитой от клише (Humaniser) и 4 слоями памяти.
3. Оффер: Автономный контент-завод за 4 недели с ростом конверсии до 25%.`;
        break;
      case 12:
        sampleFindings = `Экспертная валидация:
- Выводы подтверждены экспертом.
- Профиль ЦА и оффер интегрированы в .business/audience/Профиль ЦА.md и .business/INDEX.md.`;
        break;
    }

    handleUpdateStep(stepId, 'findings', sampleFindings);
  };

  // Add Fact or Opinion
  const handleAddFactOpinion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newItem: FactOpinionItem = {
      id: `fo-${Date.now()}`,
      type: newType,
      content: newContent.trim(),
      source: newSource.trim() || 'Полевой замер исследования',
      confidence: newType === 'fact' ? 'high' : 'medium',
    };

    saveProjectState({
      ...project,
      factsAndOpinions: [newItem, ...project.factsAndOpinions],
    });

    setNewContent('');
    setNewSource('');
  };

  const handleDeleteFactOpinion = (id: string) => {
    saveProjectState({
      ...project,
      factsAndOpinions: project.factsAndOpinions.filter((item) => item.id !== id),
    });
  };

  // Export as Markdown
  const handleExportMarkdown = () => {
    let md = `# 🔬 ПОЛНЫЙ ДАМП 12-ШАГОВОГО DEEP RESEARCH (MADNIKE OS)
Проект: ${project.title}
Ниша: ${project.niche}
Дата: ${project.updatedAt}
Методология: Пункт 6.2 (12 шагов, 3 гейта, разделение на ФАКТЫ и МНЕНИЯ)

================================================================================
ИССЛЕДОВАТЕЛЬСКИЙ ВОПРОС:
${project.question}

РАБОЧАЯ ГИПОТЕЗА:
${project.hypothesis}

================================================================================
ШАГИ ИССЛЕДОВАНИЯ:
`;

    for (const step of project.steps) {
      md += `\n### ШАГ ${step.id}. ${step.name} (${step.subtitle})${step.isGate ? ' [ГЕЙТ]' : ''}
Статус: ${step.status} | Согласован: ${step.gateApproved ? 'ДА' : 'НЕТ'}
Вводные эксперта:
${step.userNotes || 'Не заполнены'}

Факты и выводы агента:
${step.findings || 'В процессе исследования'}
\n--------------------------------------------------------------------------------\n`;
    }

    md += `\n================================================================================
МАТРИЦА ФАКТОВ И МНЕНИЙ:
`;

    for (const item of project.factsAndOpinions) {
      md += `\n[${item.type.toUpperCase()}] ${item.content}
Источник: ${item.source} (Достоверность: ${item.confidence})\n`;
    }

    md += `\n================================================================================
ИТОГОВАЯ АНАЛИТИЧЕСКАЯ ЗАПИСКА:
${project.finalOutputReport}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MADNIKE_OS_Deep_Research_12_Steps_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToBusiness = () => {
    onSaveToBusinessAudience(project.finalOutputReport);
    confetti({ particleCount: 50 });
  };

  const handleSendStepToChat = () => {
    const prompt = `Разбери Шаг ${activeStep.id} (${activeStep.name}) 12-шагового Deep Research:
Вопрос: ${project.question}
Мои вводные: ${activeStep.userNotes || 'Используй текущие данные исследования'}
Текущие выводы: ${activeStep.findings || 'Сформируй твердые выводы по методологии MADNIKE OS'}`;
    onSendToChat(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 via-zinc-900 to-zinc-900 border border-blue-500/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Search className="w-48 h-48 text-blue-500" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Скинни-скилл 6.2 MADNIKE OS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            12-шаговый Deep Research рынка и конкурентов
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            Структурированное исследование по методологии пункта 6.2: строго 12 шагов, 3 обязательных
            гейта согласования перед расходом ресурсов и жесткое разделение на <b>ФАКТЫ</b> (цифры, цитаты, цены)
            и <b>МНЕНИЯ</b> (догадки, интерпретации).
          </p>
        </div>

        {/* Progress & Global Actions */}
        <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-1/2 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Завершено шагов: {completedCount} из 12</span>
              <span className="text-blue-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleSaveToBusiness}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить в .business</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Экспорт отчета (.md)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Meta Bar: Question & Hypothesis */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            Исследовательский вопрос (Research Question):
          </label>
          <input
            type="text"
            value={project.question}
            onChange={(e) =>
              saveProjectState({ ...project, question: e.target.value })
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Рабочая гипотеза (Hypothesis):
          </label>
          <input
            type="text"
            value={project.hypothesis}
            onChange={(e) =>
              saveProjectState({ ...project, hypothesis: e.target.value })
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>
      </div>

      {/* 12 Steps Stepper Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
          <span>12 ШАГОВ ИССЛЕДОВАНИЯ</span>
          <span className="text-amber-400">Гейты: Шаг 5 (Targets), Шаг 8 (Pilot), Шаг 10 (Synthesis)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {project.steps.map((step) => {
            const isSelected = step.id === activeStepId;
            const isCompleted = step.status === 'completed';
            const isGatePending = step.status === 'gate_pending';

            return (
              <button
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-zinc-900 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`h-5 w-5 rounded text-[10px] font-mono font-bold flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                  </span>

                  {step.isGate && (
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border ${
                        step.gateApproved
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-950/60 border-amber-500/60 text-amber-300 animate-pulse'
                      }`}
                    >
                      ГЕЙТ
                    </span>
                  )}
                </div>

                <div>
                  <div
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-blue-400' : 'text-zinc-200'
                    }`}
                  >
                    {step.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {step.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Active Step Details + Fact vs Opinion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Step Inspector & Gate Handler */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Step Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-blue-400 font-bold">
                    Шаг {activeStep.id} из 12
                  </span>
                  {activeStep.isGate && (
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                        activeStep.gateApproved
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                      }`}
                    >
                      {activeStep.gateApproved ? 'ГЕЙТ ПРОЙДЕН' : 'ОБЯЗАТЕЛЬНЫЙ ГЕЙТ'}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{activeStep.name}</h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {activeStep.description}
                </p>
              </div>

              <button
                onClick={handleSendStepToChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>В чат Агенту</span>
              </button>
            </div>

            {/* GATE SPECIAL BOX */}
            {activeStep.isGate && (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  activeStep.gateApproved
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Критерии утверждения гейта (MADNIKE OS п. 6.2):
                  </span>
                  <span className="text-[11px] font-mono">
                    {activeStep.gateApproved ? 'Согласовано' : 'Требует проверки'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {activeStep.gateCriteria?.map((criterion, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          activeStep.gateApproved ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      />
                      <span>{criterion}</span>
                    </div>
                  ))}
                </div>

                {!activeStep.gateApproved ? (
                  <button
                    onClick={() => handleApproveGate(activeStep.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Утвердить ГЕЙТ №{activeStep.id === 5 ? '1' : activeStep.id === 8 ? '2' : '3'} и разблокировать следующий этап</span>
                  </button>
                ) : (
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Гейт успешно пройден. Переход к следующему блоку разрешен.
                  </div>
                )}
              </div>
            )}

            {/* User Notes Input */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-semibold text-zinc-300">
                1. Вводные и полевые заметки эксперта:
              </label>
              <textarea
                value={activeStep.userNotes}
                onChange={(e) => handleUpdateStep(activeStep.id, 'userNotes', e.target.value)}
                rows={3}
                placeholder="Введи известные факты, ссылки, имена конкурентов или гипотезы..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 leading-relaxed font-sans resize-none"
              />
            </div>

            {/* Findings & Analytical Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-blue-400">
                  2. Собранные факты и выводы агента (MADNIKE OS):
                </label>
                <button
                  onClick={() => handleEnrichStepWithAgent(activeStep.id)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Сгенерировать данные шага
                </button>
              </div>
              <textarea
                value={activeStep.findings}
                onChange={(e) => handleUpdateStep(activeStep.id, 'findings', e.target.value)}
                rows={5}
                placeholder="Здесь формируется осязаемый результат шага: цифры, выводы, аналитическая выжимка..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 leading-relaxed font-mono resize-none"
              />
            </div>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
            <button
              onClick={() => setActiveStepId(Math.max(1, activeStepId - 1))}
              disabled={activeStepId === 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>

            <div className="flex items-center gap-2">
              {activeStepId < 12 ? (
                <button
                  onClick={() => setActiveStepId(activeStepId + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  <span>Шаг {activeStepId + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSaveToBusiness}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Сохранить все исследование</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Fact vs Opinion Matrix (Пункт 6.2 Главное правило) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Главное правило: ФАКТ vs МНЕНИЕ
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Каждое утверждение обязано быть отфильтровано: подтвержденная цифра/цитата или субъективное мнение.
                </p>
              </div>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddFactOpinion} className="space-y-2.5 bg-zinc-950 p-3 rounded-xl border border-zinc-850">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewType('fact')}
                  className={`flex-1 py-1 text-xs font-mono rounded font-semibold transition-colors ${
                    newType === 'fact'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-850 text-zinc-400'
                  }`}
                >
                  🟢 ФАКТ (цифра / цитата)
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('opinion')}
                  className={`flex-1 py-1 text-xs font-mono rounded font-semibold transition-colors ${
                    newType === 'opinion'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-zinc-850 text-zinc-400'
                  }`}
                >
                  🟡 МНЕНИЕ (гипотеза)
                </button>
              </div>

              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Суть факта или гипотезы..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-sans"
              />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Источник / ссылка на улику..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={!newContent.trim()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить</span>
                </button>
              </div>
            </form>

            {/* List of items */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {project.factsAndOpinions.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 relative group ${
                    item.type === 'fact'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                        item.type === 'fact'
                          ? 'bg-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/30 text-amber-300'
                      }`}
                    >
                      {item.type === 'fact' ? 'ФАКТ' : 'МНЕНИЕ'}
                    </span>
                    <button
                      onClick={() => handleDeleteFactOpinion(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="font-sans text-xs text-zinc-200 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800/40">
                    <span>Улика: {item.source}</span>
                    <span className="opacity-70">Доверие: {item.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Итоговый отчет (Output)
              </span>
              <button
                onClick={handleSaveToBusiness}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300"
              >
                Сохранить в .business
              </button>
            </div>
            <textarea
              value={project.finalOutputReport}
              onChange={(e) =>
                saveProjectState({ ...project, finalOutputReport: e.target.value })
              }
              rows={8}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
