import { FourLayersMemory, MemoryRuleFile } from '../types/ivanos.ts';

export const BANNED_PATTERNS = [
  { pattern: /в современном мире/gi, name: '«в современном мире»' },
  { pattern: /безусловно/gi, name: '«безусловно»' },
  { pattern: /важно отметить/gi, name: '«важно отметить»' },
  { pattern: /погрузимся/gi, name: '«погрузимся»' },
  { pattern: /ключевой аспект/gi, name: '«ключевой аспект»' },
  { pattern: /гармоничн(ый|ая|ое|ые)/gi, name: '«гармоничный»' },
  { pattern: /трансформаци[яи]/gi, name: '«трансформация»' },
  { pattern: /—|–/g, name: 'Длинное тире («—» или «–»)' },
  { pattern: /не просто\s+[^,]+,\s+а\s+[^.\n]+/gi, name: 'Паттерн «Не просто А, а Б»' },
  { pattern: /ноль\s+[^\n.,]+[.,]\s*ноль\s+[^\n.,]+/gi, name: 'Паттерн «Ноль X. Ноль Y.»' },
];

export function detectCliches(text: string): {
  count: number;
  matches: string[];
  hasLongDashes: boolean;
  longParagraphsCount: number;
} {
  const matches: string[] = [];
  let count = 0;
  let hasLongDashes = false;

  for (const item of BANNED_PATTERNS) {
    const found = text.match(item.pattern);
    if (found && found.length > 0) {
      count += found.length;
      matches.push(`${item.name} (${found.length})`);
      if (item.name.includes('тире')) {
        hasLongDashes = true;
      }
    }
  }

  // Count paragraphs with > 3 sentences
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  let longParagraphsCount = 0;
  for (const p of paragraphs) {
    const sentences = p.split(/[.!?]+\s+/).filter((s) => s.trim().length > 10);
    if (sentences.length > 3) {
      longParagraphsCount++;
    }
  }

  return { count, matches, hasLongDashes, longParagraphsCount };
}

export function cleanIvanOSText(text: string): string {
  let cleaned = text
    .replace(/—|–/g, '-')
    .replace(/в современном мире,?/gi, '')
    .replace(/безусловно,?/gi, '')
    .replace(/важно отметить,?/gi, '')
    .replace(/погрузимся в/gi, 'разберем')
    .replace(/погрузимся/gi, 'перейдем')
    .replace(/ключевой аспект/gi, 'главное')
    .replace(/гармоничн(ый|ая|ое|ые)/gi, 'точный')
    .replace(/трансформаци[яи]/gi, 'изменение')
    .replace(/не просто\s+([^,]+),\s+а\s+([^.\n]+)/gi, '$2')
    .replace(/[ \t]+/g, ' ')
    .trim();

  return cleaned;
}

export function extractFeedbackRule(responseText: string): {
  ruleFile: MemoryRuleFile | null;
  memoryIndexLine: string | null;
} {
  // Look for YAML frontmatter feedback rule block
  // ---
  // name: feedback_...
  // description: ...
  // type: feedback
  // ---
  const yamlMatch = responseText.match(/---\s*\n([\s\S]*?)\n---/);
  if (!yamlMatch) return { ruleFile: null, memoryIndexLine: null };

  const frontmatter = yamlMatch[1];
  const nameMatch = frontmatter.match(/name:\s*(feedback_[a-zA-Z0-9_-]+)/);
  const descMatch = frontmatter.match(/description:\s*(.+)/);

  if (!nameMatch) return { ruleFile: null, memoryIndexLine: null };

  const name = nameMatch[1].trim();
  const description = descMatch ? descMatch[1].trim() : 'Правило работы сессии';

  // Extract rule body
  const ruleMatch = responseText.match(/\*\*Правило:\*\*\s*([^\n]+)/);
  const whyMatch = responseText.match(/\*\*Почему:\*\*\s*([^\n]+)/);
  const howMatch = responseText.match(/\*\*Как применять:\*\*\s*([^\n]+)/);

  const rule = ruleMatch ? ruleMatch[1].trim() : 'Соблюдать стандарты IvanOS';
  const why = whyMatch ? whyMatch[1].trim() : 'На основе уроков текущей сессии';
  const howToApply = howMatch ? howMatch[1].trim() : 'Проверять в начале каждого ответа';

  // Look for index link line: - [Title](memory/...) - hook
  const linkMatch = responseText.match(/- \[[^\]]+\]\(memory\/[^)]+\)[^\n]+/);
  const memoryIndexLine = linkMatch ? linkMatch[0] : `- [${description}](memory/${name}.md) - ${rule}`;

  return {
    ruleFile: {
      name,
      filename: `${name}.md`,
      description,
      rule,
      why,
      howToApply,
      updatedAt: new Date().toISOString().split('T')[0],
    },
    memoryIndexLine,
  };
}

export function exportAllMemoryAsMarkdown(memory: FourLayersMemory): string {
  let doc = `# IVANOS AGENT — ПОЛНЫЙ ДАМП БАЗЫ ЗНАНИЙ И ПАМЯТИ
Сгенерировано: ${new Date().toLocaleString('ru-RU')}
Версия: Google AI Studio Complete Edition

================================================================================
СЛОЙ 1: «СЕЙЧАС» (КОНТЕКСТ СЕССИИ)
================================================================================
Текущая задача: ${memory.layer1_now.currentTask}
Статус сессии: ${memory.layer1_now.sessionActive ? 'Активна' : 'Закрыта'}
Блокнот сессии:
${memory.layer1_now.scratchpad}

================================================================================
СЛОЙ 2: «НЕДАВНЕЕ» (ПАМЯТЬ СЕССИЙ / MEMORY/)
================================================================================
${memory.layer2_recent.memoryIndexContent}

`;

  for (const rule of memory.layer2_recent.rules) {
    doc += `---
Файл: memory/${rule.filename}
Описание: ${rule.description}
Правило: ${rule.rule}
Почему: ${rule.why}
Как применять: ${rule.howToApply}
\n`;
  }

  doc += `
================================================================================
СЛОЙ 3: «ПОСТОЯННОЕ» (ПАСПОРТ БИЗНЕСА .BUSINESS/)
================================================================================
`;

  for (const bdoc of memory.layer3_permanent.documents) {
    doc += `\n################################################################################
# ФАЙЛ: ${bdoc.path} (${bdoc.title})
################################################################################\n
${bdoc.content}\n`;
  }

  doc += `
================================================================================
СЛОЙ 4: «НАВЫКИ» (РЕГЛАМЕНТЫ И МЕТОДЫ)
================================================================================
${memory.layer4_skills.constitutionText}
`;

  return doc;
}
