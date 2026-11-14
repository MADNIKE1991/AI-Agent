export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isProof?: boolean;
  ritualType?: 'start' | 'finish' | 'unpack' | 'research';
}

export interface MemoryRuleFile {
  name: string;
  filename: string;
  description: string;
  rule: string;
  why: string;
  howToApply: string;
  updatedAt: string;
}

export interface BusinessDocument {
  id: string;
  path: string;
  title: string;
  category: 'core' | 'audience' | 'products' | 'marketing' | 'processes';
  content: string;
  updatedAt: string;
}

export interface FourLayersMemory {
  // Layer 1: "Сейчас" (Active Session Window)
  layer1_now: {
    sessionActive: boolean;
    sessionStartTime: string | null;
    currentTask: string;
    scratchpad: string;
    tokensEstimated: number;
    activeBlock?: number;
  };

  // Layer 2: "Недавнее" (memory/)
  layer2_recent: {
    memoryIndexContent: string;
    rules: MemoryRuleFile[];
  };

  // Layer 3: "Постоянное" (.business/)
  layer3_permanent: {
    documents: BusinessDocument[];
  };

  // Layer 4: "Навыки" (.business/processes/)
  layer4_skills: {
    humaniserPrompt: string;
    deepResearchSteps: {
      step: number;
      name: string;
      desc: string;
      isGate?: boolean;
    }[];
    huntLadder: {
      level: number;
      name: string;
      mindset: string;
      contentGoal: string;
    }[];
    constitutionText: string;
  };
}

export interface UnpackBlock {
  id: number;
  title: string;
  subtitle: string;
  promptQuestion: string;
  placeholder: string;
  userAnswer: string;
  status: 'empty' | 'filled' | 'sent_to_agent';
}

export interface FinancialPlan {
  quarterGoalRub: number;
  coreOfferPriceRub: number;
  landingConversionRate: number; // e.g. 3%
  salesConversionRate: number;   // e.g. 15%
  avgReachPerPost: number;       // e.g. 1000
}

export interface AICampStage {
  id: string;
  code: string;
  title: string;
  tagline: string;
  deliverables: string[];
  checklist: string[];
  promptTemplate: string;
  isSpecial?: boolean;
}

// 12-Step Deep Research Types (Section 6.2)
export type ResearchStepStatus = 'pending' | 'in_progress' | 'gate_pending' | 'completed';

export interface FactOpinionItem {
  id: string;
  type: 'fact' | 'opinion';
  content: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface DeepResearchStep {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  isGate?: boolean;
  status: ResearchStepStatus;
  userNotes: string;
  findings: string;
  gateCriteria?: string[];
  gateApproved?: boolean;
}

export interface DeepResearchProject {
  id: string;
  title: string;
  niche: string;
  question: string;
  hypothesis: string;
  currentStep: number;
  steps: DeepResearchStep[];
  factsAndOpinions: FactOpinionItem[];
  finalOutputReport: string;
  updatedAt: string;
}

// Content Factory (Контент-завод) Types
export type HuntLevel = 0 | 1 | 2 | 3 | 4;

export interface ContentPlanItem {
  id: string;
  dayIndex: number;
  dayName: string;
  dateStr: string;
  huntLevel: HuntLevel;
  huntStageName: string;
  format: 'reel' | 'post' | 'carousel' | 'case' | 'offer';
  formatTitle: string;
  hook: string;
  coreIdea: string;
  ctaText: string;
  codeWord: string;
  channels: ('tg' | 'vk' | 'dzen' | 'ig')[];
  status: 'planned' | 'drafted' | 'published';
}

export interface ReelScene {
  id: number;
  timeRange: string;
  durationSec: number;
  visualType: 'screencast' | 'talking_head' | 'b_roll' | 'split' | 'graphic' | 'demo';
  visualDesc: string;
  subtitles: string;
  highlightWords: string[];
  voiceoverText: string;
  sfx: string;
}

export interface ReelProject {
  id: string;
  title: string;
  formatType: string;
  targetDurationSec: number;
  hookHeadline: string;
  scenes: ReelScene[];
  ctaCodeWord: string;
  audioPrompt: string;
  aspectRatio: '9:16';
}

export interface MultiPostItem {
  id: string;
  topic: string;
  createdAt: string;
  status: {
    telegram: 'draft' | 'sent' | 'failed';
    vk: 'draft' | 'copied';
    dzen: 'draft' | 'copied';
    instagram: 'draft' | 'copied';
  };
  versions: {
    telegram: string;
    vk: string;
    dzen: string;
    instagram: string;
  };
  telegramConfig?: {
    botToken?: string;
    chatId?: string;
    lastSentAt?: string;
  };
}

export interface YouTubeSlide {
  id: number;
  slideNumber: number;
  timeRange: string;
  durationSec: number;
  type: 'pain' | 'code' | 'diagram' | 'demo' | 'proof' | 'cta';
  title: string;
  bulletPoints: string[];
  codeSnippet?: string;
  interfaceBadge?: string;
  voiceoverText: string;
  onScreenText: string;
}

export interface YouTubeProject {
  id: string;
  title: string;
  targetDuration: 'shorts_60s' | 'video_180s';
  huntStage: string;
  hook: string;
  slides: YouTubeSlide[];
  seoDescription: string;
  landingUrl: string;
  tags: string[];
}

export interface VideoTemplate {
  id: string;
  name: string;
  category: string;
  themeColor: 'emerald' | 'amber' | 'purple' | 'sky';
  description: string;
  previewAnimation: string;
  recommendedHook: string;
}

export interface AntiBanStatus {
  dailyPostsCount: number;
  dailyLimit: number;
  remainingPostsToday: number;
  lastPostTime: string;
  elapsedMinutesSinceLastPost: number;
  randomizedIntervalSetting: string;
  isCooldownActive: boolean;
  isLimitReached: boolean;
  isSafeToPost: boolean;
  recommendedNextPostInMinutes: number;
  history: {
    id: string;
    channel: 'telegram' | 'vk' | 'dzen' | 'instagram';
    title: string;
    timestamp: string;
    status: 'success' | 'queued' | 'failed';
  }[];
}
