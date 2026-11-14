import {
  ContentPlanItem,
  ReelProject,
  MultiPostItem,
  YouTubeProject,
} from '../types/ivanos.ts';

export const REEL_FORMATS = [
  { id: '01-yap', name: '01-yap (Talking Head)', desc: 'Плотная экспертная речь в камеру, кинетические титры, смена зума 1.2x каждые 3 секунды' },
  { id: 'ui-record', name: 'ui-record (Скринкаст)', desc: 'Демонстрация работы софта/кода на экране с закадровой озвучкой и оверлеем курсора' },
  { id: '06-text-over-b-roll', name: '06-text-over-b-roll', desc: 'Крупный текстовый тезис по центру, атмосферный фоновый видеоряд, трендовый звук' },
  { id: '07-split-screen', name: '07-split-screen (50/50)', desc: 'Сверху чужой виральный факап/проблема, снизу авторское решение и готовый результат' },
  { id: '11-ranking', name: '11-ranking (Топ-3/5)', desc: 'Обратный отсчет фатальных ошибок или секретных приемов с быстрым темпом' },
  { id: '08-clone', name: '08-clone (Диалог)', desc: 'Автор в двух ролях: заказчик с нереальным ТЗ и хладнокровный сеньор-разработчик' },
  { id: '13-object-lesson', name: '13-object-lesson', desc: 'Наглядная физическая или кодовая метафора: показ конкретной уязвимости' },
  { id: 'faceless-explainer', name: 'faceless-explainer', desc: 'Анимированная визуализация схемы без лица автора с графическими врезками' },
];

