import React, { useState } from 'react';
import {
  Calendar,
  Film,
  Send,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  MessageSquare,
  Sparkles,
  Bot,
  Layers,
  Smartphone,
  Share2,
  CheckCircle2,
  AlertCircle,
  Hash,
  Tv,
  Code2,
  ListTodo,
  Globe,
  ChevronRight,
  ChevronLeft,
  Shield,
  ShieldAlert,
  Clock,
  Lock,
  Video,
  Key,
  FileText,
} from 'lucide-react';
import {
  ContentPlanItem,
  ReelProject,
  ReelScene,
  MultiPostItem,
  HuntLevel,
  YouTubeProject,
  YouTubeSlide,
  VideoTemplate,
  AntiBanStatus,
} from '../types/ivanos.ts';
import {
  REEL_FORMATS,
  INITIAL_CONTENT_PLAN,
  INITIAL_REEL_PROJECT,
  INITIAL_MULTIPOST,
  WEBSITE_TO_PDF_TOPICS,
  INITIAL_YOUTUBE_PROJECT,
  VIDEO_TEMPLATES,
  fetchAntiBanStatus,
  distributeToTelegram,
  distributeToVK,
  distributeToDzen,
  distributeToInstagram,
  sendTelegramMessage,
  sendUniversalWebhook,
} from '../data/contentFactoryData.ts';
import {
  CORE_PAIN_PRESETS,
  PainPresetId,
  buildEditorialMultipost,
  auditEditorialCompliance,
  enforceChiefEditorFormatting,
} from '../utils/contentGenerator.ts';
import { ApiSettingsTab } from './ApiSettingsTab.tsx';

interface ContentFactoryProps {
  onSendToChat: (prompt: string) => void;
  onSendToHumaniser?: (text: string) => void;
}

const HUNT_STAGES: { level: HuntLevel; label: string; color: string }[] = [
  { level: 0, label: '0: Не знаю о проблеме', color: 'border-zinc-700 text-zinc-400 bg-zinc-900' },
  { level: 1, label: '1: Осознал боль', color: 'border-amber-600/40 text-amber-400 bg-amber-950/20' },
  { level: 2, label: '2: Ищу решения', color: 'border-blue-600/40 text-blue-400 bg-blue-950/20' },
  { level: 3, label: '3: Выбираю продукт', color: 'border-purple-600/40 text-purple-400 bg-purple-950/20' },
  { level: 4, label: '4: Готов купить', color: 'border-emerald-600/40 text-emerald-400 bg-emerald-950/20' },
];

