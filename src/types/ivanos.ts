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