export const INITIAL_CONTENT_PLAN: ContentPlanItem[] = [
  {
    id: 'plan-1',
    dayIndex: 1,
    dayName: 'Понедельник',
    dateStr: '10 Ноября',
    huntLevel: 0,
    huntStageName: 'Уровень 0: Скрытая проблема',
    format: 'reel',
    formatTitle: 'Рилс / Shorts',
    hook: 'Почему встроенная печать браузера превращает дашборды в кашу',
    coreIdea: 'Показ реальной проблемы: экспорт сложных Flexbox/Grid сеток в PDF ломает верстку и графики. Как решить за 1 секунду.',
    ctaText: 'Пиши «ПДФ» в комментарии, пришлю расширение',
    codeWord: 'ПДФ',
    channels: ['tg', 'ig', 'vk'],
    status: 'planned',
  },
  {
    id: 'plan-2',
    dayIndex: 2,
    dayName: 'Вторник',
    dateStr: '11 Ноября',
    huntLevel: 1,
    huntStageName: 'Уровень 1: Осознание боли',
    format: 'post',
    formatTitle: 'Инженерный лонгрид',
    hook: 'Студия просит 400 000 ₽ за сайт, который сеньор напишет за 12 дней',
    coreIdea: 'Разбор сметы типичного агентства: из чего складываются 80% раздутых расходов на менеджеров и почему прямой контракт экономит бюджет.',
    ctaText: 'Читать полный чек-лист экспресс-аудита в Telegram',
    codeWord: 'АУДИТ',
    channels: ['tg', 'dzen', 'vk'],
    status: 'planned',
  },
  {
    id: 'plan-3',
    dayIndex: 3,
    dayName: 'Среда',
    dateStr: '12 Ноября',
    huntLevel: 2,
    huntStageName: 'Уровень 2: Поиск решения',
    format: 'carousel',
    formatTitle: 'Карусель (8 слайдов)',
    hook: '5 критических ошибок в коде Next.js, из-за которых сайт тормозит в 3 раза',
    coreIdea: 'Наглядные слайды с кодом ДО и ПОСЛЕ: серверные компоненты, оптимизация бандла, мемоизация тяжелых вычислений.',
    ctaText: 'Листай до конца и забирай чеклист',
    codeWord: 'NEXT',
    channels: ['ig', 'vk'],
    status: 'planned',
  },
  {
    id: 'plan-4',
    dayIndex: 4,
    dayName: 'Четверг',
    dateStr: '13 Ноября',
    huntLevel: 2,
    huntStageName: 'Уровень 2: Авторский метод',
    format: 'reel',
    formatTitle: 'Рилс-скринкаст (30 сек)',
    hook: 'Как я за 15 минут собрал озвучку для аудиоспектакля через связку FL Studio + ElevenLabs',
    coreIdea: 'Скринкаст рабочего стола: генерация голоса персонажа, наложение реверберации, сатурация и сведение в единый кинематографичный трек.',
    ctaText: 'Слушай демо трека в описании',
    codeWord: 'ЗВУК',
    channels: ['ig', 'tg', 'vk'],
    status: 'planned',
  },
  {
    id: 'plan-5',
    dayIndex: 5,
    dayName: 'Пятница',
    dateStr: '14 Ноября',
    huntLevel: 3,
    huntStageName: 'Уровень 3: Выбор продукта',
    format: 'case',
    formatTitle: 'Кейс до/после',
    hook: 'Кейс: рефакторинг госвеб-портала за 14 дней вместо 3 месяцев',
    coreIdea: 'Твердые цифры: скорость рендеринга выросла с 4.2с до 0.6с, устранено 18 уязвимостей, чистая архитектура без спагетти.',
    ctaText: 'Напишите мне в личные сообщения для экспресс-аудита проекта',
    codeWord: 'РЕЗУЛЬТАТ',
    channels: ['tg', 'dzen', 'vk'],
    status: 'planned',
  },
  {
    id: 'plan-6',
    dayIndex: 6,
    dayName: 'Суббота',
    dateStr: '15 Ноября',
    huntLevel: 3,
    huntStageName: 'Уровень 3: Демо фичи',
    format: 'reel',
    formatTitle: 'Рилс / Shorts',
    hook: 'Экспорт защищенных страниц в PDF в один клик без водяных знаков',
    coreIdea: 'Демонстрация расширения Website to PDF: парсинг скриптов, стилей и генерация чистого векторного файла.',
    ctaText: 'Ссылка на расширение в шапке профиля',
    codeWord: 'РАСШИРЕНИЕ',
    channels: ['ig', 'vk'],
    status: 'planned',
  },
  {
    id: 'plan-7',
    dayIndex: 7,
    dayName: 'Воскресенье',
    dateStr: '16 Ноября',
    huntLevel: 4,
    huntStageName: 'Уровень 4: Готов купить / Окно продаж',
    format: 'offer',
    formatTitle: 'Прямой оффер',
    hook: 'Беру ровно 1 B2B-проект на ноябрьский спринт. Условия и формат работы',
    coreIdea: 'Фиксированные условия: 14 дней, Next.js/React, сеньорский уровень, гарантия сроков по договору.',
    ctaText: 'Бриф в Telegram по кодовому слову СПРИНТ',
    codeWord: 'СПРИНТ',
    channels: ['tg', 'vk'],
    status: 'planned',
  },
];

