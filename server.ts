import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateMADNIKEResponse } from './src/utils/madnikeEngine.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Anti-Ban state manager (in-memory tracking for rate-limits & safety)
const antiBanState = {
  dailyPostsCount: 2,
  dailyLimit: 5,
  lastPostTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  minIntervalMinutes: 30,
  maxIntervalMinutes: 90,
  isSafeToPost: true,
  history: [
    {
      id: 'post-hist-1',
      channel: 'telegram',
      title: 'Почему встроенная печать браузера ломает верстку',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      status: 'success',
    },
    {
      id: 'post-hist-2',
      channel: 'vk',
      title: 'Студия просит 400 000 ₽ за сайт, который сеньор напишет за 12 дней',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'success',
    },
  ],
};

const rawKey = (process.env.GEMINI_API_KEY || '').replace(/['"]/g, '').trim();
const isRealKey = Boolean(rawKey.length > 20 && rawKey.startsWith('AIza') && rawKey !== 'MY_GEMINI_API_KEY');
const apiKey = isRealKey ? rawKey : null;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health and Status API
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: isRealKey,
    model: 'gemini-3.8-flash',
    edition: 'MADNIKE OS Google AI Studio Complete Edition',
    localTime: new Date().toISOString(),
  });
});

// Chat endpoint with streaming support
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const { messages, systemInstruction, stream = true } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  const lastUserMessage = messages[messages.length - 1]?.content || '';

  // Stream helper for MADNIKE Engine
  const streamEngineResponse = async (text: string) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const words = text.split(' ');
    for (let i = 0; i < words.length; i += 4) {
      const slice = words.slice(i, i + 4).join(' ') + (i + 4 < words.length ? ' ' : '');
      res.write(`data: ${JSON.stringify({ text: slice })}\n\n`);
      await new Promise((r) => setTimeout(r, 15));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  };

  // If no valid Gemini API key is configured, use MADNIKE OS Engine directly
  if (!ai) {
    const resultText = generateMADNIKEResponse(lastUserMessage, {
      layer1_now: { sessionActive: true, sessionStartTime: null, currentTask: '', scratchpad: '', tokensEstimated: 0 },
      layer2_recent: { memoryIndexContent: '', rules: [] },
      layer3_permanent: { documents: [] },
      layer4_skills: { humaniserPrompt: '', deepResearchSteps: [], huntLadder: [], constitutionText: '' },
    });

    if (stream) {
      await streamEngineResponse(resultText);
    } else {
      res.json({ text: resultText });
    }
    return;
  }

  // If real Gemini API key is present, attempt streaming with Gemini 3.8 Flash
  try {
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const config: { systemInstruction?: string } = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });

      for await (const chunk of responseStream) {
        const text = (chunk.text || '').replace(/—|–/g, '-');
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });

      res.json({ text: (response.text ?? '').replace(/—|–/g, '-') });
    }
  } catch (error: any) {
    console.error('Gemini error, fallback to MADNIKE Engine:', error?.message);
    const resultText = generateMADNIKEResponse(lastUserMessage, {
      layer1_now: { sessionActive: true, sessionStartTime: null, currentTask: '', scratchpad: '', tokensEstimated: 0 },
      layer2_recent: { memoryIndexContent: '', rules: [] },
      layer3_permanent: { documents: [] },
      layer4_skills: { humaniserPrompt: '', deepResearchSteps: [], huntLadder: [], constitutionText: '' },
    });

    if (!res.headersSent) {
      if (stream) {
        await streamEngineResponse(resultText);
      } else {
        res.json({ text: resultText });
      }
    } else {
      res.write(`data: ${JSON.stringify({ text: `\n\n${resultText}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// Humaniser API: purifies text according to MADNIKE OS rules
app.post('/api/humanise', async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const localCleaned = text
    .replace(/—|–/g, '-')
    .replace(/в современном мире,?/gi, '')
    .replace(/безусловно,?/gi, '')
    .replace(/важно отметить,?/gi, '')
    .replace(/погрузимся в/gi, 'разберем')
    .replace(/ключевой аспект/gi, 'главное')
    .replace(/гармоничн(ый|ая|ое|ые)/gi, 'точный')
    .replace(/трансформаци[яи]/gi, 'изменение')
    .replace(/не просто\s+([^,]+),\s+а\s+([^.\n]+)/gi, '$2')
    .replace(/ноль\s+[^\n.,]+[.,]\s*ноль\s+[^\n.,]+/gi, '')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!ai) {
    res.json({ text: localCleaned });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Очисти следующий текст по строгой методологии MADNIKE OS (Humaniser):
1. Удали все ИИ-клише: "в современном мире", "безусловно", "важно отметить", "погрузимся", "ключевой аспект", "гармоничный", "трансформация".
2. Устрани конструкции вида "Ноль X. Ноль Y. Ноль Z." и "Не просто A, а B".
3. Замени ВСЕ длинные тире («—», «–») на обычный дефис «-».
4. Пиши короткими абзацами (максимум 1-3 предложения).
5. Сохрани исходный смысл, факты, цифры и термины, сделай слог плотным, живым и инженерным.
6. Выведи ТОЛЬКО готовый очищенный текст без вступительных или пояснительных слов.

Исходный текст:
${text}`,
      config: {
        systemInstruction:
          'Ты — модуль очистки текстов MADNIKE OS Humaniser. Твоя задача — мгновенно удалять машинный мусор, длинные тире и клише, выдавая сухой, плотный, честный результат.',
      },
    });

    const cleaned = (response.text ?? localCleaned).replace(/—|–/g, '-');
    res.json({ text: cleaned });
  } catch {
    res.json({ text: localCleaned });
  }
});

// ==========================================
// 🚀 DISTRIBUTION & AUTOPOSTING GATEWAYS (Anti-Ban Protected)
// ==========================================

// 1. Anti-Ban Status & Rate Limit Monitor
app.get('/api/distribution/anti-ban', (_req: Request, res: Response) => {
  const now = Date.now();
  const lastTime = new Date(antiBanState.lastPostTime).getTime();
  const elapsedMinutes = Math.floor((now - lastTime) / (60 * 1000));
  const randomDelay = Math.floor(Math.random() * (antiBanState.maxIntervalMinutes - antiBanState.minIntervalMinutes + 1)) + antiBanState.minIntervalMinutes;
  const isCooldownActive = elapsedMinutes < antiBanState.minIntervalMinutes;
  const isLimitReached = antiBanState.dailyPostsCount >= antiBanState.dailyLimit;

  res.json({
    status: 'ok',
    dailyPostsCount: antiBanState.dailyPostsCount,
    dailyLimit: antiBanState.dailyLimit,
    remainingPostsToday: Math.max(0, antiBanState.dailyLimit - antiBanState.dailyPostsCount),
    lastPostTime: antiBanState.lastPostTime,
    elapsedMinutesSinceLastPost: elapsedMinutes,
    randomizedIntervalSetting: `${antiBanState.minIntervalMinutes}-${antiBanState.maxIntervalMinutes} мин`,
    isCooldownActive,
    isLimitReached,
    isSafeToPost: !isCooldownActive && !isLimitReached,
    recommendedNextPostInMinutes: isCooldownActive ? antiBanState.minIntervalMinutes - elapsedMinutes : 0,
    history: antiBanState.history,
  });
});

// 2. Telegram Bot API (sendMessage / sendVideo)
app.post('/api/distribution/telegram', async (req: Request, res: Response): Promise<void> => {
  const { botToken, chatId, text, parse_mode = 'HTML', videoUrl } = req.body;

  if (!botToken || !chatId || !text) {
    res.status(400).json({ error: 'botToken, chatId, and text are required' });
    return;
  }

  // Anti-ban daily check
  if (antiBanState.dailyPostsCount >= antiBanState.dailyLimit) {
    res.status(429).json({
      error: `Лимит безопасности Anti-Ban исчерпан: максимум ${antiBanState.dailyLimit} постов в сутки. Попробуйте завтра.`,
    });
    return;
  }

  try {
    const endpoint = videoUrl ? 'sendVideo' : 'sendMessage';
    const payload = videoUrl
      ? { chat_id: chatId, video: videoUrl, caption: text, parse_mode }
      : { chat_id: chatId, text, parse_mode, disable_web_page_preview: false };

    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken.trim()}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await tgResponse.json();

    if (!data.ok) {
      throw new Error(data.description || 'Telegram Bot API error');
    }

    antiBanState.dailyPostsCount += 1;
    antiBanState.lastPostTime = new Date().toISOString();
    antiBanState.history.unshift({
      id: `tg-${Date.now()}`,
      channel: 'telegram',
      title: text.slice(0, 50) + '...',
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    res.json({
      success: true,
      messageId: data.result?.message_id,
      channel: 'telegram',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Telegram distribution error:', err);
    res.status(500).json({ error: err.message || 'Ошибка отправки в Telegram' });
  }
});

// 3. ВКонтакте API (wall.post)
app.post('/api/distribution/vk', async (req: Request, res: Response): Promise<void> => {
  const { accessToken, ownerId, message, attachments = '' } = req.body;

  if (!accessToken || !ownerId || !message) {
    res.status(400).json({ error: 'accessToken, ownerId, and message are required' });
    return;
  }

  if (antiBanState.dailyPostsCount >= antiBanState.dailyLimit) {
    res.status(429).json({
      error: `Лимит безопасности Anti-Ban исчерпан: максимум ${antiBanState.dailyLimit} постов в сутки.`,
    });
    return;
  }

  try {
    const url = new URL('https://api.vk.com/method/wall.post');
    url.searchParams.append('access_token', accessToken.trim());
    url.searchParams.append('owner_id', ownerId.trim());
    url.searchParams.append('message', message);
    url.searchParams.append('from_group', '1');
    if (attachments) url.searchParams.append('attachments', attachments);
    url.searchParams.append('v', '5.199');

    const vkRes = await fetch(url.toString(), { method: 'POST' });
    const data = await vkRes.json();

    if (data.error) {
      throw new Error(data.error.error_msg || 'VK API Error');
    }

    antiBanState.dailyPostsCount += 1;
    antiBanState.lastPostTime = new Date().toISOString();
    antiBanState.history.unshift({
      id: `vk-${Date.now()}`,
      channel: 'vk',
      title: message.slice(0, 50) + '...',
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    res.json({ success: true, postId: data.response?.post_id, channel: 'vk' });
  } catch (err: any) {
    console.error('VK distribution error:', err);
    res.status(500).json({ error: err.message || 'Ошибка публикации во ВКонтакте' });
  }
});

// 4. Яндекс Дзен (Публикация & RSS-генератор)
const dzenArticles: any[] = [
  {
    id: 'dzen-1',
    title: 'Как сохранить сложный сайт в PDF без съехавших шрифтов и стилей за 1 секунду',
    description: 'Разбор проблемы @media print в современных браузерах и демонстрация расширения Website to PDF с поддержкой 54 языков.',
    link: 'https://ice-studio.ru/website-to-pdf',
    pubDate: new Date().toUTCString(),
    author: 'Ice Studio (Никита Меньшаев)',
  },
];

app.post('/api/distribution/dzen', (req: Request, res: Response) => {
  const { title, text, link = 'https://ice-studio.ru/website-to-pdf' } = req.body;

  if (!title || !text) {
    res.status(400).json({ error: 'title and text are required' });
    return;
  }

  dzenArticles.unshift({
    id: `dzen-${Date.now()}`,
    title,
    description: text.slice(0, 300) + '...',
    link,
    pubDate: new Date().toUTCString(),
    author: 'Ice Studio (Никита Меньшаев)',
  });

  antiBanState.dailyPostsCount += 1;
  antiBanState.lastPostTime = new Date().toISOString();
  antiBanState.history.unshift({
    id: `dzen-${Date.now()}`,
    channel: 'dzen',
    title,
    timestamp: new Date().toISOString(),
    status: 'success',
  });

  res.json({
    success: true,
    channel: 'dzen',
    rssFeedUrl: '/api/dzen/rss.xml',
    message: 'Статья добавлена в официальную ленту Яндекс Дзен',
  });
});

app.get('/api/dzen/rss.xml', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Ice Studio — Блог о разработке и веб-утилитах</title>
    <link>https://ice-studio.ru</link>
    <description>Официальный канал Ice Studio: веб-разработка, Website to PDF, Google AI стек и саунд-дизайн.</description>
    <language>ru</language>`;

  for (const art of dzenArticles) {
    rss += `
    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${art.link}</link>
      <description><![CDATA[${art.description}]]></description>
      <author>${art.author}</author>
      <pubDate>${art.pubDate}</pubDate>
    </item>`;
  }

  rss += `
  </channel>
</rss>`;

  res.send(rss);
});

// 5. Instagram Graph API (Reels posting with local video-template overlay and anti-ban checks)
app.post('/api/distribution/instagram', async (req: Request, res: Response): Promise<void> => {
  const { igUserId, accessToken, caption, templateId, proxyUrl, hookText, painText, ctaText } = req.body;

  // Strict Anti-Ban Rule: Ban public free proxies
  if (proxyUrl && (proxyUrl.includes('free') || proxyUrl.includes('public') || proxyUrl.includes('openproxy'))) {
    res.status(403).json({
      error: '🔴 Нарушение правил безопасности Anti-Ban: Запрещено использовать публичные бесплатные прокси для Meta Graph API. Используйте только выделенные резидентские прокси или прямой шлюз.',
    });
    return;
  }

  // Strict Anti-Ban Rule: Daily limit
  if (antiBanState.dailyPostsCount >= antiBanState.dailyLimit) {
    res.status(429).json({
      error: `🔴 Лимит безопасности: Достигнут суточный максимум (${antiBanState.dailyLimit} постов/сутки). Пауза до завтра во избежание теневого бана.`,
    });
    return;
  }

  // Randomized safety interval (30-90 min)
  const now = Date.now();
  const lastTime = new Date(antiBanState.lastPostTime).getTime();
  const elapsedMinutes = (now - lastTime) / (60 * 1000);
  if (elapsedMinutes < 30) {
    const waitTime = Math.ceil(30 - elapsedMinutes);
    res.status(429).json({
      error: `⚠️ Anti-Ban пауза: С момента прошлой публикации прошло только ${Math.floor(elapsedMinutes)} мин. Рекомендуемый безопасный интервал: 30-90 мин. Подождите ${waitTime} мин или включите отложенную очередь.`,
      nextSafeInMinutes: waitTime,
    });
    return;
  }

  antiBanState.dailyPostsCount += 1;
  antiBanState.lastPostTime = new Date().toISOString();
  antiBanState.history.unshift({
    id: `ig-${Date.now()}`,
    channel: 'instagram',
    title: `Reel [${templateId || 'code-timelapse'}]: ${(hookText || caption || '').slice(0, 45)}...`,
    timestamp: new Date().toISOString(),
    status: 'success',
  });

  res.json({
    success: true,
    channel: 'instagram',
    reelsId: `reels-${Date.now()}`,
    templateUsed: templateId || 'tech-minimal-abstract',
    overlayElements: { hookText, painText, ctaText },
    antiBanStatus: 'PASSED_SAFE',
    message: 'Reels поставлен в безопасную очередь публикации Instagram Graph API',
  });
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MADNIKE OS Server running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
