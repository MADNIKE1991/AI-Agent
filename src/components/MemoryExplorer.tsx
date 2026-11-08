import React, { useState } from 'react';
import {
  Brain,
  Layers,
  FileCode,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Eye,
} from 'lucide-react';
import { FourLayersMemory, MemoryRuleFile, BusinessDocument } from '../types/ivanos.ts';

interface MemoryExplorerProps {
  memory: FourLayersMemory;
  onUpdateScratchpad: (text: string) => void;
  onUpdateCurrentTask: (text: string) => void;
  onAddRule: (rule: MemoryRuleFile) => void;
  onDeleteRule: (filename: string) => void;
  onUpdateBusinessDoc: (id: string, newContent: string) => void;
}

export const MemoryExplorer: React.FC<MemoryExplorerProps> = ({
  memory,
  onUpdateScratchpad,
  onUpdateCurrentTask,
  onAddRule,
  onDeleteRule,
  onUpdateBusinessDoc,
}) => {
  const [activeLayer, setActiveLayer] = useState<'layer1' | 'layer2' | 'layer3' | 'layer4'>('layer3');
  const [selectedDocId, setSelectedDocId] = useState<string>(
    memory.layer3_permanent.documents[0]?.id || ''
  );
  const [editingContent, setEditingContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // New rule dialog state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('feedback_novoe-pravilo');
  const [newRuleDesc, setNewRuleDesc] = useState('Краткая суть правила');
  const [newRuleBody, setNewRuleBody] = useState('');
  const [newRuleWhy, setNewRuleWhy] = useState('');
  const [newRuleHow, setNewRuleHow] = useState('');

  const selectedDoc =
    memory.layer3_permanent.documents.find((d) => d.id === selectedDocId) ||
    memory.layer3_permanent.documents[0];

  const handleSelectDoc = (doc: BusinessDocument) => {
    setSelectedDocId(doc.id);
    setEditingContent(doc.content);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (selectedDoc) {
      setEditingContent(selectedDoc.content);
      setIsEditing(true);
    }
  };

  const handleSaveDoc = () => {
    if (selectedDoc) {
      onUpdateBusinessDoc(selectedDoc.id, editingContent);
      setIsEditing(false);
    }
  };

  const handleCopyDoc = () => {
    if (selectedDoc) {
      navigator.clipboard.writeText(selectedDoc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleBody.trim()) return;

    const formattedName = newRuleName.startsWith('feedback_')
      ? newRuleName.trim()
      : `feedback_${newRuleName.trim()}`;

    onAddRule({
      name: formattedName,
      filename: `${formattedName}.md`,
      description: newRuleDesc.trim(),
      rule: newRuleBody.trim(),
      why: newRuleWhy.trim() || 'Урок из практики взаимодействия с пользователем',
      howToApply: newRuleHow.trim() || 'Проверять в каждом ответе перед выдачей',
      updatedAt: new Date().toISOString().split('T')[0],
    });

    setShowAddRuleModal(false);
    setNewRuleName('feedback_');
    setNewRuleDesc('');
    setNewRuleBody('');
    setNewRuleWhy('');
    setNewRuleHow('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900 to-zinc-900 border border-blue-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain className="w-48 h-48 text-blue-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Второй мозг IvanOS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Четыре Слоя Памяти Проекта
          </h1>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Архитектура непрерывного контекста: от сиюминутного окна текущего диалога до несменяемого
            паспорта бизнеса и регламентов скинни-скиллов.
          </p>
        </div>

        {/* 4 Layer Selector Pills */}
        <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveLayer('layer1')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeLayer === 'layer1'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <span>1. «Сейчас»</span>
            <span className="text-[10px] font-mono opacity-80">(Контекст)</span>
          </button>

          <button
            onClick={() => setActiveLayer('layer2')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeLayer === 'layer2'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <span>2. «Недавнее»</span>
            <span className="text-[10px] font-mono opacity-80">
              ({memory.layer2_recent.rules.length} правил)
            </span>
          </button>

          <button
            onClick={() => setActiveLayer('layer3')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeLayer === 'layer3'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <span>3. «Постоянное»</span>
            <span className="text-[10px] font-mono opacity-80">
              (.business / {memory.layer3_permanent.documents.length} файлов)
            </span>
          </button>

          <button
            onClick={() => setActiveLayer('layer4')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeLayer === 'layer4'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <span>4. «Навыки»</span>
            <span className="text-[10px] font-mono opacity-80">(Методы и скиллы)</span>
          </button>
        </div>
      </div>

      {/* LAYER 1: СЕЙЧАС */}
      {activeLayer === 'layer1' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Статус текущего контекстного окна
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-400">
                <span>Статус сессии:</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  {memory.layer1_now.sessionActive ? 'АКТИВНА' : 'ЗАКРЫТА'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-400">
                <span>Инициализирована:</span>
                <span className="text-zinc-200 font-mono">
                  {memory.layer1_now.sessionStartTime
                    ? new Date(memory.layer1_now.sessionStartTime).toLocaleTimeString()
                    : 'Не начата'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-400">
                <span>Примерный размер контекста:</span>
                <span className="text-amber-400 font-mono font-bold">
                  ~{memory.layer1_now.tokensEstimated} токенов
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block font-mono">
                Текущая активная задача (tasks/today.md):
              </label>
              <input
                type="text"
                value={memory.layer1_now.currentTask}
                onChange={(e) => onUpdateCurrentTask(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 flex flex-col">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Edit3 className="w-4 h-4 text-amber-400" />
              Блокнот сессии (Scratchpad)
            </h3>
            <p className="text-xs text-zinc-400">
              Рабочие пометки, временные гипотезы и блокеры. Автоматически учитываются при ритуале
              «Заверши сессию».
            </p>
            <textarea
              value={memory.layer1_now.scratchpad}
              onChange={(e) => onUpdateScratchpad(e.target.value)}
              rows={8}
              placeholder="Зафиксируй промежуточные факты, блокеры или ссылки..."
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* LAYER 2: НЕДАВНЕЕ (memory/) */}
      {activeLayer === 'layer2' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Память сессий (memory/)</h3>
              <p className="text-xs text-zinc-400">
                Уроки, поправки и персональные правила, выученные агентом во время рабочих сессий.
              </p>
            </div>
            <button
              onClick={() => setShowAddRuleModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить правило</span>
            </button>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memory.layer2_recent.rules.map((rule) => (
              <div
                key={rule.filename}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs text-blue-400">
                    <FileCode className="w-4 h-4" />
                    <span>memory/{rule.filename}</span>
                  </div>
                  <button
                    onClick={() => onDeleteRule(rule.filename)}
                    title="Удалить правило"
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs font-bold text-white">{rule.description}</div>

                <div className="space-y-2 text-xs bg-zinc-950 rounded-xl p-3 border border-zinc-850">
                  <div>
                    <span className="text-zinc-500 font-mono">Правило: </span>
                    <span className="text-zinc-200">{rule.rule}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono">Почему: </span>
                    <span className="text-zinc-400">{rule.why}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono">Как применять: </span>
                    <span className="text-emerald-400/90">{rule.howToApply}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-500">
                  Обновлено: {rule.updatedAt}
                </div>
              </div>
            ))}
          </div>

          {/* MEMORY.md Index Viewer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs font-mono text-zinc-400">
              Общий индекс памяти (memory/MEMORY.md):
            </div>
            <pre className="bg-zinc-950 p-4 rounded-xl text-xs text-zinc-300 font-mono whitespace-pre-wrap">
              {memory.layer2_recent.memoryIndexContent}
            </pre>
          </div>
        </div>
      )}

      {/* LAYER 3: ПОСТОЯННОЕ (.business/) */}
      {activeLayer === 'layer3' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-mono text-zinc-500 uppercase px-1 pb-1">
              Файлы паспорта бизнеса (.business/)
            </div>
            {memory.layer3_permanent.documents.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              return (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-zinc-900 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                      : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isSelected ? 'text-blue-400' : 'text-zinc-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-mono font-semibold truncate ${
                        isSelected ? 'text-blue-400' : 'text-zinc-200'
                      }`}
                    >
                      {doc.path}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {doc.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Markdown Content Viewer / Editor */}
          <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 flex flex-col h-[600px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono text-blue-400">{selectedDoc?.path}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedDoc?.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDoc}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Скопировано' : 'Копировать'}</span>
                </button>

                {isEditing ? (
                  <button
                    onClick={handleSaveDoc}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Сохранить</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Редактировать</span>
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-100 font-mono leading-relaxed focus:outline-none focus:border-blue-500 resize-none"
              />
            ) : (
              <pre className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-200 font-mono leading-relaxed overflow-y-auto whitespace-pre-wrap">
                {selectedDoc?.content}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* LAYER 4: НАВЫКИ (.business/processes/) */}
      {activeLayer === 'layer4' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deep Research 12 steps */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                12-шаговый Deep Research IvanOS
              </h3>
              <p className="text-xs text-zinc-400">
                Регламент глубокого исследования с обязательными гейтами (остановками для согласования с экспертом).
              </p>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {memory.layer4_skills.deepResearchSteps.map((step) => (
                  <div
                    key={step.step}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      step.isGate
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zinc-500">{step.step}.</span>
                      <span className="font-semibold">{step.name}</span>
                      <span className="text-zinc-500 text-[11px]">— {step.desc}</span>
                    </div>
                    {step.isGate && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        ГЕЙТ
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hunt Awareness Ladder */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                5 Уровней осознанности Ханта
              </h3>
              <p className="text-xs text-zinc-400">
                Классификация сегментов аудитории для проектирования контента и офферов.
              </p>
              <div className="space-y-2">
                {memory.layer4_skills.huntLadder.map((level) => (
                  <div
                    key={level.level}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-400 font-bold">
                        Уровень {level.level}: {level.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">«{level.mindset}»</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] leading-relaxed">
                      Цель контента: {level.contentGoal}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Constitution */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              CLAUDE.md / AGENTS.md — Конституция проекта
            </h3>
            <pre className="bg-zinc-950 p-4 rounded-xl text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
              {memory.layer4_skills.constitutionText}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Add New Memory Rule */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Добавить правило в memory/</h3>
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRuleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">
                  Имя файла (начинается с feedback_):
                </label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Суть правила (одна строка):</label>
                <input
                  type="text"
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Правило (что делать или не делать):</label>
                <textarea
                  value={newRuleBody}
                  onChange={(e) => setNewRuleBody(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Почему:</label>
                <input
                  type="text"
                  value={newRuleWhy}
                  onChange={(e) => setNewRuleWhy(e.target.value)}
                  placeholder="Причина из практики..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Как применять:</label>
                <input
                  type="text"
                  value={newRuleHow}
                  onChange={(e) => setNewRuleHow(e.target.value)}
                  placeholder="Как проверять себя в следующих сессиях..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Создать правило
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