export const INITIAL_REEL_PROJECT: ReelProject = {
  id: 'reel-ice-1',
  title: 'Website to PDF: Чистый экспорт дашборда без поломки стилей',
  formatType: 'ui-record (Скринкаст софта)',
  targetDurationSec: 30,
  hookHeadline: 'Почему браузерная печать превращает графики в кашу?',
  ctaCodeWord: 'ПДФ',
  aspectRatio: '9:16',
  audioPrompt: 'Энергичный лоу-фай бит с синтезатором и легким кликом клавиатуры',
  scenes: [
    {
      id: 1,
      timeRange: '0.0 - 3.0s',
      durationSec: 3,
      visualType: 'screencast',
      visualDesc: 'Курсор жмет Ctrl+P на сложном дашборде. В окне печати график обрезан, шрифты съехали, половина колонок пропала.',
      subtitles: 'ПЕЧАТЬ БРАУЗЕРА ЛОМАЕТ ВЕРСТКУ?',
      highlightWords: ['ЛОМАЕТ', 'ВЕРСТКУ'],
      voiceoverText: 'Знакомо, когда жмешь печать страницы в браузере, а сложный дашборд превращается в кашу?',
      sfx: 'Звук ошибки Windows / скрежет',
    },
    {
      id: 2,
      timeRange: '3.0 - 12.0s',
      durationSec: 9,
      visualType: 'demo',
      visualDesc: 'Нажатие на иконку расширения Website to PDF. Появляется компактная панель с переключателями "Убрать баннеры", "Оглавление", "Вектор".',
      subtitles: 'ЭКСПОРТ В 1 КЛИК БЕЗ ПОТЕРИ CSS',
      highlightWords: ['1 КЛИК', 'БЕЗ ПОТЕРИ'],
      voiceoverText: 'Я устал с этим бороться и собрал расширение Website to PDF. Оно сохраняет все Flexbox, Grid и динамические графики векторно.',
      sfx: 'Щелчок переключателя + Whoosh',
    },
    {
      id: 3,
      timeRange: '12.0 - 22.0s',
      durationSec: 10,
      visualType: 'screencast',
      visualDesc: 'Сгенерированный PDF открывается мгновенно в просмотрщике. Верстка 1-в-1 с сайтом, шрифты четкие, оглавление кликабельно.',
      subtitles: 'ИДЕАЛЬНЫЙ PDF ЗА 1 СЕКУНДУ',
      highlightWords: ['ИДЕАЛЬНЫЙ', '1 СЕКУНДУ'],
      voiceoverText: 'Никаких водяных знаков, чистый документ за секунду. Работает автономно и оплачивается картами РФ через Prodamus.',
      sfx: 'Победный аккорд синтезатора FL Studio',
    },
    {
      id: 4,
      timeRange: '22.0 - 30.0s',
      durationSec: 8,
      visualType: 'graphic',
      visualDesc: 'Финальная плашка: логотип Ice Studio, надпись "Пиши ПДФ в комментарии" и стрелка вниз.',
      subtitles: 'НАПИШИ «ПДФ» В КОММЕНТЫ',
      highlightWords: ['«ПДФ»'],
      voiceoverText: 'Напиши слово «ПДФ» в комментарии под этим роликом, и бот сразу пришлет прямую ссылку на расширение.',
      sfx: 'Click + финальный звуковой дроп',
    },
  ],
};