export const ContentFactory: React.FC<ContentFactoryProps> = ({
  onSendToChat,
  onSendToHumaniser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'plan' | 'youtube' | 'reel' | 'multipost' | 'api'>('plan');
  const [activePainPresetId, setActivePainPresetId] = useState<PainPresetId>('ctrl_p_broken_layout');

  // YouTube Slides Project state
  const [youtubeProject, setYoutubeProject] = useState<YouTubeProject>(() => {
    try {
      const saved = localStorage.getItem('madnike_youtube_project');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_YOUTUBE_PROJECT;
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [ytPlaybackTime, setYtPlaybackTime] = useState(0);

  // Plan state
  const [contentPlan, setContentPlan] = useState<ContentPlanItem[]>(() => {
    try {
      const saved = localStorage.getItem('madnike_content_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CONTENT_PLAN;
  });

  const [filterHunt, setFilterHunt] = useState<HuntLevel | 'all'>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | 'tg' | 'vk' | 'dzen' | 'ig'>('all');

  // Reel Project state
  const [reelProject, setReelProject] = useState<ReelProject>(() => {
    try {
      const saved = localStorage.getItem('madnike_reel_project');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REEL_PROJECT;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);

  // Multipost state
  const [multipost, setMultipost] = useState<MultiPostItem>(() => {
    try {
      const saved = localStorage.getItem('madnike_multipost_item');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MULTIPOST;
  });

  // Telegram credentials
  const [botToken, setBotToken] = useState(() => localStorage.getItem('madnike_tg_bot_token') || '');
  const [chatId, setChatId] = useState(() => localStorage.getItem('madnike_tg_chat_id') || '');
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('madnike_webhook_url') || '');
  const [webhookStatus, setWebhookStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [tgSending, setTgSending] = useState(false);
  const [tgStatus, setTgStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Distribution & Anti-Ban state
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate>(VIDEO_TEMPLATES[0]);
  const [activeChannelTab, setActiveChannelTab] = useState<'all' | 'telegram' | 'vk' | 'dzen' | 'instagram'>('all');
  const [tgVideoUrl, setTgVideoUrl] = useState('');

  // VK state
  const [vkAccessToken, setVkAccessToken] = useState(() => localStorage.getItem('madnike_vk_token') || '');
  const [vkOwnerId, setVkOwnerId] = useState(() => localStorage.getItem('madnike_vk_owner_id') || '');
  const [vkSending, setVkSending] = useState(false);
  const [vkStatus, setVkStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Dzen state
  const [dzenSending, setDzenSending] = useState(false);
  const [dzenStatus, setDzenStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Instagram Reels state
  const [igUserId, setIgUserId] = useState(() => localStorage.getItem('madnike_ig_user_id') || '');
  const [igAccessToken, setIgAccessToken] = useState(() => localStorage.getItem('madnike_ig_token') || '');
  const [igProxy, setIgProxy] = useState(() => localStorage.getItem('madnike_ig_proxy') || '');
  const [igSending, setIgSending] = useState(false);
  const [igStatus, setIgStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Text overlay for Reels on top of video template
  const [overlayHook, setOverlayHook] = useState(VIDEO_TEMPLATES[0].recommendedHook);
  const [overlayPain, setOverlayPain] = useState(VIDEO_TEMPLATES[0].defaultPain);
  const [overlayCta, setOverlayCta] = useState(VIDEO_TEMPLATES[0].defaultCta);

  // Anti-Ban Status
  const [antiBan, setAntiBan] = useState<AntiBanStatus>({
    dailyPostsCount: 2,
    dailyLimit: 5,
    remainingPostsToday: 3,
    lastPostTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    elapsedMinutesSinceLastPost: 45,
    randomizedIntervalSetting: '30-90 мин',
    isCooldownActive: false,
    isLimitReached: false,
    isSafeToPost: true,
    recommendedNextPostInMinutes: 0,
    history: [
      {
        id: 'hist-1',
        channel: 'telegram',
        title: 'Почему встроенная печать браузера ломает верстку',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        status: 'success',
      },
      {
        id: 'hist-2',
        channel: 'vk',
        title: 'Студия просит 400 000 ₽ за сайт, который сеньор напишет за 12 дней',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'success',
      },
    ],
  });

  const loadAntiBan = async () => {
    try {
      const data = await fetchAntiBanStatus();
      if (data) setAntiBan(data);
    } catch {
      // Keep state
    }
  };

  React.useEffect(() => {
    loadAntiBan();
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('madnike_multipost_item', JSON.stringify(multipost));
    } catch (e) {
      console.error(e);
    }
  }, [multipost]);

  const handleApplyPainPreset = (presetId: PainPresetId) => {
    setActivePainPresetId(presetId);
    const generated = buildEditorialMultipost(presetId);
    setMultipost(generated);
    const preset = CORE_PAIN_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setOverlayHook(preset.reelsOverlay.hook);
      setOverlayPain(preset.reelsOverlay.pain);
      setOverlayCta(preset.reelsOverlay.cta);
    }
  };

  const handleEnforceChiefEditorOnMultipost = () => {
    setMultipost((prev) => ({
      ...prev,
      topic: enforceChiefEditorFormatting(prev.topic),
      versions: {
        telegram: enforceChiefEditorFormatting(prev.versions.telegram),
        vk: enforceChiefEditorFormatting(prev.versions.vk),
        dzen: enforceChiefEditorFormatting(prev.versions.dzen),
        instagram: enforceChiefEditorFormatting(prev.versions.instagram),
      },
    }));
  };

  const editorialAudit = auditEditorialCompliance(
    `${multipost.versions.telegram}\n\n${multipost.versions.vk}\n\n${multipost.versions.dzen}\n\n${multipost.versions.instagram}`
  );

  // Playback loop for 9:16 reel simulation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          const next = prev + 0.5;
          if (next >= reelProject.targetDurationSec) {
            setIsPlaying(false);
            setCurrentSceneIndex(0);
            return 0;
          }
          // calculate active scene
          let elapsed = 0;
          for (let i = 0; i < reelProject.scenes.length; i++) {
            elapsed += reelProject.scenes[i].durationSec;
            if (next <= elapsed) {
              setCurrentSceneIndex(i);
              break;
            }
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, reelProject]);

  // Playback loop for YouTube slides simulation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    const totalDuration = youtubeProject.slides.reduce((acc, s) => acc + s.durationSec, 0) || 60;
    if (isYtPlaying) {
      interval = setInterval(() => {
        setYtPlaybackTime((prev) => {
          const next = prev + 0.5;
          if (next >= totalDuration) {
            setIsYtPlaying(false);
            setCurrentSlideIndex(0);
            return 0;
          }
          let elapsed = 0;
          for (let i = 0; i < youtubeProject.slides.length; i++) {
            elapsed += youtubeProject.slides[i].durationSec;
            if (next <= elapsed) {
              setCurrentSlideIndex(i);
              break;
            }
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isYtPlaying, youtubeProject]);

  React.useEffect(() => {
    try {
      localStorage.setItem('madnike_youtube_project', JSON.stringify(youtubeProject));
    } catch (e) {
      console.error(e);
    }
  }, [youtubeProject]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveTgCredentials = () => {
    localStorage.setItem('madnike_tg_bot_token', botToken);
    localStorage.setItem('madnike_tg_chat_id', chatId);
    setTgStatus({ ok: true, msg: 'Настройки Telegram сохранены' });
    setTimeout(() => setTgStatus(null), 3000);
  };

  const handleSendTelegram = async () => {
    setTgSending(true);
    setTgStatus(null);
    try {
      await distributeToTelegram({
        botToken,
        chatId,
        text: multipost.versions.telegram,
        videoUrl: tgVideoUrl.trim() || undefined,
      });
      setTgStatus({ ok: true, msg: tgVideoUrl.trim() ? 'Видео-Reel успешно отправлен в Telegram!' : 'Пост успешно отправлен в Telegram!' });
      setMultipost((prev) => ({
        ...prev,
        status: { ...prev.status, telegram: 'sent' },
      }));
      await loadAntiBan();
    } catch (err: any) {
      setTgStatus({ ok: false, msg: err.message || 'Ошибка отправки в Telegram' });
    } finally {
      setTgSending(false);
    }
  };

  const handleSendVK = async () => {
    setVkSending(true);
    setVkStatus(null);
    try {
      await distributeToVK({
        accessToken: vkAccessToken,
        ownerId: vkOwnerId,
        message: multipost.versions.vk,
      });
      localStorage.setItem('madnike_vk_token', vkAccessToken);
      localStorage.setItem('madnike_vk_owner_id', vkOwnerId);
      setVkStatus({ ok: true, msg: 'Пост успешно опубликован на стене ВКонтакте!' });
      setMultipost((prev) => ({
        ...prev,
        status: { ...prev.status, vk: 'copied' },
      }));
      await loadAntiBan();
    } catch (err: any) {
      setVkStatus({ ok: false, msg: err.message || 'Ошибка публикации во ВКонтакте' });
    } finally {
      setVkSending(false);
    }
  };

  const handleSendDzen = async () => {
    setDzenSending(true);
    setDzenStatus(null);
    try {
      await distributeToDzen({
        title: multipost.topic,
        text: multipost.versions.dzen,
      });
      setDzenStatus({ ok: true, msg: 'Статья экспортирована в Яндекс Дзен и включена в RSS-фид!' });
      setMultipost((prev) => ({
        ...prev,
        status: { ...prev.status, dzen: 'copied' },
      }));
      await loadAntiBan();
    } catch (err: any) {
      setDzenStatus({ ok: false, msg: err.message || 'Ошибка отправки в Яндекс Дзен' });
    } finally {
      setDzenSending(false);
    }
  };

  const handleSendInstagram = async () => {
    setIgSending(true);
    setIgStatus(null);
    try {
      await distributeToInstagram({
        igUserId,
        accessToken: igAccessToken,
        caption: multipost.versions.instagram,
        templateId: selectedTemplate.id,
        proxyUrl: igProxy.trim() || undefined,
        hookText: overlayHook,
        painText: overlayPain,
        ctaText: overlayCta,
      });
      localStorage.setItem('madnike_ig_user_id', igUserId);
      localStorage.setItem('madnike_ig_token', igAccessToken);
      localStorage.setItem('madnike_ig_proxy', igProxy);
      setIgStatus({ ok: true, msg: `Reels на базе шаблона «${selectedTemplate.name}» успешно поставлен в очередь Instagram Graph API!` });
      setMultipost((prev) => ({
        ...prev,
        status: { ...prev.status, instagram: 'copied' },
      }));
      await loadAntiBan();
    } catch (err: any) {
      setIgStatus({ ok: false, msg: err.message || 'Ошибка публикации Reels в Instagram' });
    } finally {
      setIgSending(false);
    }
  };

  const handleSendWebhook = async () => {
    setWebhookStatus(null);
    try {
      await sendUniversalWebhook(webhookUrl, {
        topic: multipost.topic,
        versions: multipost.versions,
      });
      localStorage.setItem('madnike_webhook_url', webhookUrl);
      setWebhookStatus({ ok: true, msg: 'Вебхук успешно вызван (n8n/Make)' });
    } catch (err: any) {
      setWebhookStatus({ ok: false, msg: err.message || 'Ошибка вебхука' });
    }
  };

  const currentScene = reelProject.scenes[currentSceneIndex] || reelProject.scenes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Sub-navigation */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Модуль Контент-завода
            </span>
            <span className="text-xs text-zinc-500 font-mono">MADNIKE OS Core</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Контент-завод Ice Studio
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Генерация контент-плана по лестнице Ханта, раскадровка вертикальных видео (9:16) и мультипостинг в ТГ, ВК, Дзен и Нельзяграм.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 flex-wrap gap-1">
          <button
            onClick={() => setActiveSubTab('plan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'plan'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Сетка контента (Хант)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('youtube')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'youtube'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-red-400" />
            <span>YouTube-слайды & Темник</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800/40">
              16:9
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('reel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'reel'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Рилс-студия 9:16</span>
          </button>
          <button
            onClick={() => setActiveSubTab('multipost')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'multipost'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Мультипостинг & Рассылка</span>
          </button>
          <button
            onClick={() => setActiveSubTab('api')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'api'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Шлюзы и API</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CONTENT PLAN MATRIX */}
      {activeSubTab === 'plan' && (
        <div className="space-y-4">
          {/* Filters & Actions */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400 font-mono">Фильтр по Ханту:</span>
              <button
                onClick={() => setFilterHunt('all')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  filterHunt === 'all'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Все уровни
              </button>
              {HUNT_STAGES.map((s) => (
                <button
                  key={s.level}
                  onClick={() => setFilterHunt(s.level)}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                    filterHunt === s.level
                      ? 'border-amber-400 text-amber-300 bg-amber-950/40'
                      : s.color
                  }`}
                >
                  Уровень {s.level}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onSendToChat(
                    'Сгенерируй детальный контент-план на 7 дней по методологии MADNIKE OS: 5 уровней Ханта, форматы рилс, постов и каруселей для Ice Studio (Никита Меньшаев).'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-sm"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Запросить у Агента</span>
              </button>
            </div>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentPlan
              .filter((item) => (filterHunt === 'all' ? true : item.huntLevel === filterHunt))
              .map((item) => {
                const stage = HUNT_STAGES.find((s) => s.level === item.huntLevel);
                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-amber-400 font-mono">
                          День {item.dayIndex}: {item.dayName}
                        </span>
                        <span className="text-zinc-500 font-mono">{item.dateStr}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            stage?.color || 'text-zinc-400'
                          }`}
                        >
                          {item.huntStageName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {item.formatTitle}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors mb-2">
                        {item.hook}
                      </h3>

                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {item.coreIdea}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Слово: <strong className="text-amber-400">{item.codeWord}</strong></span>
                        <div className="flex items-center gap-1 font-mono uppercase text-[10px]">
                          {item.channels.map((ch) => (
                            <span key={ch} className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            setActiveSubTab('reel');
                            setReelProject((prev) => ({
                              ...prev,
                              title: item.hook,
                              hookHeadline: item.hook,
                              ctaCodeWord: item.codeWord,
                            }));
                          }}
                          className="flex-1 py-1 rounded text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors text-center"
                        >
                          В Рилс-студию
                        </button>
                        <button
                          onClick={() => {
                            onSendToChat(
                              `Напиши полный боевой пост для темы: "${item.hook}". Формат: ${item.formatTitle}. Уровень Ханта: ${item.huntStageName}. Кодовое слово: ${item.codeWord}.`
                            );
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                        >
                          Написать пост
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB: YOUTUBE SLIDES & THEMES (16:9 FACELESS VIDEO) */}
      {activeSubTab === 'youtube' && (
        <div className="space-y-6">
          {/* Action Checklist: 3 Next Actions */}
          <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-900/40 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-red-400" />
                Первые 3 действия на ближайшие дни (Запуск трафика)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-amber-400">1. Сформировать темник</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  5 тем по болям пользователей Website to PDF собраны ниже по лестнице Ханта. Выбирайте тему в 1 клик.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-red-400">2. Собрать ролик-слайд</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/40">Активно</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Интерактивный плеер технических слайдов (16:9) с кодом, схемой работы и озвучкой для ElevenLabs.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-sky-400">3. Запустить дистрибуцию</span>
                  <span className="text-[10px] text-zinc-500">В очереди</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Публикация в Telegram и YouTube с вшитой ссылкой на многоязычный лендинг расширения.
                </p>
              </div>
            </div>
          </div>

          {/* Website to PDF: 5-Topic Themes Catalog */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-red-400" />
                  Темник для Website to PDF (5 тем по Лестнице Ханта)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Темы ориентированы на боли пользователей: поломка верстки, 54 языка, удаление мусора и оплата через Prodamus.
                </p>
              </div>
              <button
                onClick={() =>
                  onSendToChat(
                    'Составь список из 5 тем для постов и YouTube-слайдов по болям пользователей, которым нужно сохранять сайты в PDF. Распиши хуки и призывы к действию.'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>Запросить в чате</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {WEBSITE_TO_PDF_TOPICS.map((top) => (
                <div
                  key={top.id}
                  className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded font-mono bg-red-950/60 text-red-300 border border-red-800/40 text-[10px]">
                        {top.huntName}
                      </span>
                      <span className="font-mono text-zinc-500 text-[10px]">Код: {top.ctaCode}</span>
                    </div>
                    <h4 className="font-semibold text-xs text-zinc-200 leading-snug">
                      {top.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      <strong className="text-zinc-300">Боль:</strong> {top.pain}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 flex items-center gap-1.5 mt-3">
                    <button
                      onClick={() => {
                        setYoutubeProject((prev) => ({
                          ...prev,
                          title: top.title,
                          hook: top.hook,
                        }));
                        setCurrentSlideIndex(0);
                        setYtPlaybackTime(0);
                      }}
                      className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors text-center"
                    >
                      Загрузить в слайды
                    </button>
                    <button
                      onClick={() => {
                        onSendToChat(
                          `Напиши полный боевой пост и тезисы видео-слайдов для темы: "${top.title}". Боль: ${top.pain}. Кодовое слово: ${top.ctaCode}. Ссылка на лендинг: https://ice-studio.ru/website-to-pdf.`
                        );
                      }}
                      className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition-colors"
                    >
                      Пост в чат
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 16:9 Faceless Video Canvas & Player */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: 16:9 Technical Slide Canvas */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-red-400" />
                  Превью 16:9 видео-слайда (YouTube / Faceless)
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {ytPlaybackTime.toFixed(1)}s / {youtubeProject.slides.reduce((a, s) => a + s.durationSec, 0)}s
                </span>
              </div>

              {/* 16:9 Canvas Mockup */}
              <div className="w-full aspect-video bg-zinc-950 rounded-2xl border-2 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col justify-between p-6 select-none">
                {/* Header Window Bar */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <span className="text-xs font-mono text-zinc-400 ml-2">
                      Website to PDF • Tech Explainer
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-amber-400">
                      {youtubeProject.slides[currentSlideIndex]?.interfaceBadge || 'CHROME EXTENSION'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800/50 text-[10px] font-mono text-red-300">
                      Слайд {currentSlideIndex + 1}/{youtubeProject.slides.length}
                    </span>
                  </div>
                </div>

                {/* Center Content: Slide Title & Visuals / Code */}
                <div className="my-auto space-y-3">
                  <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono uppercase">
                    {youtubeProject.slides[currentSlideIndex]?.timeRange} • {youtubeProject.slides[currentSlideIndex]?.type}
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                    {youtubeProject.slides[currentSlideIndex]?.title}
                  </h3>

                  {/* Bullet Points */}
                  <div className="space-y-1.5 pt-1">
                    {youtubeProject.slides[currentSlideIndex]?.bulletPoints.map((bp, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Code Snippet Box if exists */}
                  {youtubeProject.slides[currentSlideIndex]?.codeSnippet && (
                    <div className="mt-2 p-3 rounded-lg bg-black/90 border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                      <pre className="leading-snug">{youtubeProject.slides[currentSlideIndex]?.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* Bottom Voiceover script overlay */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-[11px] max-w-xl truncate">
                    🎙️ <strong className="text-zinc-200">Озвучка:</strong> «{youtubeProject.slides[currentSlideIndex]?.voiceoverText}»
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline">
                    ice-studio.ru
                  </span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsYtPlaying(!isYtPlaying)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    {isYtPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isYtPlaying ? 'Пауза' : 'Смотреть показ'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsYtPlaying(false);
                      setYtPlaybackTime(0);
                      setCurrentSlideIndex(0);
                    }}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title="Сбросить"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentSlideIndex === 0}
                    onClick={() => {
                      setCurrentSlideIndex((p) => Math.max(0, p - 1));
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 transition-colors"
                    title="Предыдущий слайд"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono text-zinc-400 px-2">
                    {currentSlideIndex + 1} / {youtubeProject.slides.length}
                  </span>

                  <button
                    disabled={currentSlideIndex === youtubeProject.slides.length - 1}
                    onClick={() => {
                      setCurrentSlideIndex((p) => Math.min(youtubeProject.slides.length - 1, p + 1));
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 transition-colors"
                    title="Следующий слайд"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Slide Timeline & Voiceover Script */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase">
                  Слайды ролика ({youtubeProject.slides.length}):
                </span>
                <button
                  onClick={() => {
                    const fullText = youtubeProject.slides
                      .map(
                        (s) =>
                          `СЛАЙД ${s.slideNumber} [${s.timeRange}] (${s.title})\nТЕЗИСЫ:\n${s.bulletPoints.map((b) => `- ${b}`).join('\n')}\nОЗВУЧКА: «${s.voiceoverText}»\nТЕКСТ НА ЭКРАНЕ: ${s.onScreenText}`
                      )
                      .join('\n\n---\n\n');
                    handleCopy('all-yt-slides', fullText);
                  }}
                  className="text-xs text-red-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Копировать все слайды</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {youtubeProject.slides.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setCurrentSlideIndex(idx);
                      let elapsed = 0;
                      for (let i = 0; i < idx; i++) elapsed += youtubeProject.slides[i].durationSec;
                      setYtPlaybackTime(elapsed);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      currentSlideIndex === idx
                        ? 'border-red-500 bg-red-950/20'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-red-400">
                          #{s.slideNumber} • {s.timeRange}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400">
                          {s.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {s.durationSec} сек
                      </span>
                    </div>

                    <h5 className="font-semibold text-xs text-zinc-200 mb-1">
                      {s.title}
                    </h5>

                    <p className="text-[11px] text-zinc-400 line-clamp-2">
                      🎙️ {s.voiceoverText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEO Description & Multi-language Landing Distribution Box */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  SEO-описание ролика и ссылка на лендинг (YouTube)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Готовый блок для вставки под видео со вшитыми таймкодами, поисковыми тегами и ссылкой на 54 языка.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy('yt-seo', youtubeProject.seoDescription)}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'yt-seo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Копировать описание</span>
                </button>
              </div>
            </div>

            <textarea
              value={youtubeProject.seoDescription}
              onChange={(e) =>
                setYoutubeProject({
                  ...youtubeProject,
                  seoDescription: e.target.value,
                })
              }
              rows={8}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-red-500/50 leading-relaxed"
            />

            {/* Tags preview */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono text-zinc-500 text-[11px]">Теги:</span>
              {youtubeProject.tags.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REEL STUDIO (9:16 SIMULATOR & TIMELINE) */}
      {activeSubTab === 'reel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 9:16 Phone Mockup Player */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-[310px] h-[550px] bg-zinc-950 rounded-[36px] border-4 border-zinc-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 select-none">
              {/* Dynamic camera / speaker background simulation */}
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black z-0" />

              {/* Simulated camera grid & format tag */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2">
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur border border-zinc-800 text-amber-400">
                  {reelProject.formatType.split(' ')[0]}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur font-bold text-white">
                  {playbackTime.toFixed(1)}s / {reelProject.targetDurationSec}s
                </span>
              </div>

              {/* Center: Live Kinetic Subtitles (Submagic style) */}
              <div className="relative z-10 my-auto text-center px-2 py-4">
                <div className="inline-block px-3 py-1 rounded bg-black/80 backdrop-blur border border-amber-500/30 mb-3 shadow-md">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                    Сцена {currentScene.id} • {currentScene.timeRange}
                  </span>
                </div>

                <div className="text-xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight">
                  {currentScene.subtitles}
                </div>

                <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                  {currentScene.highlightWords.map((hw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs font-black uppercase rounded bg-amber-500 text-zinc-950 transform rotate-[-1deg] shadow-lg"
                    >
                      {hw}
                    </span>
                  ))}
                </div>

                {/* SFX Alert */}
                {currentScene.sfx && (
                  <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-700/50">
                    <span>SFX: {currentScene.sfx}</span>
                  </div>
                )}
              </div>

              {/* Bottom: Voiceover & CTA Code Button */}
              <div className="relative z-10 space-y-2 pb-2">
                <div className="p-2.5 rounded-xl bg-black/70 backdrop-blur border border-zinc-800 text-xs text-zinc-300 leading-snug">
                  <p className="line-clamp-2">🎙️ «{currentScene.voiceoverText}»</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Кодовое слово: <strong className="text-amber-400">«{reelProject.ctaCodeWord}»</strong>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Ice Studio</span>
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Пауза' : 'Смотреть симуляцию'}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setPlaybackTime(0);
                  setCurrentSceneIndex(0);
                }}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Сброс"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Scene-by-Scene Timeline & Voiceover Generator */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  Параметры Рилса: {reelProject.title}
                </h3>
                <span className="text-xs font-mono text-zinc-400">
                  {reelProject.targetDurationSec} секунд
                </span>
              </div>

              {/* Format Select */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {REEL_FORMATS.slice(0, 4).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setReelProject({ ...reelProject, formatType: f.name })}
                    className={`p-2 rounded-lg text-left text-xs border transition-all ${
                      reelProject.formatType.includes(f.id)
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-bold font-mono">{f.id}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{f.desc}</div>
                  </button>
                ))}
              </div>

              {/* Audio Prompt for FL Studio / ElevenLabs */}
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 mb-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 font-mono text-[11px] block">Звуковая дорожка (FL Studio / Саунд-дизайн):</span>
                  <span className="text-zinc-200 font-medium">{reelProject.audioPrompt}</span>
                </div>
                <button
                  onClick={() => handleCopy('audio', reelProject.audioPrompt)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono flex items-center gap-1"
                >
                  {copiedKey === 'audio' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Копировать</span>
                </button>
              </div>
            </div>

            {/* Scenes Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase">
                  Раскадровка сценария ({reelProject.scenes.length} сцены):
                </span>
                <button
                  onClick={() => {
                    const fullText = reelProject.scenes
                      .map(
                        (s) =>
                          `[${s.timeRange}] (${s.visualType})\nВИЗУАЛ: ${s.visualDesc}\nГОЛОС: ${s.voiceoverText}\nТИТРЫ: ${s.subtitles}\nSFX: ${s.sfx}`
                      )
                      .join('\n\n');
                    handleCopy('all-scenes', fullText);
                  }}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Скопировать полный сценарий</span>
                </button>
              </div>

              {reelProject.scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => {
                    setCurrentSceneIndex(idx);
                    let elapsed = 0;
                    for (let i = 0; i < idx; i++) elapsed += reelProject.scenes[i].durationSec;
                    setPlaybackTime(elapsed);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    currentSceneIndex === idx
                      ? 'border-amber-500 bg-amber-500/5'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">
                        #{scene.id} • {scene.timeRange}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                        {scene.visualType}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-400">
                      SFX: {scene.sfx}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-2">
                    <strong className="text-zinc-300">Визуал:</strong> {scene.visualDesc}
                  </p>

                  <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200">
                    <span className="text-zinc-500 font-mono text-[10px] block">Озвучка для ElevenLabs:</span>
                    {scene.voiceoverText}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUTO-POSTING & DISTRIBUTION MODULE (Anti-Ban Protected) */}
      {activeSubTab === 'multipost' && (
        <div className="space-y-6">
          {/* 0. CHIEF EDITOR CONTENT GENERATOR (4 CORE PAINS) */}
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Главный редактор MADNIKE OS
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      editorialAudit.passed
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                        : 'bg-rose-950/60 text-rose-300 border-rose-700/40'
                    }`}
                  >
                    {editorialAudit.passed
                      ? '5 правил соблюдены: 0 тире, 1-3 предл., CTA ок'
                      : `Требует правки: ${editorialAudit.issues.length} замеч.`}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white mt-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Генератор постов по 4 реальным болям Website to PDF & Ice Studio
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Прагматичный инженерный тон, запрет длинных тире («—» и «–»), короткие абзацы и нативный оффер в конце.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!editorialAudit.passed && (
                  <button
                    type="button"
                    onClick={handleEnforceChiefEditorOnMultipost}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                  >
                    Исправить длинные тире и клише
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onSendToChat(
                      `Сгенерируй серию из 4 постов для Telegram, VK, Дзен и Нельзяграм как главный редактор MADNIKE OS. Обязательно учти 4 боли: Ctrl+P ломает таблицы и делает растр, облачные конвертеры воруют выписки (у нас 100% локально), файлы "print (22).pdf" против авто-H1 и агентства против сеньора за 10-14 дней. Только дефис "-", абзацы 1-3 предложения, нативный CTA.`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Запросить вариант у Агента</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CORE_PAIN_PRESETS.map((preset) => {
                const isSelected = activePainPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPainPreset(preset.id)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40'
                        : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                        <span className="text-amber-400">{preset.badge}</span>
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {preset.codeWord}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-white mb-1">{preset.title}</div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{preset.painSummary}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-emerald-400">
                      Сгенерировать 4 формата + Reel
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. ANTI-BAN SECURITY GUARD BANNER */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-900/40 rounded-xl p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Модуль автопостинга и дистрибуции</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      Anti-Ban Активен
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Автономная публикация по внешним API-шлюзам (Telegram, VK, Дзен, Instagram Reels) с соблюдением лимитов.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-zinc-400">
                  Постов сегодня: <strong className="text-emerald-400">{antiBan.dailyPostsCount}</strong> / {antiBan.dailyLimit}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Пауза: {antiBan.randomizedIntervalSetting}
                </span>
              </div>
            </div>

            {/* Anti-Ban 3 Rules indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-medium text-zinc-200 block">Суточный лимит: 3-5 постов</span>
                    <span className="text-[10px] text-zinc-400">Осталось слотов: {antiBan.remainingPostsToday}</span>
                  </div>
                </div>
                <div className="w-16 bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(antiBan.dailyPostsCount / antiBan.dailyLimit) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-medium text-zinc-200 block">Рандомизированные паузы (30-90 мин)</span>
                  <span className="text-[10px] text-zinc-400">
                    {antiBan.isCooldownActive
                      ? `Осталось ждать: ${antiBan.recommendedNextPostInMinutes} мин`
                      : 'Шлюзы готовы к безопасной отправке'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="font-medium text-zinc-200 block">Запрет бесплатных прокси</span>
                  <span className="text-[10px] text-zinc-400">Строгий фильтр Meta Graph API включен</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. REELS VIDEO TEMPLATES CATALOG & OVERLAY ENGINE */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800/40">
                    /assets/video-templates/
                  </span>
                  <h3 className="font-bold text-sm text-white">База видео-шаблонов для Reels (Ice Studio)</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Агент не рендерит видео с нуля, а берет готовые динамичные технологические шаблоны и накладывает смыслы (Хук, Боль, CTA).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOverlayHook('Студия просит 400 000 ₽ за сайт, который сеньор напишет за 12 дней');
                    setOverlayPain('80% расходов уходит на менеджеров, а разработка затягивается на месяцы');
                    setOverlayCta('Пиши «КОД» в Директ или TG для экспресс-аудита');
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono"
                >
                  Сбросить к эталону
                </button>
              </div>
            </div>

            {/* Template selector cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {VIDEO_TEMPLATES.map((tmpl) => {
                const isSel = selectedTemplate.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setOverlayHook(tmpl.recommendedHook);
                      setOverlayPain(tmpl.defaultPain);
                      setOverlayCta(tmpl.defaultCta);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSel
                        ? 'border-purple-500 bg-purple-950/20 shadow-md ring-1 ring-purple-500/40'
                        : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                          {tmpl.category}
                        </span>
                        {isSel && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>

                      <h4 className="font-bold text-xs text-white mb-1.5">{tmpl.name}</h4>
                      <p className="text-[11px] text-zinc-400 leading-snug mb-3">{tmpl.description}</p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-purple-300">
                      Файл: /assets/video-templates/{tmpl.id}.mp4
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 9:16 Live Template Simulator & Text Overlay Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3">
              {/* 9:16 Mockup */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-[300px] h-[530px] rounded-[32px] border-4 border-zinc-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 select-none bg-black">
                  {/* Dynamic Template Animated Background */}
                  <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
                    {selectedTemplate.id === 'coding-matrix' && (
                      <div className="w-full h-full bg-gradient-to-b from-emerald-950/60 via-black to-zinc-950 p-4 font-mono text-[10px] text-emerald-500/40 leading-tight overflow-hidden">
                        <div>const IceStudio = async () =&gt; &#123;</div>
                        <div className="pl-2">const senior = true;</div>
                        <div className="pl-2">const cleanArchitecture = true;</div>
                        <div className="pl-2">await deploy({`{ sprint: '14-days' }`});</div>
                        <div>&#125;;</div>
                        <div className="mt-4 text-emerald-400/30">
                          // Fast SSR Next.js 15 &bull; No bloat &bull; Supabase &bull; Prodamus
                        </div>
                      </div>
                    )}

                    {selectedTemplate.id === 'tech-minimal-abstract' && (
                      <div className="w-full h-full bg-gradient-to-tr from-amber-950/40 via-zinc-950 to-black p-4 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full border border-amber-500/20 animate-pulse flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full border border-amber-500/30" />
                        </div>
                      </div>
                    )}

                    {selectedTemplate.id === 'cyber-grid-audio' && (
                      <div className="w-full h-full bg-gradient-to-b from-purple-950/50 via-zinc-950 to-black p-4 flex flex-col justify-end">
                        <div className="flex items-end gap-1 h-32 opacity-40">
                          {[30, 60, 45, 90, 75, 40, 85, 95, 65, 50, 70, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-purple-500 rounded-t" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTemplate.id === 'interface-screencast' && (
                      <div className="w-full h-full bg-gradient-to-b from-sky-950/50 via-zinc-950 to-black p-4 flex flex-col justify-center">
                        <div className="p-3 rounded-lg bg-zinc-900/90 border border-sky-500/30 text-sky-300 font-mono text-[10px]">
                          <div>Website to PDF PRO</div>
                          <div className="text-zinc-400 mt-1">&bull; Flexbox preserved</div>
                          <div className="text-zinc-400">&bull; 54 languages active</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Badges */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-zinc-300 pt-1">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-zinc-800 text-purple-300 text-[10px]">
                      {selectedTemplate.name.split(' ')[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur text-zinc-400 text-[10px]">
                      9:16 Reels
                    </span>
                  </div>

                  {/* Overlaid Texts (Hook -> Pain -> CTA) */}
                  <div className="relative z-10 my-auto space-y-3 px-2 text-center">
                    {/* Hook Banner */}
                    <div className="p-3 rounded-xl bg-black/85 backdrop-blur border border-purple-500/40 shadow-xl">
                      <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                        🔥 Главный тезис:
                      </span>
                      <h4 className="text-sm font-black text-white leading-snug">
                        {overlayHook}
                      </h4>
                    </div>

                    {/* Client Pain */}
                    <div className="p-2.5 rounded-lg bg-black/75 backdrop-blur border border-zinc-800 text-xs text-zinc-300">
                      <span className="text-[10px] font-mono uppercase text-rose-400 block mb-0.5">
                        ⚡ Боль клиента:
                      </span>
                      {overlayPain}
                    </div>
                  </div>

                  {/* Bottom CTA Button */}
                  <div className="relative z-10 pb-2 space-y-2">
                    <div className="p-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs text-center shadow-lg">
                      🎯 {overlayCta}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 font-mono">
                      <span>Ice Studio</span>
                      <span>Prodamus • Direct</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Overlay Editor & Instagram Graph API Poster */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <h4 className="font-bold text-xs text-white uppercase font-mono flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Наложение текста поверх видео-шаблона
                  </h4>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      1. Главный тезис / Хук (Крупный заголовок):
                    </label>
                    <input
                      type="text"
                      value={overlayHook}
                      onChange={(e) => setOverlayHook(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      2. Боль клиента / Противоречие:
                    </label>
                    <input
                      type="text"
                      value={overlayPain}
                      onChange={(e) => setOverlayPain(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      3. Призыв к действию (CTA с кодовым словом):
                    </label>
                    <input
                      type="text"
                      value={overlayCta}
                      onChange={(e) => setOverlayCta(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Instagram Graph API Box */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                      <span className="font-bold text-xs text-white uppercase font-mono">
                        Instagram Graph API (Reels Gateway)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                      Anti-Ban Filter
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                        IG User ID:
                      </label>
                      <input
                        type="text"
                        placeholder="17841400000000000"
                        value={igUserId}
                        onChange={(e) => setIgUserId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                        Access Token (Graph API):
                      </label>
                      <input
                        type="password"
                        placeholder="EAAB..."
                        value={igAccessToken}
                        onChange={(e) => setIgAccessToken(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1 flex items-center justify-between">
                      <span>Резидентский прокси (Опционально):</span>
                      <span className="text-rose-400 text-[10px]">Запрет бесплатных прокси!</span>
                    </label>
                    <input
                      type="text"
                      placeholder="http://user:pass@residential-node.proxy:8080"
                      value={igProxy}
                      onChange={(e) => setIgProxy(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-400">
                      Шаблон: <strong className="text-white">{selectedTemplate.name}</strong>
                    </span>

                    <button
                      onClick={handleSendInstagram}
                      disabled={igSending}
                      className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{igSending ? 'Отправка Reels...' : 'Опубликовать Reel через Graph API'}</span>
                    </button>
                  </div>

                  {igStatus && (
                    <div
                      className={`p-2.5 rounded text-xs flex items-center gap-1.5 ${
                        igStatus.ok
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                      }`}
                    >
                      {igStatus.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{igStatus.msg}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. MULTI-CHANNEL DISTRIBUTION GATEWAYS (TG, VK, DZEN) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Channel post texts & previews */}
            <div className="lg:col-span-8 space-y-4">
              {/* Channel filter switcher */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex items-center gap-2 flex-wrap text-xs font-mono">
                <span className="text-zinc-500 mr-1">Шлюз:</span>
                <button
                  onClick={() => setActiveChannelTab('all')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeChannelTab === 'all'
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Все каналы
                </button>
                <button
                  onClick={() => setActiveChannelTab('telegram')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeChannelTab === 'telegram'
                      ? 'bg-sky-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Telegram Bot API
                </button>
                <button
                  onClick={() => setActiveChannelTab('vk')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeChannelTab === 'vk'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  ВКонтакте (wall.post)
                </button>
                <button
                  onClick={() => setActiveChannelTab('dzen')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeChannelTab === 'dzen'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Яндекс Дзен & RSS
                </button>
              </div>

              {/* Telegram Gateway */}
              {(activeChannelTab === 'all' || activeChannelTab === 'telegram') && (
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      <span className="font-bold text-sm text-white">Telegram Bot API (sendMessage & sendVideo)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/40">
                        HTML разметка
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy('tg', multipost.versions.telegram)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1"
                      >
                        {copiedKey === 'tg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Копировать</span>
                      </button>
                      <button
                        onClick={handleSendTelegram}
                        disabled={tgSending}
                        className="px-3.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{tgSending ? 'Отправка...' : 'Отправить в TG'}</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={multipost.versions.telegram}
                    onChange={(e) =>
                      setMultipost({
                        ...multipost,
                        versions: { ...multipost.versions, telegram: e.target.value },
                      })
                    }
                    rows={6}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500/50"
                  />

                  {/* Optional video URL attachment for sendVideo */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-zinc-400 text-[11px] shrink-0">Видео для Reels/Shorts (sendVideo):</span>
                    <input
                      type="text"
                      placeholder="https://.../video.mp4 (опционально для видео-поста)"
                      value={tgVideoUrl}
                      onChange={(e) => setTgVideoUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* VK Gateway */}
              {(activeChannelTab === 'all' || activeChannelTab === 'vk') && (
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="font-bold text-sm text-white">ВКонтакте API (wall.post)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40">
                        Медиа + Стена группы
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy('vk', multipost.versions.vk)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1"
                      >
                        {copiedKey === 'vk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Копировать</span>
                      </button>
                      <button
                        onClick={handleSendVK}
                        disabled={vkSending}
                        className="px-3.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{vkSending ? 'Публикация...' : 'Опубликовать в VK'}</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={multipost.versions.vk}
                    onChange={(e) =>
                      setMultipost({
                        ...multipost,
                        versions: { ...multipost.versions, vk: e.target.value },
                      })
                    }
                    rows={5}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-sans focus:outline-none focus:border-blue-500/50"
                  />

                  {/* VK Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                        VK Access Token:
                      </label>
                      <input
                        type="password"
                        placeholder="vk1.a.XXXX..."
                        value={vkAccessToken}
                        onChange={(e) => setVkAccessToken(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                        Owner ID группы (напр. -200123456):
                      </label>
                      <input
                        type="text"
                        placeholder="-123456789"
                        value={vkOwnerId}
                        onChange={(e) => setVkOwnerId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {vkStatus && (
                    <div
                      className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                        vkStatus.ok
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                      }`}
                    >
                      {vkStatus.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{vkStatus.msg}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Dzen Gateway */}
              {(activeChannelTab === 'all' || activeChannelTab === 'dzen') && (
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-bold text-sm text-white">Яндекс Дзен (Публикация & RSS-канал)</span>
                      <a
                        href="/api/dzen/rss.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>/api/dzen/rss.xml</span>
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy('dzen', multipost.versions.dzen)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1"
                      >
                        {copiedKey === 'dzen' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Копировать</span>
                      </button>
                      <button
                        onClick={handleSendDzen}
                        disabled={dzenSending}
                        className="px-3.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{dzenSending ? 'Экспорт...' : 'Опубликовать в Дзен'}</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={multipost.versions.dzen}
                    onChange={(e) =>
                      setMultipost({
                        ...multipost,
                        versions: { ...multipost.versions, dzen: e.target.value },
                      })
                    }
                    rows={6}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-sans focus:outline-none focus:border-amber-500/50"
                  />

                  {dzenStatus && (
                    <div
                      className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                        dzenStatus.ok
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                      }`}
                    >
                      {dzenStatus.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{dzenStatus.msg}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right 4 cols: Dispatcher Settings & Anti-Ban Log */}
            <div className="lg:col-span-4 space-y-4">
              {/* Telegram Bot Credentials */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Настройка Telegram Bot API</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Bot Token (от @BotFather):
                    </label>
                    <input
                      type="password"
                      placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Chat ID / Channel ID:
                    </label>
                    <input
                      type="text"
                      placeholder="@my_channel или -100123456789"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={handleSaveTgCredentials}
                      className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                    >
                      Сохранить ключи
                    </button>
                    <button
                      onClick={handleSendTelegram}
                      disabled={tgSending}
                      className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      Тест
                    </button>
                  </div>

                  {tgStatus && (
                    <div
                      className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                        tgStatus.ok
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                      }`}
                    >
                      {tgStatus.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{tgStatus.msg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Webhook n8n / Make */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span>Вебхук n8n / Make / Zapier</span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Webhook URL:
                  </label>
                  <input
                    type="text"
                    placeholder="https://n8n.yourdomain.com/webhook/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={handleSendWebhook}
                  className="w-full py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Вызвать сценарий вебхука</span>
                </button>

                {webhookStatus && (
                  <div
                    className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                      webhookStatus.ok
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    {webhookStatus.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{webhookStatus.msg}</span>
                  </div>
                )}
              </div>

              {/* Anti-Ban History Queue Log */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Журнал автопостинга
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Сегодня: {antiBan.dailyPostsCount}/5
                  </span>
                </div>

                <div className="space-y-2">
                  {antiBan.history.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/70 flex items-center justify-between text-[11px]"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono uppercase font-bold text-[10px] text-zinc-300">
                            {item.channel}
                          </span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400 truncate max-w-[140px]">{item.title}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString('ru-RU')}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono border border-emerald-800/40">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: API GATEWAYS & TOOLTIPS */}
      {activeSubTab === 'api' && (
        <div className="py-2">
          <ApiSettingsTab
            onConfigSaved={(cfg) => {
              if (cfg.telegramToken.trim()) setBotToken(cfg.telegramToken.trim());
              if (cfg.vkToken.trim()) setVkAccessToken(cfg.vkToken.trim());
            }}
          />
        </div>
      )}
    </div>
  );
};
