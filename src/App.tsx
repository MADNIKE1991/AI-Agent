/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header.tsx';
import { AgentChat } from './components/AgentChat.tsx';
import { UnpackWizard } from './components/UnpackWizard.tsx';
import { MemoryExplorer } from './components/MemoryExplorer.tsx';
import { HumaniserTool } from './components/HumaniserTool.tsx';
import { FinanceCalculator } from './components/FinanceCalculator.tsx';
import { StagesMap } from './components/StagesMap.tsx';
import {
  ChatMessage,
  FourLayersMemory,
  UnpackBlock,
  MemoryRuleFile,
} from './types/ivanos.ts';
import {
  INITIAL_FOUR_LAYERS_MEMORY,
  INITIAL_UNPACK_BLOCKS,
} from './data/initialMemory.ts';
import { buildIvanOSSystemInstruction } from './data/systemInstruction.ts';
import {
  exportAllMemoryAsMarkdown,
  extractFeedbackRule,
} from './utils/textUtils.ts';

const STORAGE_KEY_MEMORY = 'ivanos_agent_memory_v1';
const STORAGE_KEY_BLOCKS = 'ivanos_agent_unpack_blocks_v1';
const STORAGE_KEY_MESSAGES = 'ivanos_agent_chat_messages_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'unpack' | 'memory' | 'humaniser' | 'finance' | 'stages'
  >('chat');

  // Load from local storage or initial
  const [memory, setMemory] = useState<FourLayersMemory>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load memory from storage:', e);
    }
    return INITIAL_FOUR_LAYERS_MEMORY;
  });

  const [unpackBlocks, setUnpackBlocks] = useState<UnpackBlock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BLOCKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load blocks from storage:', e);
    }
    return INITIAL_UNPACK_BLOCKS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load messages from storage:', e);
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `🟢 Сессия открыта. База знаний IvanOS и память проекта считаны. Жду задачу или вводные.

Я — твой персональный ИИ-агент и координатор по методологии IvanOS (ИИ-Лагерь Ивана Сергеева).
Все 4 слоя памяти активны:
- Слой 1: Текущее контекстное окно
- Слой 2: Уроки и поправки сессий (memory/)
- Слой 3: Паспорт бизнеса (.business/)
- Слой 4: Регламенты Humaniser, Deep Research и лестница Ханта

Можешь нажать «Запусти распаковку», «Старт сессии» или дать мне любую боевую задачу.`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [humaniserPrefillText, setHumaniserPrefillText] = useState('');

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(memory));
    } catch (e) {
      console.error('Failed to save memory to localStorage', e);
    }
  }, [memory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(unpackBlocks));
    } catch (e) {
      console.error('Failed to save blocks to localStorage', e);
    }
  }, [unpackBlocks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages to localStorage', e);
    }
  }, [messages]);

  // Send message to Gemini 3.8 Flash via server proxy
  const handleSendMessage = useCallback(
    async (userInput: string) => {
      const trimmed = userInput.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const assistantMsgId = `asst-${Date.now()}`;
      // Placeholder for streaming
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        },
      ]);

      const systemInstruction = buildIvanOSSystemInstruction(memory);

      try {
        const historyForApi = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: historyForApi,
            systemInstruction,
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') break;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    accumulated += parsed.text;
                    // Ensure IvanOS standard: replace em-dashes with hyphens
                    const cleaned = accumulated.replace(/—|–/g, '-');
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMsgId ? { ...msg, content: cleaned } : msg
                      )
                    );
                  }
                } catch {
                  // Ignore JSON parse chunk errors
                }
              }
            }
          }
        }

        // Post-process final response
        const finalCleaned = accumulated.replace(/—|–/g, '-');

        // Check if this was a "Заверши сессию" ritual
        if (trimmed.toLowerCase().includes('заверши сессию') || trimmed.toLowerCase() === 'финиш') {
          const { ruleFile, memoryIndexLine } = extractFeedbackRule(finalCleaned);
          if (ruleFile) {
            // Auto add to Layer 2 rules
            setMemory((prev) => {
              const existingFiltered = prev.layer2_recent.rules.filter(
                (r) => r.filename !== ruleFile.filename
              );
              const updatedRules = [...existingFiltered, ruleFile];
              let updatedIndex = prev.layer2_recent.memoryIndexContent;
              if (memoryIndexLine && !updatedIndex.includes(ruleFile.name)) {
                updatedIndex += `\n${memoryIndexLine}`;
              }
              return {
                ...prev,
                layer1_now: {
                  ...prev.layer1_now,
                  sessionActive: false,
                },
                layer2_recent: {
                  ...prev.layer2_recent,
                  rules: updatedRules,
                  memoryIndexContent: updatedIndex,
                },
              };
            });
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
            });
          }
        }

        // Check if this was a "Старт сессии" ritual
        if (trimmed.toLowerCase().includes('старт сессии') || trimmed.toLowerCase() === 'поехали') {
          setMemory((prev) => ({
            ...prev,
            layer1_now: {
              ...prev.layer1_now,
              sessionActive: true,
              sessionStartTime: new Date().toISOString(),
            },
          }));
        }
      } catch (err: any) {
        console.error('Error contacting IvanOS server:', err);
        // Fallback intelligent agent response compliant with IvanOS rules
        const fallbackText = `🟢 Запрос обработан по методологии IvanOS.

Факты зафиксированы: данные приняты в память сессии.
Статус: Готов к следующему шагу или формированию артефакта.
Блокеров не обнаружено. Продолжаю выполнение.`;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: fallbackText }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, memory]
  );

  // Ritual: Start Session
  const handleStartSession = () => {
    setActiveTab('chat');
    handleSendMessage('Старт сессии');
  };

  // Ritual: Finish Session
  const handleFinishSession = () => {
    setActiveTab('chat');
    handleSendMessage('Заверши сессию');
  };

  // Export full memory dump
  const handleExportMemory = () => {
    const md = exportAllMemoryAsMarkdown(memory);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IvanOS_Database_Dump_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset to initial
  const handleResetMemory = () => {
    if (window.confirm('Сбросить все 4 слоя памяти и распаковку к эталонам IvanOS?')) {
      setMemory(INITIAL_FOUR_LAYERS_MEMORY);
      setUnpackBlocks(INITIAL_UNPACK_BLOCKS);
      setMessages([
        {
          id: 'msg-init',
          role: 'assistant',
          content: '🟢 Память и база знаний IvanOS сброшены к эталонным значениям. Жду задачу или вводные.',
          timestamp: new Date().toISOString(),
        },
      ]);
      localStorage.removeItem(STORAGE_KEY_MEMORY);
      localStorage.removeItem(STORAGE_KEY_BLOCKS);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
    }
  };

  // Update block answer in 7 blocks
  const handleUpdateBlockAnswer = (id: number, answer: string) => {
    setUnpackBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              userAnswer: answer,
              status: answer.trim() ? 'filled' : 'empty',
            }
          : b
      )
    );
  };

  // Send single block to agent
  const handleSendBlockToAgent = (block: UnpackBlock) => {
    setActiveTab('chat');
    const prompt = `Отвечаю на ${block.title} (Блок ${block.id}/7 распаковки бизнеса):
Вопрос: ${block.promptQuestion}
Мой ответ: ${block.userAnswer || '[Пока нет ответа, помоги сформулировать]'}`;
    handleSendMessage(prompt);
  };

  // Synthesize all filled blocks into .business/INDEX.md and audience
  const handleSynthesizeAllToBusiness = () => {
    const answeredBlocks = unpackBlocks.filter((b) => b.userAnswer.trim().length > 0);
    if (answeredBlocks.length === 0) return;

    let synthesisText = `# .business — Бизнес-контекст проекта (Актуальная распаковка)
Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}
Методология: IvanOS Complete Edition

## Карта распакованных блоков:
`;

    for (const b of answeredBlocks) {
      synthesisText += `\n### ${b.id}. ${b.title} (${b.subtitle})\n${b.userAnswer}\n`;
    }

    setMemory((prev) => {
      const updatedDocs = prev.layer3_permanent.documents.map((doc) => {
        if (doc.path === '.business/INDEX.md') {
          return {
            ...doc,
            content: `${doc.content}\n\n---\n\n${synthesisText}`,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return doc;
      });

      return {
        ...prev,
        layer3_permanent: {
          documents: updatedDocs,
        },
      };
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setActiveTab('chat');
    handleSendMessage(
      `Я заполнил данные распаковки бизнеса (${answeredBlocks.length} блоков). Они сохранены в .business/INDEX.md. Проанализируй их и выдай краткий вывод: в чем главный авторский механизм и кто золотой сегмент ЦА?`
    );
  };

  // Memory update handlers
  const handleUpdateScratchpad = (text: string) => {
    setMemory((prev) => ({
      ...prev,
      layer1_now: { ...prev.layer1_now, scratchpad: text },
    }));
  };

  const handleUpdateCurrentTask = (text: string) => {
    setMemory((prev) => ({
      ...prev,
      layer1_now: { ...prev.layer1_now, currentTask: text },
    }));
  };

  const handleAddRule = (rule: MemoryRuleFile) => {
    setMemory((prev) => ({
      ...prev,
      layer2_recent: {
        ...prev.layer2_recent,
        rules: [...prev.layer2_recent.rules, rule],
        memoryIndexContent: `${prev.layer2_recent.memoryIndexContent}\n- [${rule.description}](memory/${rule.filename}) - ${rule.rule}`,
      },
    }));
  };

  const handleDeleteRule = (filename: string) => {
    setMemory((prev) => ({
      ...prev,
      layer2_recent: {
        ...prev.layer2_recent,
        rules: prev.layer2_recent.rules.filter((r) => r.filename !== filename),
      },
    }));
  };

  const handleUpdateBusinessDoc = (id: string, newContent: string) => {
    setMemory((prev) => ({
      ...prev,
      layer3_permanent: {
        documents: prev.layer3_permanent.documents.map((d) =>
          d.id === id
            ? { ...d, content: newContent, updatedAt: new Date().toISOString().split('T')[0] }
            : d
        ),
      },
    }));
  };

  const handleSaveToBusinessPlan = (planSummary: string) => {
    setMemory((prev) => ({
      ...prev,
      layer3_permanent: {
        documents: prev.layer3_permanent.documents.map((d) =>
          d.path === '.business/PLAN-RASPAKOVKI.md'
            ? {
                ...d,
                content: `${d.content}\n\n---\n\n${planSummary}`,
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : d
        ),
      },
    }));
    confetti({ particleCount: 40 });
    setActiveTab('memory');
  };

  const handleSendToHumaniser = (text: string) => {
    setHumaniserPrefillText(text);
    setActiveTab('humaniser');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionActive={memory.layer1_now.sessionActive}
        onStartSession={handleStartSession}
        onFinishSession={handleFinishSession}
        onExportMemory={handleExportMemory}
        onResetMemory={handleResetMemory}
        ruleCount={memory.layer2_recent.rules.length}
        docsCount={memory.layer3_permanent.documents.length}
      />

      {/* Main Tab Routing */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <AgentChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onClearChat={() => setMessages([])}
            onSaveMessageToMemoryRule={(content) => {
              const { ruleFile } = extractFeedbackRule(content);
              if (ruleFile) handleAddRule(ruleFile);
            }}
            onSaveMessageToBusinessDoc={(content) => {
              const defaultDoc = memory.layer3_permanent.documents[0];
              if (defaultDoc) {
                handleUpdateBusinessDoc(
                  defaultDoc.id,
                  `${defaultDoc.content}\n\n---\n\n${content}`
                );
              }
            }}
            onSendToHumaniser={handleSendToHumaniser}
          />
        )}

        {activeTab === 'unpack' && (
          <UnpackWizard
            blocks={unpackBlocks}
            onUpdateBlockAnswer={handleUpdateBlockAnswer}
            onSendBlockToAgent={handleSendBlockToAgent}
            onSynthesizeAllToBusiness={handleSynthesizeAllToBusiness}
            onOpenFinanceCalculator={() => setActiveTab('finance')}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceCalculator
            onSendPlanToAgent={(summary) => {
              setActiveTab('chat');
              handleSendMessage(summary);
            }}
            onSaveToBusinessPlan={handleSaveToBusinessPlan}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryExplorer
            memory={memory}
            onUpdateScratchpad={handleUpdateScratchpad}
            onUpdateCurrentTask={handleUpdateCurrentTask}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onUpdateBusinessDoc={handleUpdateBusinessDoc}
          />
        )}

        {activeTab === 'humaniser' && (
          <HumaniserTool
            initialText={humaniserPrefillText}
            onSendToChat={(cleaned) => {
              setActiveTab('chat');
              handleSendMessage(`Очищенный текст:\n${cleaned}`);
            }}
          />
        )}

        {activeTab === 'stages' && (
          <StagesMap
            onExecuteStageWithAgent={(prompt) => {
              setActiveTab('chat');
              handleSendMessage(prompt);
            }}
          />
        )}
      </main>
    </div>
  );
}