export const INITIAL_MULTIPOST: MultiPostItem = {
  id: 'post-1',
  topic: 'Почему большинство агентств затягивают запуск веб-сервисов на 4 месяца',
  createdAt: new Date().toISOString(),
  status: {
    telegram: 'draft',
    vk: 'draft',
    dzen: 'draft',
    instagram: 'draft',
  },
  versions: {
    telegram: `<b>Большинство студий разработки продают не результат, а часы своих менеджеров.</b>

Вы платите за бесконечные созвоны, согласование протоколов и перекладывание тикетов из одной колонки в другую. В итоге простой веб-сервис пишется четыре месяца, а код внутри держится на костылях.

В Ice Studio я работаю по другому принципу:
- 6 лет коммерческого fullstack-опыта (React, Next.js, Node.js).
- Прямой контакт с инженером, без посредников и испорченного телефона.
- Сдача готового веб-сервиса за 10-14 дней с чистой архитектурой.

Если вам нужно запустить веб-проект быстро и без головной боли - напишите мне в личные сообщения @menshaev. Разберу вашу задачу за 15 минут и назову точный срок.`,

    vk: `Почему веб-студии ломят полмиллиона за проект, который делается за две недели? 💻

Каждый предприниматель сталкивался с этим: приходишь в агентство с четкой задачей, а в смете появляются аккаунт-менеджер, проджект, тимлид, тестировщик и архитектор.

В итоге вы оплачиваете чужой раздутый штат, а разработка затягивается на месяцы.

В Ice Studio подход другой:
1. Вы работаете напрямую с сеньор-разработчиком с 6 годами коммерческого опыта (React, Next.js, Node.js, госвеб).
2. Сдача готового MVP занимает 10-14 дней.
3. Код пишется начисто, с тестами и без техдолга.

Сталкивались со срывом сроков от подрядчиков? Напишите в комментариях, как вы выходили из ситуации 👇

#вебразработка #nextjs #fullstack #icestudio #itбизнес`,

    dzen: `Как предпринимателю запустить сложный веб-сервис без раздутых смет и срыва сроков

Когда бизнесу требуется веб-приложение, перед ним встает классическая дилемма: пойти в крупную веб-студию или нанять фрилансера с биржи. Оба пути часто ведут к разочарованию.

## Проблема агентского подхода
Студии среднего эшелона продают часы своих менеджеров. Вашу задачу декомпозируют на десятки подзадач, передают джуниор-разработчикам, а промежуточный созвон назначают через две недели. В результате простой сервис пишется 3-4 месяца, а смета переваливает за 500 000 рублей.

## Почему фрилансеры с биржи не спасают
Другая крайность - нанять начинающего разработчика за 30 000 рублей. В 90% случаев это заканчивается спагетти-кодом на чужих шаблонах, который ломается при первой нагрузке, и сорванным релизом.

## Решение: прямой контракт с сеньор-инженером
Современный стек (Next.js, TypeScript, Tailwind) позволяет опытному инженеру в одиночку собирать масштабируемые сервисы за 10-14 дней.

**Главное в 3 пунктах:**
- Прямой контакт с автором кода исключает испорченный телефон.
- Срок запуска сокращается в 4 раза за счет отсутствия бюрократии.
- Архитектура сразу строится под высокие нагрузки и интеграцию ИИ.

В Ice Studio мы запускаем проекты именно так. Напишите, если вам требуется независимый аудит текущего сайта или разработка веб-сервиса под ключ.`,

    instagram: `Большинство студий разработки продают не результат, а часы своих менеджеров.

Вы платите за созвоны, согласования и отчеты. В итоге простой веб-сервис пишется четыре месяца, а код внутри полон багов.

В Ice Studio я работаю напрямую:
- 6 лет в коммерческом вебе (React, Next.js, Node.js)
- Сдача сервиса за 10-14 дней
- Чистый масштабируемый код без костылей

Напиши кодовое слово «РАЗБОР» в Директ, и я проведу бесплатный экспресс-аудит архитектуры твоего сайта.`,
  },
};

/**
 * Sends a real message to Telegram via Bot API
 */
export async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  const token = botToken.trim();
  const targetChat = chatId.trim();

  if (!token || !targetChat) {
    throw new Error('Укажите Bot Token и Chat ID в настройках Telegram.');
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: targetChat,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || 'Ошибка при отправке сообщения в Telegram');
  }

  return data;
}

/**
 * Universal Webhook sender for Make / n8n / Zapier / Prodamus
 */
export async function sendUniversalWebhook(webhookUrl: string, payload: any) {
  const url = webhookUrl.trim();
  if (!url) {
    throw new Error('Укажите корректный URL вебхука');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      source: 'MADNIKE_OS_CONTENT_FACTORY',
      ...payload,
    }),
  });

  return response.ok;
}

