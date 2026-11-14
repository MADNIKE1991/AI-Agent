import React, { useState } from 'react';
import { HelpCircle, Key, Save, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export interface ApiKeyConfig {
  telegramToken: string;
  vkToken: string;
  prodamusKey: string;
  supabaseUrl: string;
}

interface ApiSettingsTabProps {
  onConfigSaved?: (config: ApiKeyConfig) => void;
}

const STORAGE_KEY_API_CONFIG = 'madnike_api_config';

function loadInitialConfig(): ApiKeyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_API_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        telegramToken: parsed.telegramToken ?? localStorage.getItem('madnike_tg_bot_token') ?? '',
        vkToken: parsed.vkToken ?? localStorage.getItem('madnike_vk_token') ?? '',
        prodamusKey: parsed.prodamusKey ?? '',
        supabaseUrl: parsed.supabaseUrl ?? '',
      };
    }
  } catch {
    // fallback below
  }
  return {
    telegramToken: localStorage.getItem('madnike_tg_bot_token') || '',
    vkToken: localStorage.getItem('madnike_vk_token') || '',
    prodamusKey: '',
    supabaseUrl: '',
  };
}

export const ApiSettingsTab: React.FC<ApiSettingsTabProps> = ({ onConfigSaved }) => {
  const [keys, setKeys] = useState<ApiKeyConfig>(loadInitialConfig);
  const [saved, setSaved] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<keyof ApiKeyConfig | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem(STORAGE_KEY_API_CONFIG, JSON.stringify(keys));
    if (keys.telegramToken.trim()) {
      localStorage.setItem('madnike_tg_bot_token', keys.telegramToken.trim());
    }
    if (keys.vkToken.trim()) {
      localStorage.setItem('madnike_vk_token', keys.vkToken.trim());
    }
    if (keys.prodamusKey.trim()) {
      localStorage.setItem('madnike_prodamus_key', keys.prodamusKey.trim());
    }
    if (keys.supabaseUrl.trim()) {
      localStorage.setItem('madnike_supabase_url', keys.supabaseUrl.trim());
    }
    onConfigSaved?.(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tooltips: Record<keyof ApiKeyConfig, string> = {
    telegramToken:
      'Создайте бота через официального @BotFather в Telegram, выберите команду /newbot и скопируйте полученный HTTP API токен.',
    vkToken:
      'Получите токен сообщества в настройках вашей группы ВКонтакте (Управление -> Работа с API -> Ключи доступа с правами на стены и сообщения).',
    prodamusKey:
      'Секретный ключ для подписи и проверки вебхуков берется в личном кабинете платежного модуля Prodamus (Настройки -> Интеграция).',
    supabaseUrl:
      'URL вашего проекта и Anon Key берутся в панели управления Supabase в разделе Settings -> API.',
  };

  const configuredCount = Object.values(keys).filter((v) => v.trim().length > 0).length;

  const renderTooltipButton = (field: keyof ApiKeyConfig, labelName: string) => {
    const isOpen = activeTooltip === field;
    return (
      <div className="group relative flex items-center">
        <button
          type="button"
          aria-label={`Подсказка: ${labelName}`}
          aria-expanded={isOpen}
          onClick={() => setActiveTooltip(isOpen ? null : field)}
          onMouseEnter={() => setActiveTooltip(field)}
          onMouseLeave={() => setActiveTooltip((prev) => (prev === field ? null : prev))}
          onFocus={() => setActiveTooltip(field)}
          onBlur={() => setActiveTooltip((prev) => (prev === field ? null : prev))}
          className="p-1 rounded text-slate-400 hover:text-emerald-400 focus:text-emerald-400 focus:outline-none transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <div
          role="tooltip"
          className={`absolute right-0 bottom-full mb-2 w-72 p-3 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-slate-700 z-50 leading-relaxed transition-opacity ${
            isOpen ? 'block opacity-100' : 'hidden group-hover:block'
          }`}
        >
          {tooltips[field]}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-wide">Шлюзы и API-ключи MADNIKE OS</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Локальное хранение токенов дистрибуции и монетизации Website to PDF / Ice Studio ({configuredCount}/4 заполнено)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowSecrets((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSecrets ? 'Скрыть ключи' : 'Показать ключи'}</span>
          </button>

          {saved && (
            <span
              role="status"
              className="flex items-center text-emerald-400 text-sm font-medium animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Сохранено в память
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Telegram Token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="api-telegram-token" className="text-sm font-medium text-slate-300">
              Telegram Bot API Token
            </label>
            {renderTooltipButton('telegramToken', 'Telegram Bot API Token')}
          </div>
          <input
            id="api-telegram-token"
            type={showSecrets ? 'text' : 'password'}
            value={keys.telegramToken}
            onChange={(e) => setKeys({ ...keys, telegramToken: e.target.value })}
            placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-sm font-mono"
          />
        </div>

        {/* VK Token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="api-vk-token" className="text-sm font-medium text-slate-300">
              VK Group API Token
            </label>
            {renderTooltipButton('vkToken', 'VK Group API Token')}
          </div>
          <input
            id="api-vk-token"
            type={showSecrets ? 'text' : 'password'}
            value={keys.vkToken}
            onChange={(e) => setKeys({ ...keys, vkToken: e.target.value })}
            placeholder="vk1.a.CáiNдйТoken..."
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-sm font-mono"
          />
        </div>

        {/* Prodamus Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="api-prodamus-key" className="text-sm font-medium text-slate-300">
              Prodamus Secret Key
            </label>
            {renderTooltipButton('prodamusKey', 'Prodamus Secret Key')}
          </div>
          <input
            id="api-prodamus-key"
            type={showSecrets ? 'text' : 'password'}
            value={keys.prodamusKey}
            onChange={(e) => setKeys({ ...keys, prodamusKey: e.target.value })}
            placeholder="your-pay-page.payform.ru secret key"
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-sm font-mono"
          />
        </div>

        {/* Supabase URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="api-supabase-url" className="text-sm font-medium text-slate-300">
              Supabase Project URL & Key
            </label>
            {renderTooltipButton('supabaseUrl', 'Supabase Project URL & Key')}
          </div>
          <input
            id="api-supabase-url"
            type="text"
            value={keys.supabaseUrl}
            onChange={(e) => setKeys({ ...keys, supabaseUrl: e.target.value })}
            placeholder="https://xyzproject.supabase.co"
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-sm font-mono"
          />
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Токены Telegram и ВКонтакте автоматически синхронизируются со шлюзами автопостинга в Контент-заводе.
          </span>
        </div>

        <button
          type="submit"
          className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
        >
          <Save className="w-4 h-4" />
          <span>Сохранить параметры шлюзов</span>
        </button>
      </form>
    </div>
  );
};
