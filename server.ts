import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
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
    hasApiKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
    edition: 'IvanOS Google AI Studio Complete Edition',
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

  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check your AI Studio Secrets panel.',
    });
    return;
  }

  try {
    // Transform chat messages into contents format for Gemini 3.8 Flash
    // Combine multi-turn history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const config: {
      systemInstruction?: string;
    } = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

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
        const text = chunk.text || '';
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

      res.json({
        text: response.text ?? '',
      });
    }
  } catch (error: any) {
    console.error('Error generating content with Gemini:', error);
    const errorMessage = error?.message || 'Failed to generate response';
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }
});

// Humaniser API: specifically purifies text according to IvanOS rules
app.post('/api/humanise', async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  if (!ai) {
    // Algorithmic fallback rule engine if no API key
    const cleaned = text
      .replace(/—|–/g, '-')
      .replace(/в современном мире,?/gi, '')
      .replace(/безусловно,?/gi, '')
      .replace(/важно отметить,?/gi, '')
      .replace(/погрузимся в/gi, 'разберем')
      .replace(/ключевой аспект/gi, 'главное')
      .replace(/гармоничн(ый|ая|ое|ые)/gi, 'точный')
      .replace(/трансформаци[яи]/gi, 'изменение')
      .replace(/не просто\s+([^,]+),\s+а\s+([^.\n]+)/gi, '$2')
      .trim();
    res.json({ text: cleaned });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Очисти следующий текст по строгой методологии IvanOS (Humaniser):
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
          'Ты — модуль очистки текстов IvanOS Humaniser. Твоя задача — мгновенно удалять машинный мусор, длинные тире и клише, выдавая сухой, плотный, честный результат.',
      },
    });

    // Make sure we sanitize any rogue long dashes that might slip through
    const cleaned = (response.text ?? '').replace(/—|–/g, '-');
    res.json({ text: cleaned });
  } catch (error: any) {
    console.error('Humaniser error:', error);
    res.status(500).json({ error: error?.message || 'Humaniser failed' });
  }
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`IvanOS Server running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