export const WEBSITE_TO_PDF_TOPICS = [
  {
    id: 'top-1',
    huntLevel: 1,
    huntName: 'Уровень 1: Боль пользователя (Ctrl+P и растр)',
    title: 'Ctrl+P ломает верстку, режет таблицы и превращает текст в растр',
    pain: 'Стандартная печать браузера скрывает фон, режет таблицы пополам и превращает четкий текст в нечитаемый растр.',
    hook: 'Жмешь Ctrl+P в Chrome, а на выходе разорванные таблицы и мыльный растр? Вот почему так происходит.',
    format: 'Shorts-слайды (60 сек) + Пост в TG/ВК',
    ctaCode: 'ПДФ',
  },
  {
    id: 'top-2',
    huntLevel: 2,
    huntName: 'Уровень 2: Угроза приватности',
    title: 'Облачные конвертеры воруют выписки и контракты: 100% локальный экспорт',
    pain: 'Бесплатные веб-конвертеры загружают ваши финансовые выписки, NDA и договоры на чужие серверы и не видят закрытые кабинеты.',
    hook: 'Никогда не загружай финансовые выписки и контракты в онлайн-конвертеры PDF. Показываю 100% локальный способ.',
    format: 'YouTube-разбор (3 мин) + Карусель в Нельзяграм',
    ctaCode: 'ПРИВАТ',
  },
  {
    id: 'top-3',
    huntLevel: 3,
    huntName: 'Уровень 3: Организационный хаос',
    title: 'Файлы вида "print (22).pdf" против автоматического имени из H1',
    pain: 'Папка загрузок забита безымянными файлами "print (22).pdf", из-за чего поиск нужного отчета отнимает до 20 минут в день.',
    hook: 'Устал искать нужный отчет среди десятков файлов "print (22).pdf"? Наш плагин сам берет имя из H1 страницы.',
    format: 'Shorts-слайды (60 сек) + Лонгрид в Дзен',
    ctaCode: 'ИМЯ',
  },
  {
    id: 'top-4',
    huntLevel: 3,
    huntName: 'Уровень 3-4: Демо продукта и B2B',
    title: 'Агентства тянут разработку месяцами, сеньор собирает Next.js MVP за 10-14 дней',
    pain: 'Веб-студии раздувают смету и срывают сроки на 3-6 месяцев из-за прослойки менеджеров.',
    hook: 'Почему агентство берет 400 000 ₽ и 4 месяца за сервис, который сеньор собирает на Next.js/React за 14 дней.',
    format: 'YouTube-слайды (60 сек) + TG-пост',
    ctaCode: 'СПРИНТ',
  },
  {
    id: 'top-5',
    huntLevel: 4,
    huntName: 'Уровень 4: Оффер / Готов купить',
    title: 'Без водяных знаков и зарубежных карт: установка Website to PDF PRO через СБП',
    pain: 'Зарубежные утилиты требуют подписку $15/мес и не принимают карты РФ.',
    hook: 'Локальный векторный PDF с авто-именем из H1 и оплатой через Prodamus без зарубежных карт.',
    format: 'Прямой оффер + Видео-слайд с демонстрацией оплаты',
    ctaCode: 'ДОСТУП',
  },
];

