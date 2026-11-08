import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Target,
  Users,
  Eye,
  Send,
  Save,
  Calendar,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { FinancialPlan } from '../types/ivanos.ts';

interface FinanceCalculatorProps {
  onSendPlanToAgent: (planSummary: string) => void;
  onSaveToBusinessPlan: (planSummary: string) => void;
}

export const FinanceCalculator: React.FC<FinanceCalculatorProps> = ({
  onSendPlanToAgent,
  onSaveToBusinessPlan,
}) => {
  const [goalRub, setGoalRub] = useState(1000000);
  const [priceRub, setPriceRub] = useState(69000);
  const [landingCvr, setLandingCvr] = useState(3.0);
  const [salesCvr, setSalesCvr] = useState(20.0);
  const [reachPerPost, setReachPerPost] = useState(1200);

  // Calculations
  const requiredSales = Math.max(1, Math.ceil(goalRub / Math.max(1, priceRub)));
  const requiredLeads = Math.max(1, Math.ceil(requiredSales / (salesCvr / 100)));
  const requiredTotalReach = Math.max(1, Math.ceil(requiredLeads / (landingCvr / 100)));
  const requiredPosts = Math.max(1, Math.ceil(requiredTotalReach / Math.max(1, reachPerPost)));

  const perMonthRub = Math.round(goalRub / 3);
  const perWeekRub = Math.round(goalRub / 12);
  const perDayRub = Math.round(goalRub / 84);

  const formatRub = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num) + ' ₽';
  };

  const generateSummaryText = () => {
    return `# РАСЧЕТ ПЛАНА ПО ДЕНЬГАМ (МЕТОДОЛОГИЯ IVANOS)

## 1. Цель и ключевые параметры
- Цель на квартал (12 недель): ${formatRub(goalRub)}
- Средний чек флагмана: ${formatRub(priceRub)}
- Конверсия лендинга в заявку: ${landingCvr}%
- Конверсия заявки в оплату: ${salesCvr}%
- Средний охват поста: ${reachPerPost} чел.

## 2. Расчет от денег назад
- Требуется оплат: ${requiredSales} шт. (${Math.ceil(requiredSales / 3)} оплат/мес)
- Требуется квалифицированных заявок: ${requiredLeads} шт.
- Требуется суммарный охват: ${new Intl.NumberFormat('ru-RU').format(requiredTotalReach)} контактов
- Требуется контента: ~${requiredPosts} постов/рилс за 12 недель (~${Math.ceil(requiredPosts / 12)} в неделю)

## 3. Декомпозиция дохода
- В месяц: ${formatRub(perMonthRub)}
- В неделю: ${formatRub(perWeekRub)}
- В день: ${formatRub(perDayRub)}

## 4. План на 3 месяца
- Месяц 1 (Первая продажа): Продукт существует и куплен. Ручные кастдевы и тестовая продажа 1-3 клиентам.
- Месяц 2 (Повторяемость): Работает страница, воронка и регулярный контент. Закрыто ${Math.ceil(requiredSales * 0.4)} оплат.
- Месяц 3 (Объём): Масштабирование трафика и автоматика. Выход на оставшиеся ${Math.ceil(requiredSales * 0.6)} оплат.

## 5. План на 3 дня смены
- День 1: Собран контентный продукт (гайд/PDF + презентация авторского метода).
- День 2: Собран оффер, страница и путь к оплате.
- День 3: Запущен регулярный поток контента и привлечение целевой аудитории.`;
  };

  const handleSendToAgent = () => {
    onSendPlanToAgent(generateSummaryText());
  };

  const handleSaveToPlan = () => {
    onSaveToBusinessPlan(generateSummaryText());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Calculator className="w-48 h-48 text-emerald-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Методология IvanOS: Часть 2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Калькулятор «План от денег назад»
          </h1>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Расчет декомпозиции финансовой цели на 12 недель: сколько продаж, заявок, охвата и постов
            необходимо для достижения целевого чека без иллюзий и водянистых ожиданий.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSendToAgent}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Передать расчет Агенту в чат</span>
          </button>
          <button
            onClick={handleSaveToPlan}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Сохранить в .business/PLAN-RASPAKOVKI.md</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs + Real-time KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Вводные параметры цели
          </h3>

          {/* Goal 12w */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-300">Цель на 12 недель (квартал)</span>
              <span className="text-emerald-400 font-bold">{formatRub(goalRub)}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={10000000}
              step={50000}
              value={goalRub}
              onChange={(e) => setGoalRub(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex gap-2">
              {[500000, 1000000, 3000000, 5000000].map((val) => (
                <button
                  key={val}
                  onClick={() => setGoalRub(val)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    goalRub === val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {formatRub(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Core Offer Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-300">Чек флагманского продукта</span>
              <span className="text-emerald-400 font-bold">{formatRub(priceRub)}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={500000}
              step={5000}
              value={priceRub}
              onChange={(e) => setPriceRub(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex gap-2">
              {[25000, 49000, 69000, 120000, 250000].map((val) => (
                <button
                  key={val}
                  onClick={() => setPriceRub(val)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    priceRub === val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {formatRub(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Landing CVR */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-300">Конверсия лендинга/оффера в заявку</span>
              <span className="text-emerald-400 font-bold">{landingCvr}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={15}
              step={0.5}
              value={landingCvr}
              onChange={(e) => setLandingCvr(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-zinc-500">
              Стандарт для теплого трафика: 2-5%. Для холодного: 0.5-2%.
            </p>
          </div>

          {/* Sales CVR */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-300">Конверсия из заявки в оплату</span>
              <span className="text-emerald-400 font-bold">{salesCvr}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={salesCvr}
              onChange={(e) => setSalesCvr(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-zinc-500">
              Через переписку: 10-20%. Через созвон/разбор: 20-35%.
            </p>
          </div>

          {/* Reach per post */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-300">Средний охват 1 поста / рилс</span>
              <span className="text-emerald-400 font-bold">{reachPerPost} чел.</span>
            </div>
            <input
              type="range"
              min={200}
              max={20000}
              step={200}
              value={reachPerPost}
              onChange={(e) => setReachPerPost(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-6 space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Нужно оплат
              </div>
              <div className="text-2xl font-black text-white">{requiredSales} шт.</div>
              <div className="text-[11px] text-zinc-400">
                ~{Math.ceil(requiredSales / 3)} оплат в месяц
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Нужно лидов / заявок
              </div>
              <div className="text-2xl font-black text-white">{requiredLeads} шт.</div>
              <div className="text-[11px] text-zinc-400">
                ~{Math.ceil(requiredLeads / 12)} заявок в неделю
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                Суммарный охват
              </div>
              <div className="text-2xl font-black text-white">
                {new Intl.NumberFormat('ru-RU').format(requiredTotalReach)}
              </div>
              <div className="text-[11px] text-zinc-400">уникальных просмотров</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Единиц контента
              </div>
              <div className="text-2xl font-black text-white">~{requiredPosts} шт.</div>
              <div className="text-[11px] text-zinc-400">
                ~{Math.ceil(requiredPosts / 12)} постов в неделю
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-mono text-zinc-400 uppercase">
              Декомпозиция денежного потока
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">В месяц</span>
                <span className="text-sm font-bold text-emerald-400">{formatRub(perMonthRub)}</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">В неделю</span>
                <span className="text-sm font-bold text-white">{formatRub(perWeekRub)}</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">В день</span>
                <span className="text-sm font-bold text-zinc-300">{formatRub(perDayRub)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Month Plan & 3-Day Shift Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3-Month Plan */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Calendar className="w-4 h-4" />
            ПЛАН НА 3 МЕСЯЦА (КВАРТАЛ)
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <div className="text-xs font-bold text-white">
                Месяц 1: Первая продажа
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Продукт существует и куплен. Ручные кастдевы, презентация авторского метода, первые 1-3
                продажи и валидация ценности.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <div className="text-xs font-bold text-white">
                Месяц 2: Повторяемость
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Работает страница, воронка и контент. Регулярные продажи через бот или контентные связки.
                Выход на {Math.ceil(requiredSales * 0.4)} оплат.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <div className="text-xs font-bold text-white">
                Месяц 3: Объём
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Масштабирование трафика и автоматика. Подключение рекламных посевов, партнерств и дожимных
                цепочек для закрытия цели квартала.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Day Shift Sprint */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            ПЛАН НА 3 ДНЯ СМЕНЫ
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <div className="text-xs font-bold text-white">
                День 1: Контентный продукт
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Собран ключевой лид-магнит / PDF-гайд + презентация авторского механизма. Первая точка
                касания с клиентом.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <div className="text-xs font-bold text-white">
                День 2: Оффер и страница
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Собран сильный оффер по формуле ценности, посадочная страница и настроенный путь к оплате
                (форма/бот).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <div className="text-xs font-bold text-white">
                День 3: Поток трафика
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Запущен регулярный поток контента и привлечение целевой аудитории через рилс, посты и перелив
                в базу.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