export const INITIAL_YOUTUBE_PROJECT: YouTubeProject = {
  id: 'yt-web-to-pdf-1',
  title: 'Как сохранить любой сайт в PDF без съехавших стилей и шрифтов за 1 секунду',
  targetDuration: 'shorts_60s',
  huntStage: 'Уровень 1-3: От боли со съехавшим CSS к решению Website to PDF',
  hook: 'Печать браузера превращает дашборды в кашу. Как сохранить сайт 1-в-1?',
  landingUrl: 'https://ice-studio.ru/website-to-pdf',
  tags: [
    'save webpage as pdf',
    'website to pdf extension',
    'экспорт сайта в pdf',
    'печать сайта без ошибок',
    'как сохранить страницу в pdf',
    'ice studio',
    'prodamus',
  ],
  seoDescription: `Как сохранить сложную веб-страницу, госвеб или дашборд в чистый векторный PDF за 1 клик без съехавших шрифтов и поломанной верстки.
Скачать расширение Website to PDF (поддержка 54 языков): https://ice-studio.ru/website-to-pdf

В этом видео:
0:00 Почему печать в браузере (Ctrl+P) ломает верстку и графики
0:06 Что ломается под капотом (CSS @media print)
0:20 Решение: расширение Website to PDF с поддержкой 54 языков
0:38 Сравнение результата: чистый векторный PDF
0:50 Как скачать и промокод на PRO-версию

Телеграм с обновлениями и полезными инструментами: @menshaev
Разработчик: Ice Studio (Никита Меньшаев)`,
  slides: [
    {
      id: 1,
      slideNumber: 1,
      timeRange: '0.0 - 6.0s',
      durationSec: 6,
      type: 'pain',
      title: 'ПРОБЛЕМА: ПЕЧАТЬ БРАУЗЕРА ЛОМАЕТ ВЕРСТКУ',
      bulletPoints: [
        'Ctrl+P превращает сложный дашборд в кашу',
        'Графики и таблицы обрезаются пополам',
        'Шрифты слетают на стандартный Times New Roman',
      ],
      interfaceBadge: 'СТАНДАРТНЫЙ CHROME CTRL+P',
      voiceoverText: 'Знакомо, когда нужно сохранить важный отчет или страницу с графиками, жмешь Ctrl+P, а браузер выдает обрезанную кашу со съехавшими шрифтами?',
      onScreenText: 'ПОЧЕМУ CTRL+P УБИВАЕТ ВАШИ СТРАНИЦЫ?',
    },
    {
      id: 2,
      slideNumber: 2,
      timeRange: '6.0 - 18.0s',
      durationSec: 12,
      type: 'code',
      title: 'ПОД КАПОТОМ: ПОЧЕМУ ЭТО ПРОИСХОДИТ?',
      bulletPoints: [
        'Дефолтный @media print выключает фоновые цвета и flexbox',
        'Динамический Canvas и SVG не рендерятся в стандартном потоке',
        'Веб-конвертеры не имеют доступа к авторизованным страницам',
      ],
      codeSnippet: `@media print {
  /* Браузер принудительно ломает стили: */
  body { background: white !important; }
  .dashboard-grid { display: block !important; }
  canvas, svg { page-break-inside: avoid; }
}`,
      interfaceBadge: 'CSS PRINT ENGINE ISSUE',
      voiceoverText: 'Все дело в правиле media print. Браузер принудительно обнуляет фоны, ломает Flexbox-сетки, а внешние сайты-конвертеры не видят ваши закрытые страницы.',
      onScreenText: 'CSS @MEDIA PRINT ЛОМАЕТ СОВРЕМЕННЫЙ WEB',
    },
    {
      id: 3,
      slideNumber: 3,
      timeRange: '18.0 - 35.0s',
      durationSec: 17,
      type: 'demo',
      title: 'РЕШЕНИЕ: WEBSITE TO PDF EXTENSION',
      bulletPoints: [
        'Экспорт прямо в браузере в 1 клик',
        'Полная поддержка 54 мировых языков без кракозябр',
        'Автоматическое вырезание рекламных баннеров и куки-плашек',
        'Сохранение векторного качества всех графиков и шрифтов',
      ],
      interfaceBadge: 'WEBSITE TO PDF V2.4 • 54 LANGUAGES',
      voiceoverText: 'Я написал расширение Website to PDF. Оно захватывает реальное DOM-дерево со всеми стилями, поддерживает 54 языка и формирует чистый PDF за одну секунду.',
      onScreenText: 'ЭКСПОРТ В 1 КЛИК • 54 ЯЗЫКА • БЕЗ ВОДЯНЫХ ЗНАКОВ',
    },
    {
      id: 4,
      slideNumber: 4,
      timeRange: '35.0 - 48.0s',
      durationSec: 13,
      type: 'proof',
      title: 'РЕЗУЛЬТАТ: ПИКСЕЛЬ-В-ПИКСЕЛЬ С САЙТОМ',
      bulletPoints: [
        'Векторные шрифты с поиском по тексту',
        'Кликабельные ссылки и рабочее оглавление',
        'Работает с госвеб-порталами, LMS-системами и CRM',
      ],
      interfaceBadge: 'ВЕКТОРНЫЙ ДОКУМЕНТ • 100% ПРУФ',
      voiceoverText: 'На выходе получается идеальный векторный документ с кликабельными ссылками, который выглядит точь-в-точь как страница в браузере.',
      onScreenText: 'РЕЗУЛЬТАТ: ВЕКТОРНЫЙ PDF 1-В-1 С ОРИГИНАЛОМ',
    },
    {
      id: 5,
      slideNumber: 5,
      timeRange: '48.0 - 60.0s',
      durationSec: 12,
      type: 'cta',
      title: 'ЗАБРАТЬ РАСШИРЕНИЕ И PRO-ВЕРСИЮ',
      bulletPoints: [
        'Бесплатная версия доступна в Chrome Web Store',
        'PRO-тариф с оплатой картами РФ через Prodamus',
        'Ссылка на многоязычный лендинг в описании к видео',
      ],
      interfaceBadge: 'PRODAMUS + SUPABASE • СБП ОПЛАТА',
      voiceoverText: 'Забирайте расширение по ссылке в описании. Для PRO-тарифа действует быстрая оплата картами РФ через Prodamus без зарубежных посредников.',
      onScreenText: 'ССЫЛКА НА ЛЕНДИНГ В ОПИСАНИИ 👇 КОД: ПДФ',
    },
  ],
};

export const VIDEO_TEMPLATES = [
  {
    id: 'coding-matrix',
    name: 'Кодинг-таймлапс (Next.js / TypeScript)',
    category: 'Инженерия и разработка',
    themeColor: 'emerald' as const,
    description: 'Плотный темный терминал, скролл чистого кода, сборка сервисов и запуск без багов.',
    previewAnimation: 'matrix-code',
    recommendedHook: 'Студия просит 400 000 ₽ за код, который пишется за 12 дней',
    defaultPain: '80% бюджета уходит на аккаунт-менеджеров, а джуны выдают спагетти-код.',
    defaultCta: 'Пиши «КОД» в Директ или TG для экспресс-аудита',
  },
  {
    id: 'tech-minimal-abstract',
    name: 'Минималистичная абстракция',
    category: 'B2B и архитектура',
    themeColor: 'amber' as const,
    description: 'Плавные неоновые градиенты, глубокий темный фон, элегантная сетка без отвлекающих деталей.',
    previewAnimation: 'cyber-glow',
    recommendedHook: '5 критических ошибок архитектуры Next.js, из-за которых сайт тормозит',
    defaultPain: 'Медленный SSR рендеринг съедает 40% мобильного трафика.',
    defaultCta: 'Забирай чек-лист оптимизации в закрепленном посте',
  },
  {
    id: 'cyber-grid-audio',
    name: 'Кибер-сетка & FL Studio аудиоволны',
    category: 'Мультимедиа & ИИ',
    themeColor: 'purple' as const,
    description: 'Пульсирующий спектральный эквалайзер, неоновые волны и атмосфера кинематографичного звука.',
    previewAnimation: 'sound-wave',
    recommendedHook: 'Как за 15 минут собрать озвучку аудиоспектакля через FL Studio + ElevenLabs',
    defaultPain: 'Аренда студии записи стоит от 50 000 ₽ за смену, а сроки растягиваются на недели.',
    defaultCta: 'Слушай демо трека в описании роликов',
  },
  {
    id: 'interface-screencast',
    name: 'Интерфейс Website to PDF',
    category: 'Микропродукты & Утилиты',
    themeColor: 'sky' as const,
    description: 'Динамичный сплит браузера: экспорт Flexbox-сеток, сохранение стилей и плашка 54 языка.',
    previewAnimation: 'ui-demo',
    recommendedHook: 'Печать браузера превращает дашборды в кашу? Решение в 1 клик',
    defaultPain: 'Стандартный Ctrl+P режет графики пополам и ломает верстку отчетов.',
    defaultCta: 'Ссылка на расширение в шапке профиля • Код: ПДФ',
  },
];

export async function fetchAntiBanStatus() {
  const res = await fetch('/api/distribution/anti-ban');
  if (!res.ok) throw new Error('Не удалось получить статус Anti-Ban');
  return res.json();
}

export async function distributeToTelegram(params: {
  botToken: string;
  chatId: string;
  text: string;
  videoUrl?: string;
}) {
  const res = await fetch('/api/distribution/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка отправки в Telegram');
  return data;
}

export async function distributeToVK(params: {
  accessToken: string;
  ownerId: string;
  message: string;
  attachments?: string;
}) {
  const res = await fetch('/api/distribution/vk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка отправки во ВКонтакте');
  return data;
}

export async function distributeToDzen(params: {
  title: string;
  text: string;
  link?: string;
}) {
  const res = await fetch('/api/distribution/dzen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка отправки в Яндекс Дзен');
  return data;
}

export async function distributeToInstagram(params: {
  igUserId: string;
  accessToken: string;
  caption: string;
  templateId: string;
  proxyUrl?: string;
  hookText?: string;
  painText?: string;
  ctaText?: string;
}) {
  const res = await fetch('/api/distribution/instagram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка отправки в Instagram');
  return data;
}
